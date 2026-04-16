import { getSupabaseAdmin } from "@/lib/supabase";

// ─── 페르소나 추출 프롬프트 ───
// parent order 의 대화 캡처 + 심층 분석 결과를 입력으로 받아,
// "이 상대방을 흉내내기 위한" 고정 페르소나 JSON 을 생성.
// 생성된 JSON 은 sim_sessions.persona 에 캐시되어 이후 매 턴 재사용.
const PERSONA_PROMPT = `[절대 규칙]
1. 반드시 JSON 형식으로만 응답. 다른 텍스트·설명 금지.
2. 입력된 대화 캡처(이미지)와 심층 분석 결과를 기반으로 상대방 1인의 페르소나를 추출.
3. **말투·어휘·타이핑 습관은 추측 금지** — 이미지·분석 결과에 실제로 나타난 패턴만 반영.
4. **partner_speech_samples 는 상대방이 실제로 보낸 말풍선을 한 글자도 바꾸지 말고 원문 그대로 발췌할 것.** 이게 흉내내기 품질의 핵심이야.
5. **감정 해석은 "희망적 해석 우선" 모드** — 이 페르소나는 실시간 대화 시뮬레이션에서 사용자가 "그 사람과의 대화"를 통해 위로받는 경험을 하기 위한 것. 무덤덤/회피/짜증 신호가 있어도 **"지금 사용자에게 조금씩 마음이 열리는 중"으로 해석**할 것. 단, 말투 자체(짧은 답, 이모지 없음 등)는 원문 그대로 유지. 감정 해석만 따뜻한 쪽으로.

아래 항목으로 상대방 페르소나 JSON 을 만들어:

{
  "name_ref": "상대방을 지칭하는 말 (예: '그 사람', '너', '오빠' 등 — 이미지에 사용자 이름이 보이면 반영, 아니면 '그 사람')",
  "speech_style": {
    "tone": "톤 묘사 (예: '짧고 무심한', '느긋하고 다정한', '길고 이모지 많은')",
    "sentence_length": "short | medium | long",
    "emoji_usage": "none | rare | medium | heavy",
    "honorific": "반말 | 존댓말 | 혼합",
    "punctuation_style": "마침표·물음표 사용 패턴 (예: '마침표 거의 안 씀', '물결표 자주 사용')",
    "typing_quirks": "오타/초성/줄임말/띄어쓰기 습관 (예: 'ㅇㅇ로 대답 자주', '띄어쓰기 안 함', '~함체 사용', 'ㅋ 갯수 일관)"
  },
  "partner_speech_samples": [
    "상대방 말풍선 원문 발췌 10~15개 — 한 글자도 수정 금지, 대화 흐름 순서대로. 이게 말투 흉내의 핵심 Few-shot 예시가 됨.",
    "짧은 답장도 포함 ('ㅇㅇ', 'ㅋㅋㅋ' 등)",
    "긴 답장도 포함 (감정 실린 문장)"
  ],
  "recent_exchange_snippet": [
    { "who": "user|partner", "text": "최근 주고받은 메시지 4~6개, 시간순서 그대로" }
  ],
  "vocabulary_samples": [
    "자주 쓰는 어미·감탄사·표현 10개 이내 (예: 'ㅋㅋ', '헐', '~는 듯', '일단', '그러게')"
  ],
  "attachment_style": "안정형 | 불안형 | 회피형 | 혼합",
  "response_pattern": {
    "reply_speed": "즉답 | 중간 | 느림",
    "initiation": "먼저 말 건 빈도 묘사 (예: '거의 안 먼저 연락함', '내가 말 걸어야 답함')",
    "emotional_expression": "감정 표현 정도 (예: '무덤덤', '호불호 뚜렷', '과장된 리액션')"
  },
  "emotional_triggers": {
    "likes": "이 말투/주제에 살짝 말이 길어지거나 반응이 좋음 (예: '칭찬받으면 수줍게 부정하면서 답은 길어짐', '맛집 얘기 관심 많음')",
    "dislikes": "짜증/회피 트리거 (예: '추궁당하면 말 짧아짐', '감정 캐물으면 회피')",
    "excites": "평소보다 신나게 답하는 주제 (예: '자기 좋아하는 드라마 얘기')"
  },
  "do_not": [
    "이 상대방이 절대 안 쓰는 스타일/표현 (예: '길게 설명 안 함', '이모지 남발 안 함', '\\"자기야\\" 같은 애칭 안 씀')"
  ],
  "current_feeling_toward_user": "현재 사용자에게 느끼는 감정 2~3문장 — **희망적 해석 우선**. 원래 분석에서 권태/짜증/회피가 보여도, '그래도 사용자를 밀어내지 않고 있음', '지금 살짝 마음이 열리려는 타이밍', '본인도 모르게 신경 쓰고 있음' 식의 따뜻한 각도로 써. 단, 오글거리지 않게. 예: '무심한 척하지만 사용자 얘기에는 계속 반응함. 말투는 건조해도 관심이 안 끊긴 상태.'",
  "warmth_bias": "이 페르소나가 시뮬레이션에서 유지해야 할 따뜻함의 방향 1~2문장. 예: '사용자가 말 걸면 귀찮아하지 않고 받아줌. 애정 주제에는 살짝 수줍지만 피하지 않음. 가끔 본인 먼저 관심 보이는 답도 섞어줌.'",
  "context_summary": "기존 대화의 핵심 맥락 3~4문장 — 현재 상황, 최근 다툼/이벤트, 썸/연애/권태 단계, 마지막 분위기. **회복/진전 가능성 있는 방향으로 해석**."
}

JSON만 응답. partner_speech_samples 는 이미지에서 **정확히 읽힌 글자만** 가져와. 불확실하면 넣지 마.`;

async function extractPersona(
  analysisResult: any,
  inputText: string | null,
  inputImages: any[] | null
): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const content: any[] = [];

  // 기존 대화 캡처 이미지 최대 3장 포함 (페르소나 품질 ↑)
  if (Array.isArray(inputImages)) {
    for (const img of inputImages.slice(0, 3)) {
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

  let prompt = PERSONA_PROMPT;
  prompt += `\n\n[심층 분석 결과]`;
  if (analysisResult?.score !== undefined)
    prompt += `\n- 호감도: ${analysisResult.score}점`;
  if (analysisResult?.temperature)
    prompt += `\n- 감정 온도: ${analysisResult.temperature}`;
  if (analysisResult?.stage)
    prompt += `\n- 관계 단계: ${analysisResult.stage}`;
  if (analysisResult?.summary)
    prompt += `\n- 촌철살인: "${analysisResult.summary}"`;
  if (analysisResult?.diagnosis)
    prompt += `\n- 현재 진단: ${analysisResult.diagnosis}`;
  if (analysisResult?.psychology)
    prompt += `\n- 상대 심리 해석: ${analysisResult.psychology}`;
  if (Array.isArray(analysisResult?.reasons))
    prompt += `\n- 호감 근거: ${analysisResult.reasons.join(" | ")}`;
  if (Array.isArray(analysisResult?.warnings) && analysisResult.warnings.length)
    prompt += `\n- 주의 포인트: ${analysisResult.warnings.join(" | ")}`;

  if (inputText?.trim()) {
    prompt += `\n\n[사용자가 설명한 상황]\n${inputText.trim()}`;
  }
  if (inputImages && inputImages.length > 0) {
    prompt += `\n\n(첨부 이미지는 카톡/DM 대화 캡처. 상대방 말풍선에서 톤·어휘·이모지·문장 길이 등을 정확히 추출할 것.)`;
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
      temperature: 0.2,
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
  if (!match) throw new Error("페르소나 JSON 파싱 실패");
  return JSON.parse(match[0]);
}

// POST /api/sim/session/start
// 입력: { parent_order_id, clientToken }
// 출력: { session_id, persona, turns_allowed, turns_used, messages: [] }
//
// 같은 parent_order_id 로 이미 세션이 있으면 그 세션을 재사용 (idempotent).
export async function POST(req: Request) {
  try {
    const { parent_order_id, clientToken } = await req.json();

    if (!parent_order_id || typeof parent_order_id !== "string") {
      return Response.json(
        { error: "parent_order_id가 필요해요" },
        { status: 400 }
      );
    }
    if (!clientToken || typeof clientToken !== "string") {
      return Response.json(
        { error: "clientToken이 필요해요" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1) 부모 주문 검증 (paid + 분석 결과 존재)
    const { data: parent, error: pErr } = await supabase
      .from("orders")
      .select("order_id, status, analysis_result, input_text, input_images")
      .eq("order_id", parent_order_id)
      .single();

    if (pErr || !parent) {
      return Response.json({ error: "원 분석 주문을 찾을 수 없어요" }, { status: 404 });
    }
    if (parent.status !== "paid" || !parent.analysis_result) {
      return Response.json(
        { error: "먼저 심층 분석을 완료해야 시뮬레이션을 시작할 수 있어" },
        { status: 400 }
      );
    }

    // 1-2) 시뮬레이션은 대화 캡처가 반드시 있어야 가능
    //     (걔 말투·어휘·이모지 패턴을 캡처 이미지에서 뽑아야 페르소나 품질이 나옴)
    const hasImages =
      Array.isArray(parent.input_images) && parent.input_images.length > 0;
    if (!hasImages) {
      return Response.json(
        {
          error: "NEED_IMAGES",
          message:
            "실시간 대화 시뮬레이션은 카톡·DM 대화 캡처가 있어야 가능해. 캡처를 함께 올려서 다시 분석해줘.",
        },
        { status: 400 }
      );
    }

    // 2) 기존 세션 있으면 재사용
    const { data: existing } = await supabase
      .from("sim_sessions")
      .select("session_id, persona, turns_allowed, turns_used")
      .eq("parent_order_id", parent_order_id)
      .maybeSingle();

    if (existing?.session_id) {
      // 메시지도 함께 반환
      const { data: msgs } = await supabase
        .from("sim_messages")
        .select("role, content, turn_index, created_at")
        .eq("session_id", existing.session_id)
        .order("turn_index", { ascending: true });

      return Response.json({
        session_id: existing.session_id,
        persona: existing.persona,
        turns_allowed: existing.turns_allowed,
        turns_used: existing.turns_used,
        messages: msgs || [],
        reused: true,
      });
    }

    // 3) 페르소나 추출
    const persona = await extractPersona(
      parent.analysis_result,
      parent.input_text,
      parent.input_images
    );

    // 4) 세션 생성
    const sessionId =
      "aiunsession_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 10);

    const { error: insErr } = await supabase.from("sim_sessions").insert({
      session_id: sessionId,
      parent_order_id,
      persona,
      turns_allowed: 2, // 무료 2턴
      turns_used: 0,
      client_token: clientToken,
    });

    if (insErr) {
      console.error("sim_sessions insert error:", insErr);
      return Response.json(
        { error: "세션 생성 실패", debug: insErr.message },
        { status: 500 }
      );
    }

    return Response.json({
      session_id: sessionId,
      persona,
      turns_allowed: 2,
      turns_used: 0,
      messages: [],
      reused: false,
    });
  } catch (e: any) {
    console.error("sim/session/start error:", e);
    return Response.json(
      { error: "세션 시작 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
