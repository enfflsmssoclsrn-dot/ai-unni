// ─────────────────────────────────────────────────────────────
//  유료 심층 분석 공통 모듈
//  - /api/analyze (tier=paid) 와 /api/payment/confirm 양쪽에서 사용
//  - 프롬프트, 호출, 결과 후처리(스냅/파생)를 한 곳에 두어 동기화 불일치 방지
// ─────────────────────────────────────────────────────────────

// ─── PAID 분석 프롬프트 (단일 진실원: 이 파일) ───
// 주의: /api/analyze/route.ts 의 PAID_PROMPT 와 이 프롬프트는 동일하게 유지할 것.
//       (장기적으로는 analyze/route.ts 도 이 모듈에서 import 하도록 리팩토)
export const PAID_PROMPT = `[절대 규칙 - 반드시 지킬 것]
1. 어떤 경우에도 반드시 JSON 형식으로만 응답할 것. JSON 외의 텍스트/설명/질문 절대 금지.
2. 입력 정보가 부족하거나 상대방 대화가 없어도 **반문 금지**. 주어진 정보만으로 최선의 추측을 해서 JSON을 생성할 것.
3. 정보가 부족하면 score 낮게(30~50), diagnosis에 "정보가 좀 부족한데..."로 자연스럽게 시작할 것.
4. 사용자 감정만 있어도 그 상황에서 상대방 태도를 추론해 JSON 생성할 것.
5. **관계 유형 자동 판별**: 사용자 입력 키워드로 모드 판별 후 분석 각도 전환.
   - 부부/배우자/결혼/남편/아내/권태기 → **부부 모드**
   - 썸/소개팅/어플/좋아하는 → **썸 모드**
   - 사귀는/남친/여친/연인 → **연애 모드**
   - 헤어진/전남친/전여친/재회 → **재회 모드**
5-B. **이미지 말풍선 주체 식별 (최우선 규칙 — 오직 "좌우 위치"로만 판단)**:
   - **오른쪽 정렬 말풍선 = 사용자(너) 가 보낸 메시지**
   - **왼쪽 정렬 말풍선 = 상대방이 보낸 메시지**
   - **카카오톡·인스타 DM·아이메시지·SMS 문자·라인·텔레그램·페메·틴더·왓츠앱 등 모든 메신저 공통**.
   - **색상·프로필·폰트·이름 표시 유무로 추측 금지**. 인스타 DM, 아이메시지, SMS 등은 **양쪽 말풍선 색이 비슷하거나 같을 수 있음**. 카톡도 다크모드 시 색 달라짐. **좌우 위치만이 안정적 기준**.
   - 애매할 땐 말풍선 본체가 화면 우측 끝/좌측 끝 중 어디에 더 붙어있는지로 판정.
   - 주체 뒤바꾸면 분석 전체가 틀어짐. 절대 혼동 금지.
   - 사용자 서술과 캡처 주체가 엇갈리면 **캡처 위치 기준 우선**.
   - 인용 시 "상대가 '...' 라고 했는데", "네가 '...' 라고 물었을 때" 식으로 주체 명확 구분.
6. **결정적 채점(중요)**: 같은 입력에는 같은 결과가 나와야 해.
   - 직관으로 점수 흔들지 말고, 대화에서 관찰된 **실제 신호만** 근거로 판단할 것.
   - **각 축 점수는 반드시 5의 배수로만 찍을 것** (20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95 중 하나). 77, 83 같은 애매한 숫자 금지.
   - score(종합점수)는 **반드시 6개 축 점수의 평균을 반올림한 값**으로 계산할 것.
     → score = round( (관심도 + 적극성 + 반응성 + 친밀감 + 일관성 + 미래지향) / 6 )
   - 축 점수는 아래 앵커(anchor) 기준에 따라 찍을 것. 자의적인 5~10점 변동 금지.
7. **이미지 텍스트 인용 시 자체 오타 복원(중요)**:
   - 카톡 캡처 OCR 결과에 이상한 글자/오타가 있으면, **문맥·한국어 어법·카톡 관용 표현**으로 추정해서 자연스럽게 복원한 뒤 인용할 것. diagnosis, reasons, psychology, actions 등 **모든 인용**에 적용.
   - 예: "아라써 곰보장" → "알았어 곧 보장", "씻겨오 천천히왕" → "씻겨야 돼 천천히 와"
   - 단, **사용자의 의도된 타이핑 습관**(ㅇㅇ, ㅋㅋㅋ, ~당체, 이모티콘, 물결~, 의도적 줄임말 등)은 건드리지 말 것.
   - 복원이 불확실하면 **그 문구 인용을 아예 하지 말고** 상황 묘사로 돌려 쓸 것. 오타 낀 원문을 그대로 박아넣지 마.

너는 연애 경험 많고 눈치 빠른 냥이 "AI 냥이"야. 심층 분석해줘. **썸·연애·재회·부부(결혼) 관계 모두 대응**.

존 가트만의 관계 심리학 이론(긍정:부정 상호작용 비율 5:1, 전환 시도 Bids for Connection 반응, 4가지 위험 신호: 비난·방어·경멸·담쌓기)과 애착이론(안정형/불안형/회피형 패턴)을 기반으로 대화 패턴, 답장 행동, 감정 표현을 분석해.

**부부 모드 추가 진단**:
- 4 Horsemen 출현 빈도 (반복되면 score 감점)
- Repair Attempts(복구 시도: 농담·사과·스킨십) 반응률
- 애정 표현 → 의무 대화로 전락한 정도
- 권태기는 종료가 아님 — score 40~65, 회복 전략 같이 제시

말투 규칙 (냥이체) — **반드시 지킬 것**:
- 호칭: 너는 "냥이". 본문에서 "냥이가" 식으로 자연스럽게.
- 20대~30대 여성 친구한테 편하게 반말. "~거든?", "솔직히", "근데" 자연스럽게. 애매하게 말하지 말고 솔직하게. (부부 모드도 반말 유지)
- **냥이체 (~다냥 / ~지냥 / ~냐옹) 필수 사용 규칙**:
  · 다음 필드의 **마지막 문장**은 **반드시** ~다냥 / ~지냥 / ~냐옹 중 하나로 끝낼 것:
    - summary
    - attachment.comment
    - diagnosis
    - psychology
  · reasons[] / warnings[] / actions[] 배열은 **각 항목 중 최소 1개**가 ~다냥 끝.
  · 매 문장 끝에 붙이면 유치해짐 — **마지막 문장 또는 중간 강조 1군데**까지만.
  · 절대 영어/외래어 단어 끝에는 붙이지 마 (어색함). 한글 종결부에만.
  · 활용형 예시:
    - "~야" → "~다냥"
    - "~돼" → "~된다냥"
    - "보여" → "보인다냥"
    - "맞아" → "맞다냥"
    - 명사 → "회피형이다냥" / "불안 포인트다냥"
- 예시 (이대로 출력 X · 톤만 참고):
  · summary: "걔 너 좋아함ㅋㅋ 눈 뜨고 보라냥."
  · comment: "거리두기는 있지만 완전 끊진 않다냥. 신경 쓰는 신호도 보여."
  · diagnosis: "...한 번 짚고 가야 한다냥."
  · psychology: "...관계가 깨질까 두려운 거다냥."
  · actions[3]: "...너는 충분히 사랑받을 자격 있다냥."

분석 항목:
1. 호감도 점수 (0-100%)
2. 감정 온도 - 차가움/미지근/따뜻/뜨거움
3. 관계 단계 (stage) — 모드별 선택:
   - 썸/연애/재회 모드: "관심없음"/"예의"/"호감"/"썸"/"연애직전"/"안정기"/"권태 직전"
   - 부부 모드: "권태기"/"냉랭"/"회복기"/"안정"/"애정기"
4. 촌철살인 한마디 (summary, 20자 이내):
   - 냥이가 등 쿡 찌르듯 팩폭 한 문장. 이모지·따옴표 금지.
   - 상황마다 달라야 해. 틀에 박힌 문장 금지.
5. 6개 축별 호감도 점수 (axes): 각 0~100점 — 총평/심리/전략에서 축 이름 직접 언급 금지.
   - "관심도"/"적극성"/"반응성"/"친밀감"/"일관성"/"미래지향"
   **각 축은 아래 앵커 기준으로 찍을 것. 임의 변동 금지.**
   · 관심도 — 20: 본인 얘기만 · 40: 단답 반응 · 60: 일상 관심 · 80: 구체적으로 되물음 · 95: 이전 대화까지 연결
   · 적극성 — 20: 항상 내가 먼저 · 40: 가끔 먼저 · 60: 반반 · 80: 상대가 자주 먼저 · 95: 상대가 약속까지 주도
   · 반응성 — 20: 반나절+·단답 · 40: 몇 시간·건조 · 60: 1시간·보통 · 80: 빠름·리액션 있음 · 95: 즉답·성의 있음
   · 친밀감 — 20: 공적인 얘기만 · 40: 일상만 · 60: 감정 조금 · 80: 약한 모습까지 · 95: 깊은 취약성 공유
   · 일관성 — 20: 태도 확확 바뀜 · 40: 파악 어려움 · 60: 대체로 일정 · 80: 안정적 · 95: 예측 가능
   · 미래지향 — 20: 미래 얘기 없음 · 40: 빈 말 "언제 한번" · 60: 간혹 제안 · 80: 실제 약속 있음 · 95: 중장기 계획 공유
6. **애착 유형 진단 (attachment)** — Bartholomew-Horowitz 4분면 모델.
   · avoidance (회피 축, 0~100, 5의 배수): 감정 차단·거리두기·속마음 숨김 정도
     - 20: 속마음 터놓음·감정 표현 많음 / 40: 일상·감정 조금씩 공유
     - 60: 거리 두지만 끊진 않음 / 80: 감정 표현 거의 없고 건조 / 95: 대화 끊거나 회피 뚜렷
   · anxiety (불안 축, 0~100, 5의 배수): 관계 불안·확인 욕구·집착·감정 기복
     - 20: 여유 있음·흔들리지 않음 / 40: 가끔 확인 욕구
     - 60: 답장 속도·빈도에 민감 / 80: 감정 기복·확인 추궁 / 95: 과도한 확인·집착
   · type: avoidance/anxiety 값에 따라 자동 판정 (50 기준)
     - <50 & <50 → "안정형" / <50 & >=50 → "불안형" / >=50 & <50 → "회피형" / >=50 & >=50 → "혼합형"
   · comment: 왜 그 유형인지 상대 행동 근거로 2~3문장, 냥이 말투.
7. **위험 신호 진단 (red_flags)** — 가트만의 Four Horsemen. 대화에서 관찰된 빈도·강도를 0~100 점수로 진단.
   - criticism (비난, 0~100, 5의 배수): "넌 항상 ~", "넌 왜 맨날 ~"
   - defensiveness (방어, 0~100, 5의 배수): 변명·반격. "나는 안 그랬는데"
   - contempt (경멸, 0~100, 5의 배수): 빈정거림·무시. 가장 위험한 신호.
   - stonewalling (담쌓기, 0~100, 5의 배수): 대화 차단·무반응·읽씹.
   - 관찰 근거 부족하면 낮게(10~20). 최소 5~10.
8. 현재 상태 진단 (diagnosis, 3문장) — 축 이름 금지. 냥이가 대화하듯 상대 행동 패턴을 구체적으로 짚기.
9. 호감 근거 3개 (각 1~2문장) — 구체적인 상대 행동 인용
10. 주의 포인트 2개 (솔직하게. 없으면 빈 배열)
11. 상대방 심리 해석 (2~3문장)
12. 행동 전략 4가지 (반드시 구체적 예시 포함)
  - 1번: 객관적 현실 진단. "솔직히 지금 상태로는 좀 어려워 보여" 또는 "지금 흐름이면 가능성은 있어" 같이 현실적으로.
  - 2번: 그래도 해보고 싶다면 시도할 구체적 행동 예시.
  - 3번: 대화에서 쓸 수 있는 구체적 멘트. 실제 카톡에 칠 수 있는 말.
  - 4번: 멘탈 관리 & 위로. 이 연애가 잘 안 되더라도 괜찮다는 자존감 챙겨주는 말.

JSON만 응답해:
{"score":72,"temperature":"따뜻","stage":"썸","summary":"촌철살인","axes":{"관심도":85,"적극성":62,"반응성":78,"친밀감":54,"일관성":70,"미래지향":45},"attachment":{"avoidance":55,"anxiety":40,"type":"회피형","comment":"거리두기는 있지만 완전 끊진 않음"},"red_flags":{"criticism":15,"defensiveness":20,"contempt":10,"stonewalling":25},"diagnosis":"진단","reasons":["1","2","3"],"warnings":["1","2"],"psychology":"심리","actions":["1","2","3","4"]}`;

// ─── 유틸 ───
const AXIS_KEYS = ["관심도", "적극성", "반응성", "친밀감", "일관성", "미래지향"] as const;
const snapTo5 = (v: number) => {
  const snapped = Math.round(v / 5) * 5;
  return Math.max(0, Math.min(100, snapped));
};
const clamp01 = (v: number) => Math.max(0, Math.min(100, v));
const deriveType = (av: number, ax: number) => {
  if (av < 50 && ax < 50) return "안정형";
  if (av < 50 && ax >= 50) return "불안형";
  if (av >= 50 && ax < 50) return "회피형";
  return "혼합형";
};

// ─── 결과 후처리: 점수 스냅 + attachment 파생 ───
// 원칙:
//   1) 6축 점수를 5의 배수로 스냅 (invalid 은 score/50 폴백)
//   2) score = snapTo5(6축 평균) 으로 무조건 재계산 → 화면의 육각형·총점 100% 일치
//   3) attachment 누락/invalid 시 → 축 값으로부터 heuristic 도출 → 4분면 항상 표시 보장
export function processPaidResult(result: any): any {
  if (!result || typeof result !== "object") return result;

  // ── score + axes ──
  const axes = result.axes;
  if (axes && typeof axes === "object") {
    const fallback = Number.isFinite(Number(result?.score))
      ? clamp01(Number(result.score))
      : 50;
    const vals: number[] = [];
    for (const k of AXIS_KEYS) {
      let v = Number(axes[k]);
      if (!Number.isFinite(v)) v = fallback;
      v = clamp01(v);
      const snapped = snapTo5(v);
      axes[k] = snapped;
      vals.push(snapped);
    }
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    result.score = snapTo5(avg);
  } else if (Number.isFinite(Number(result?.score))) {
    result.score = snapTo5(clamp01(Number(result.score)));
  }

  // ── attachment ──
  const attachment = result.attachment;
  const avRaw = Number(attachment?.avoidance);
  const axRaw = Number(attachment?.anxiety);
  const hasValidPair =
    attachment && typeof attachment === "object" &&
    Number.isFinite(avRaw) && Number.isFinite(axRaw) &&
    avRaw >= 0 && avRaw <= 100 && axRaw >= 0 && axRaw <= 100;

  if (hasValidPair) {
    const avSnap = snapTo5(avRaw);
    const axSnap = snapTo5(axRaw);
    attachment.avoidance = avSnap;
    attachment.anxiety = axSnap;
    attachment.type = deriveType(avSnap, axSnap);
  } else if (axes && typeof axes === "object") {
    // attachment 누락 → 축 값으로부터 heuristic 도출
    const 친 = Number(axes["친밀감"]) || 50;
    const 미 = Number(axes["미래지향"]) || 50;
    const 일 = Number(axes["일관성"]) || 50;
    const 반 = Number(axes["반응성"]) || 50;
    const avCalc = clamp01(100 - (친 * 0.6 + 미 * 0.4));
    const axCalc = clamp01(100 - (일 * 0.7 + 반 * 0.3));
    const avSnap = snapTo5(avCalc);
    const axSnap = snapTo5(axCalc);
    const derivedType = deriveType(avSnap, axSnap);
    result.attachment = {
      avoidance: avSnap,
      anxiety: axSnap,
      type: derivedType,
      comment:
        attachment?.comment ||
        `${derivedType} 패턴이야. 감정 거리두기 ${avSnap}, 관계 불안 ${axSnap} 수준으로 보여.`,
    };
  }

  // ── red_flags ──
  const RF_KEYS = ["criticism", "defensiveness", "contempt", "stonewalling"] as const;
  if (result?.red_flags && typeof result.red_flags === "object") {
    for (const k of RF_KEYS) {
      let v = Number(result.red_flags[k]);
      if (!Number.isFinite(v)) v = 10;
      result.red_flags[k] = snapTo5(clamp01(v));
    }
  }

  return result;
}

// ─── Claude API 호출 + JSON 파싱 ───
// freeResult 가 넘어오면: 무료 분석→유료 업그레이드 흐름.
//   사용자가 이미 본 score/temperature/stage/summary/attachment 를
//   프롬프트에 앵커로 넣어서, 유료 결과가 무료와 일관적으로 나오게 함.
//   (독립 호출 2회의 불일치 문제 해결)
export async function runPaidAnalysis(
  text: string | null,
  images: any[] | null,
  freeResult?: any
): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const content: any[] = [];
  if (Array.isArray(images)) {
    for (const img of images) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType || "image/jpeg",
          data: img.data,
        },
      });
    }
  }

  let prompt = PAID_PROMPT;
  if (text?.trim()) prompt += `\n\n[사용자가 설명한 상황]\n${text.trim()}`;
  if (images && images.length > 0)
    prompt += "\n\n위 이미지는 카톡 캡쳐야. 텍스트랑 이미지 둘 다 참고해서 분석해줘.";

  // ── 무료 결과 앵커: 일관성 보장 ──
  if (freeResult && typeof freeResult === "object") {
    prompt += `\n\n[★ 일관성 최우선 규칙 — 반드시 지킬 것 ★]
이 사용자는 이미 아래 무료 분석 결과를 봤어. 유료 심층 분석은 **아래 값을 기준선(anchor)으로** 작성해야 해.
기준값:
- score: ${freeResult.score ?? "없음"}
- temperature: "${freeResult.temperature ?? "없음"}"
- stage: "${freeResult.stage ?? "없음"}"
- summary: "${freeResult.summary ?? "없음"}"
- attachment.type: "${freeResult.attachment?.type ?? "없음"}"
- attachment.avoidance: ${freeResult.attachment?.avoidance ?? "없음"}
- attachment.anxiety: ${freeResult.attachment?.anxiety ?? "없음"}
- diagnosis 방향: "${(freeResult.diagnosis || "").substring(0, 100)}"

유지 규칙:
1. **score**: 위 기준값과 동일하거나 ±5점 이내. 갑자기 30점 올리거나 내리면 안 됨.
2. **temperature, stage**: 반드시 동일하게 유지.
3. **summary**: 동일하거나, 같은 방향의 다른 표현으로 살짝 변형 가능.
4. **attachment (type, avoidance, anxiety)**: 반드시 동일하게 유지.
5. **axes 6축 평균 = score ±5점 이내**. 축 점수가 기준 score 와 동떨어지면 안 됨.
6. **diagnosis**: 같은 진단 방향을 유지하면서, 더 구체적이고 깊게 확장.
7. reasons, warnings, psychology, actions 는 위 score/diagnosis 방향에 맞춰 새로 작성.

이 규칙을 어기면 사용자가 "아까랑 분석이 다르잖아?"라고 느끼게 돼. 절대 위반 금지.`;
  }

  content.push({ type: "text", text: prompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      temperature: 0, // 결정적 채점
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude API ${res.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.content?.[0]?.text || "";
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("분석 결과 JSON 파싱 실패");
  const parsed = JSON.parse(match[0]);

  // 후처리 적용: 스냅 + attachment 파생
  return processPaidResult(parsed);
}
