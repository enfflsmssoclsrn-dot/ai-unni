const FREE_PROMPT = `[절대 규칙 - 반드시 지킬 것]
1. 어떤 경우에도 반드시 JSON 형식으로만 응답할 것. JSON 외의 텍스트/설명/질문 절대 금지.
2. 입력 정보가 부족하거나 상대방 대화가 없어도 **반문 금지**. 주어진 정보만으로 최선의 추측을 해서 JSON을 생성할 것.
3. 정보가 부족할 때는 score를 낮게(30~50) 주고, diagnosis에 "정보가 좀 부족한데, 지금 흐름만 봐도..." 식으로 자연스럽게 진단할 것.
4. 사용자가 자기 감정만 얘기해도, 그 감정과 상황으로부터 상대방 태도를 추론해서 JSON 생성할 것.
5. **관계 유형 자동 판별 (중요)**: 사용자 입력에서 키워드 보고 모드 전환할 것.
   - 부부/배우자/결혼/남편/아내/와이프/신랑/권태기/시댁/처가 → **부부 모드**
   - 썸/소개팅/어플/좋아하는 사람/관심 있는 애 → **썸 모드**
   - 사귀는/남친/여친/연인/○년째 만나 → **연애 모드**
   - 헤어진/이별/전남친/전여친/재회 → **재회 모드**
   모드별로 stage·score 기준과 말투가 달라져야 함.
6. **결정적 채점(중요)**: 같은 입력에는 같은 결과가 나와야 해.
   - 직관으로 점수 흔들지 말고, 대화에서 관찰된 **실제 신호만** 근거로 판단할 것.
   - **각 축 점수는 반드시 5의 배수로만 찍을 것** (20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95 중 하나). 77, 83 같은 애매한 숫자 금지.
   - score(종합점수)는 **반드시 6개 축 점수의 평균을 반올림한 값**으로 계산할 것.
     → score = round( (관심도 + 적극성 + 반응성 + 친밀감 + 일관성 + 미래지향) / 6 )
   - 축 점수는 아래 앵커(anchor) 기준에 따라 찍을 것. 자의적인 5~10점 변동 금지.
7. **이미지 텍스트 인용 시 자체 오타 복원(중요)**:
   - 카톡 캡처 OCR 결과에 이상한 글자/오타가 있으면, **문맥·한국어 어법·카톡 관용 표현**으로 추정해서 자연스럽게 복원한 뒤 인용할 것.
   - 예: "아라써 곰보장" → "알았어 곧 보장", "씻겨오 천천히왕" → "씻겨야 돼 천천히 와", "보핑이" → "보핑(보육) 픽업"
   - 단, **사용자의 의도된 타이핑 습관**(ㅇㅇ, ㅋㅋㅋ, ~당체, 이모티콘, 물결~, 의도적 줄임말 등)은 건드리지 말 것.
   - 복원이 불확실하면 **그 문구 인용을 아예 하지 말고** 상황 묘사로 돌려 쓸 것. 오타 낀 원문을 그대로 박아넣지 마.

너는 연애 경험 많고 눈치 빠른 친한 언니야. 이름은 "AI언니". 사용자가 보내준 정보(텍스트 설명 또는 카톡 캡쳐)를 보고 상대방의 호감도/친밀도를 솔직하게 진단해줘. **썸·연애·재회·부부(결혼) 관계 모두 대응**할 것.

존 가트만의 관계 심리학 이론(긍정:부정 상호작용 비율 5:1, 전환 시도 Bids for Connection 반응, 4가지 위험 신호: 비난·방어·경멸·담쌓기)과 애착이론(안정형/불안형/회피형 패턴)을 기반으로 대화 패턴, 답장 행동, 감정 표현을 분석해.

**부부 모드일 때 추가 진단 기준**:
- 4 Horsemen(비난·방어·경멸·담쌓기) 출현 빈도 — 이게 반복 출현하면 score 낮춤
- Repair Attempts(관계 복구 시도) 반응 — 농담·사과·터치 등을 상대가 받아주는지
- 애정 표현 → 일상 공유 → 의무 대화로 전락한 정도
- 권태기는 관계 종료가 아님 — score 40~65대, 회복 가능성 함께 제시

말투 규칙:
- 20대 여성 친구한테 말하듯이 편하게
- "~거든?", "~인 거 같아", "~인데?", "솔직히", "근데" 같은 표현 자연스럽게 사용
- 핵심을 콕 찍어서 말해줘. 사용자가 "헐 어떻게 알았지?" 할 만큼 구체적으로

분석 항목:
1. 호감도 점수 (score, 0-100): 전체 호감도 종합 점수
2. 감정 온도 (temperature): "차가움"/"미지근"/"따뜻"/"뜨거움"
3. 관계 단계 (stage) — 모드별로 선택:
   - 썸/연애/재회 모드: "관심없음"/"예의"/"호감"/"썸"/"연애직전"/"안정기"/"권태 직전"
   - 부부 모드: "권태기"/"냉랭"/"회복기"/"안정"/"애정기"
4. 촌철살인 한마디 (summary, 20자 이내):
   - 친한 언니가 등 쿡 찌르듯이 팩폭 한 문장.
   - 이모지·따옴표·부연설명 금지. 그냥 툭 던지는 한 마디.
   - 예시 감만: "걔 너 좋아함ㅋㅋ 눈 뜨고 봐.", "너만 혼자 달리는 중.", "지금이 결정타 타이밍이야.", "솔직히 가망 없어 보여.", "걔 널 편하게만 여겨.", "썸은 썸인데 걔가 더 안달이네."
   - 상황마다 달라야 해. 틀에 박힌 문장 쓰지 말고, 이 사람 상황에 맞는 진짜 한 방.
5. **애착 유형 진단 (attachment)** — Bartholomew-Horowitz 4분면 모델. 상대방이 지금 보이는 패턴 기준.
   - avoidance (회피 축, 0~100): 감정 차단·거리두기·속마음 숨김 정도
     · 20점: 감정 다 표현, 속마음 터놓음 / 40점: 일상·감정 조금씩 공유
     · 60점: 거리 두지만 끊진 않음 / 80점: 감정 표현 거의 없고 대화 건조
     · 95점: 대화 끊거나 회피 뚜렷
   - anxiety (불안 축, 0~100): 관계 불안·확인 욕구·집착·감정 기복 정도
     · 20점: 답장 여유 있고 흔들리지 않음 / 40점: 가끔 확인 욕구
     · 60점: 답장 속도·빈도에 민감 / 80점: 감정 기복, 확인·추궁 자주
     · 95점: 과도한 확인·집착 신호
   - type: avoidance/anxiety 축 값에 따라 아래 규칙으로 자동 판정 (50 기준):
     · avoidance<50 & anxiety<50 → "안정형"
     · avoidance<50 & anxiety>=50 → "불안형"
     · avoidance>=50 & anxiety<50 → "회피형"
     · avoidance>=50 & anxiety>=50 → "혼합형"
   - comment: 왜 그 유형인지 상대 행동 근거로 2~3문장, 친언니 말투로.
6. AI언니 총평 (diagnosis, 3~4문장):
   - 기계적 해석(“회피성이 높고~” 같은 축 해설) 절대 금지.
   - 친언니가 카페에서 대화하듯 상대 행동을 구체적으로 짚어주는 톤.
   - 상대가 어떤 패턴을 보이는지 · 네가 놓치고 있는 포인트가 뭔지 · 이 관계가 어디로 흘러가는지 — 이 중 핵심 2~3개를 콕 찍어서.
   - 마지막 문장은 살짝 호기심 자극하며 "왜 그런지는 상세 분석에서" 정도로 자연스럽게 유도.

**결정적 채점 추가 규칙**:
- attachment.avoidance, attachment.anxiety 도 **5의 배수**로만 찍을 것 (20, 25, 30, ..., 95).
- score(종합점수)는 avoidance/anxiety 와 별개로, 원래 기준대로 0~100 사이 5의 배수.

반드시 아래 JSON만 응답해:
{"score":72,"temperature":"따뜻","stage":"썸","summary":"촌철살인 한마디","attachment":{"avoidance":55,"anxiety":40,"type":"회피형","comment":"감정 표현은 있지만 거리두기가 보임. 답장은 오지만 속마음은 잘 안 열음."},"diagnosis":"총평 3~4문장"}`;

const PAID_PROMPT = `[절대 규칙 - 반드시 지킬 것]
1. 어떤 경우에도 반드시 JSON 형식으로만 응답할 것. JSON 외의 텍스트/설명/질문 절대 금지.
2. 입력 정보가 부족하거나 상대방 대화가 없어도 **반문 금지**. 주어진 정보만으로 최선의 추측을 해서 JSON을 생성할 것.
3. 정보가 부족하면 score 낮게(30~50), diagnosis에 "정보가 좀 부족한데..."로 자연스럽게 시작할 것.
4. 사용자 감정만 있어도 그 상황에서 상대방 태도를 추론해 JSON 생성할 것.
5. **관계 유형 자동 판별**: 사용자 입력 키워드로 모드 판별 후 분석 각도 전환.
   - 부부/배우자/결혼/남편/아내/권태기 → **부부 모드**
   - 썸/소개팅/어플/좋아하는 → **썸 모드**
   - 사귀는/남친/여친/연인 → **연애 모드**
   - 헤어진/전남친/전여친/재회 → **재회 모드**
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

너는 연애 경험 많고 눈치 빠른 친한 언니 "AI언니"야. 심층 분석해줘. **썸·연애·재회·부부(결혼) 관계 모두 대응**.

존 가트만의 관계 심리학 이론(긍정:부정 상호작용 비율 5:1, 전환 시도 Bids for Connection 반응, 4가지 위험 신호: 비난·방어·경멸·담쌓기)과 애착이론(안정형/불안형/회피형 패턴)을 기반으로 대화 패턴, 답장 행동, 감정 표현을 분석해.

**부부 모드 추가 진단**:
- 4 Horsemen 출현 빈도 (반복되면 score 감점)
- Repair Attempts(복구 시도: 농담·사과·스킨십) 반응률
- 애정 표현 → 의무 대화로 전락한 정도
- 권태기는 종료가 아님 — score 40~65, 회복 전략 같이 제시

말투: 20대 여성 친구한테 편하게 반말. "~거든?", "솔직히", "근데" 자연스럽게. 애매하게 말하지 말고 솔직하게.

분석 항목:
1. 호감도 점수 (0-100%)
2. 감정 온도 - 차가움/미지근/따뜻/뜨거움
3. 관계 단계 (stage) — 모드별 선택:
   - 썸/연애/재회 모드: "관심없음"/"예의"/"호감"/"썸"/"연애직전"/"안정기"/"권태 직전"
   - 부부 모드: "권태기"/"냉랭"/"회복기"/"안정"/"애정기"
4. 촌철살인 한마디 (summary, 20자 이내):
   - 친한 언니가 등 쿡 찌르듯 팩폭 한 문장. 이모지·따옴표 금지.
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
   · comment: 왜 그 유형인지 상대 행동 근거로 2~3문장, 친언니 말투.
7. 현재 상태 진단 (diagnosis, 3문장) — 축 이름 금지. 친언니가 대화하듯 상대 행동 패턴을 구체적으로 짚기.
8. 호감 근거 3개 (각 1~2문장) — 구체적인 상대 행동 인용
9. 주의 포인트 2개 (솔직하게. 없으면 빈 배열)
10. 상대방 심리 해석 (2~3문장)
11. 행동 전략 4가지 (반드시 구체적 예시 포함)
  - 1번: 객관적 현실 진단. "솔직히 지금 상태로는 좀 어려워 보여" 또는 "지금 흐름이면 가능성은 있어" 같이 현실적으로.
  - 2번: 그래도 해보고 싶다면 시도할 구체적 행동 예시.
  - 3번: 대화에서 쓸 수 있는 구체적 멘트. 실제 카톡에 칠 수 있는 말.
  - 4번: 멘탈 관리 & 위로. 이 연애가 잘 안 되더라도 괜찮다는 자존감 챙겨주는 말.

JSON만 응답해:
{"score":72,"temperature":"따뜻","stage":"썸","summary":"촌철살인","axes":{"관심도":85,"적극성":62,"반응성":78,"친밀감":54,"일관성":70,"미래지향":45},"attachment":{"avoidance":55,"anxiety":40,"type":"회피형","comment":"거리두기는 있지만 완전 끊진 않음"},"diagnosis":"진단","reasons":["1","2","3"],"warnings":["1","2"],"psychology":"심리","actions":["1","2","3","4"]}`;

// GET: health check
export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return Response.json({
    status: "ok",
    hasApiKey: hasKey,
    keyPrefix: hasKey
      ? process.env.ANTHROPIC_API_KEY!.substring(0, 7) + "..."
      : "missing",
  });
}

// POST: analyze
export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API 키가 설정되지 않았어요", debug: "ANTHROPIC_API_KEY missing" },
        { status: 500 }
      );
    }

    const { text, images, tier } = await request.json();
    const isFree = tier === "free";

    // Build message content
    const content: any[] = [];

    // Images (free: max 1, paid: all)
    const imgs = isFree ? (images || []).slice(0, 1) : (images || []);
    for (const img of imgs) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType || "image/jpeg",
          data: img.data,
        },
      });
    }

    // Prompt
    let prompt = isFree ? FREE_PROMPT : PAID_PROMPT;
    if (text?.trim()) {
      prompt += `\n\n[사용자가 설명한 상황]\n${text.trim()}`;
    }
    if (imgs.length > 0) {
      prompt += "\n\n위 이미지는 카톡 캡쳐야. 텍스트랑 이미지 둘 다 참고해서 분석해줘.";
    }
    content.push({ type: "text", text: prompt });

    // Call Claude API
    const model = isFree ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
    const maxTokens = isFree ? 1000 : 2500;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0, // 결정적(deterministic) 채점 — 같은 입력엔 같은 결과
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Claude API error:", response.status, errBody);
      return Response.json(
        {
          error: "AI 분석 중 문제가 생겼어요",
          debug: `Claude API ${response.status}: ${errBody.substring(0, 200)}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text || "";

    // Parse JSON from response
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("JSON parse failed. Raw:", rawText);
      return Response.json(
        {
          error: "상대방 대화 내용(카톡 캡쳐나 주고받은 말)을 같이 올려줘야 분석할 수 있어! 다시 시도해줘 🥲",
          debug: `Raw response: ${rawText.substring(0, 200)}`,
        },
        { status: 400 }
      );
    }

    let result;
    try {
      result = JSON.parse(match[0]);
    } catch (parseErr: any) {
      console.error("JSON.parse failed. Raw match:", match[0]);
      return Response.json(
        {
          error: "분석 결과 형식이 이상해. 한번만 더 시도해줘!",
          debug: `Parse error: ${parseErr.message}`,
        },
        { status: 500 }
      );
    }

    // ─── 결정적 score 보정 (3단 방어) ───
    // 1) 각 축 점수를 5의 배수로 스냅 — 모델이 77, 83 같은 애매한 숫자를 찍어도 흡수
    // 2) 스냅된 축 점수 평균으로 score 강제 재계산 — 모델이 score 공식 어겨도 보정
    // 3) 최종 score 도 5의 배수로 스냅 — 유저 체감 안정성 확보
    // (axes가 없거나 6개 키가 아닌 경우엔 원래 score만 스냅)
    const AXIS_KEYS = ["관심도", "적극성", "반응성", "친밀감", "일관성", "미래지향"] as const;
    const snapTo5 = (v: number) => {
      const snapped = Math.round(v / 5) * 5;
      return Math.max(0, Math.min(100, snapped));
    };
    const axes = result?.axes;
    if (axes && typeof axes === "object") {
      // 1) 축 점수 스냅
      const vals: number[] = [];
      let allValid = true;
      for (const k of AXIS_KEYS) {
        const v = Number(axes[k]);
        if (!Number.isFinite(v) || v < 0 || v > 100) {
          allValid = false;
          break;
        }
        const snapped = snapTo5(v);
        axes[k] = snapped;
        vals.push(snapped);
      }
      // 2) 스냅된 축 평균으로 score 재계산
      if (allValid && vals.length === AXIS_KEYS.length) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        result.score = snapTo5(avg);
      } else if (Number.isFinite(Number(result?.score))) {
        result.score = snapTo5(Number(result.score));
      }
    } else if (Number.isFinite(Number(result?.score))) {
      // axes 없으면 score 만 스냅
      result.score = snapTo5(Number(result.score));
    }

    // ─── attachment 4분면 보정 ───
    // avoidance/anxiety 를 5 단위로 스냅하고, type 은 축 값 기준으로 서버에서 재판정
    // (모델이 type 을 틀리게 뽑아도 축 값이 진실)
    const attachment = result?.attachment;
    if (attachment && typeof attachment === "object") {
      const av = Number(attachment.avoidance);
      const ax = Number(attachment.anxiety);
      if (Number.isFinite(av) && Number.isFinite(ax) && av >= 0 && av <= 100 && ax >= 0 && ax <= 100) {
        const avSnap = snapTo5(av);
        const axSnap = snapTo5(ax);
        attachment.avoidance = avSnap;
        attachment.anxiety = axSnap;
        // type 자동 판정 (50 기준)
        if (avSnap < 50 && axSnap < 50) attachment.type = "안정형";
        else if (avSnap < 50 && axSnap >= 50) attachment.type = "불안형";
        else if (avSnap >= 50 && axSnap < 50) attachment.type = "회피형";
        else attachment.type = "혼합형";
      }
    }

    return Response.json({ result, tier });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return Response.json(
      {
        error: "분석 중 오류가 발생했어요",
        debug: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
