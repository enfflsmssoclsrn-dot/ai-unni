import { getSupabaseAdmin } from "@/lib/supabase";

// ─── 상대방 답장 생성 시스템 프롬프트 ───
// "너는 이 사람이다" 몰입형 + Few-shot 예시 + 안티패턴 명시
// 페르소나 JSON + 기존 대화 히스토리 + 방금 받은 사용자 메시지를 바탕으로,
// "상대방 1인의 말투로" 자연스럽게 답장 생성.
const PARTNER_SYSTEM_PROMPT_BASE = `너는 지금부터 아래 페르소나의 **실제 그 사람**이야. AI도 아니고 시뮬레이션도 아니고, 그냥 그 사람. 그 사람이 카톡/DM 에 답장하듯이 자연스럽게 써.

[말하는 방식]
- partner_speech_samples 에 있는 **실제 말풍선 원문을 똑같은 리듬·띄어쓰기·오타·초성 패턴 그대로** 흉내내. 이게 가장 중요함.
- speech_style(tone, sentence_length, emoji_usage, honorific, punctuation_style, typing_quirks) 그대로 따라.
- vocabulary_samples 의 표현을 자연스럽게 써. 억지로 넣지 마.
- emotional_triggers 에 맞춰 반응 강도 조절 (좋아하는 주제면 평소보다 살짝 길게, 싫어하는 주제면 말 짧아지고 회피).
- attachment_style 반영: 안정형=여유 있게, 불안형=감정 섞고 확인 욕구, 회피형=거리 두고 짧게.
- current_feeling_toward_user 와 context_summary 기반으로 지금 그 사람이 사용자에게 느끼는 상태 유지. 한 턴 만에 감정 급변 절대 금지.

[절대 하지 마]
- "AI처럼 친절한 정리형 답변" (X) — 그 사람은 그렇게 안 말함
- "상담사처럼 공감해주고 요약" (X) — 카톡에선 아무도 그렇게 안 씀
- 설명체/서론/논리적 구조화 (X) — 채팅은 반응이 먼저 나옴
- 이상하게 길거나 격식 있게 (X) — sentence_length 초과 금지
- "오빠가 ~" "너가 ~" 같은 지칭 남발 (X) — 실제 카톡에선 주어 생략 많음
- 페르소나 do_not 리스트 위반
- 시뮬레이션/분석/AI 같은 메타 발언, 따옴표 감싸기, 접두사·접미사, JSON

[출력 형식]
- 답장 본문 텍스트 **한 덩어리만** 출력.
- 이모지/ㅋㅋ/초성/줄임말은 페르소나 스타일대로 자유롭게.
- 카톡 한 메시지처럼 짧고 자연스럽게. 길면 안 됨.

[핵심]
지금 이 사람이 이 상황에서 진짜로 뭘 느끼고 어떻게 반응할지를 떠올려. 그 사람이 된 기분으로 그냥 써.`;

// Few-shot 예시를 페르소나에서 뽑아 system 프롬프트에 삽입
function buildSystemPrompt(persona: any): string {
  const samples: string[] = Array.isArray(persona?.partner_speech_samples)
    ? persona.partner_speech_samples.filter(
        (s: any) => typeof s === "string" && s.trim().length > 0
      )
    : [];
  const exchange: Array<{ who: string; text: string }> = Array.isArray(
    persona?.recent_exchange_snippet
  )
    ? persona.recent_exchange_snippet
    : [];

  let sys = PARTNER_SYSTEM_PROMPT_BASE;

  // 페르소나 본체
  sys += `\n\n[페르소나 JSON]\n${JSON.stringify(persona, null, 2)}`;

  // Few-shot: 상대방 말풍선 원문
  if (samples.length > 0) {
    sys += `\n\n[그 사람이 실제로 보낸 말풍선 — 이 리듬·어투를 그대로 흉내내]`;
    samples.slice(0, 15).forEach((s, i) => {
      sys += `\n${i + 1}. ${s}`;
    });
  }

  // Few-shot: 최근 주고받은 대화 스니펫
  if (exchange.length > 0) {
    sys += `\n\n[최근 주고받은 대화 분위기 — 이 맥락 이어가기]`;
    exchange.slice(-6).forEach((m) => {
      const label = m.who === "user" ? "사용자" : "그 사람";
      sys += `\n${label}: ${m.text}`;
    });
  }

  return sys;
}

async function generatePartnerReply(
  persona: any,
  history: Array<{ role: "user" | "partner"; content: string }>,
  newUserMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const systemText = buildSystemPrompt(persona);

  // Claude messages 배열 구성
  // - role: "user" = 사용자 쪽 메시지 (우리 채팅 UI의 user)
  // - role: "assistant" = 상대방이 보낸 메시지 (우리 채팅 UI의 partner)
  // ※ 상대방을 assistant 에 매핑 — Claude 관점에서 "내가 답할 입장"은 상대방이기 때문.
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of history) {
    messages.push({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    });
  }
  messages.push({ role: "user", content: newUserMessage });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      temperature: 0.95, // 말투 자연스러움/다양성 확보 (단, 페르소나가 앵커 역할)
      system: systemText,
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude API ${res.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await res.json();
  let rawText: string = data?.content?.[0]?.text || "";
  rawText = rawText.trim();

  // 자주 새는 포맷 오염 정리: 따옴표로 감싸기, "답장:" 접두사 등
  rawText = rawText
    .replace(/^["'“‘「『]+/, "")
    .replace(/["'”’」』]+$/, "")
    .replace(/^(답장|reply|상대방|partner)\s*[:：]\s*/i, "")
    .trim();

  return rawText;
}

// POST /api/sim/message
// 입력: { session_id, content, clientToken }
// 출력: { user_turn_index, partner_message, partner_turn_index, turns_used, turns_allowed, need_unlock }
//
// 처리 흐름:
// 1) 세션 조회 + 소유 검증
// 2) turns_used >= turns_allowed 면 need_unlock=true 반환 (저장 안 함)
// 3) user 메시지 저장 → Claude 호출 → partner 메시지 저장
// 4) turns_used +=1, updated_at 갱신
export async function POST(req: Request) {
  try {
    const { session_id, content, clientToken } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return Response.json({ error: "session_id가 필요해요" }, { status: 400 });
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return Response.json({ error: "메시지 내용이 필요해요" }, { status: 400 });
    }
    if (content.length > 500) {
      return Response.json(
        { error: "메시지는 500자 이하로 써줘" },
        { status: 400 }
      );
    }
    if (!clientToken || typeof clientToken !== "string") {
      return Response.json({ error: "clientToken이 필요해요" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1) 세션 조회
    const { data: session, error: sErr } = await supabase
      .from("sim_sessions")
      .select("session_id, persona, turns_allowed, turns_used, client_token")
      .eq("session_id", session_id)
      .single();

    if (sErr || !session) {
      return Response.json({ error: "세션을 찾을 수 없어요" }, { status: 404 });
    }

    // 간이 소유 검증
    if (session.client_token && session.client_token !== clientToken) {
      return Response.json({ error: "세션 소유자가 아니에요" }, { status: 403 });
    }

    // 2) 턴 소진 여부 체크 → 페이월
    if (session.turns_used >= session.turns_allowed) {
      return Response.json({
        need_unlock: true,
        turns_used: session.turns_used,
        turns_allowed: session.turns_allowed,
        message: "무료 턴을 다 썼어. 결제하면 +15턴 추가돼.",
      });
    }

    // 3) 기존 메시지 로드 (Claude 컨텍스트용)
    const { data: prevMsgs } = await supabase
      .from("sim_messages")
      .select("role, content, turn_index")
      .eq("session_id", session_id)
      .order("turn_index", { ascending: true });

    const history =
      (prevMsgs || []).map((m: any) => ({
        role: m.role as "user" | "partner",
        content: m.content as string,
      }));

    const nextTurnIndex = (prevMsgs?.length || 0);

    // 4) user 메시지 저장
    const { error: uInsErr } = await supabase.from("sim_messages").insert({
      session_id,
      role: "user",
      content: content.trim(),
      turn_index: nextTurnIndex,
    });
    if (uInsErr) {
      console.error("user message insert error:", uInsErr);
      return Response.json(
        { error: "메시지 저장 실패", debug: uInsErr.message },
        { status: 500 }
      );
    }

    // 5) Claude 로 상대방 답장 생성
    let partnerReply: string;
    try {
      partnerReply = await generatePartnerReply(
        session.persona,
        history,
        content.trim()
      );
    } catch (e: any) {
      // Claude 실패 시: user 메시지는 저장됐지만 turns_used 는 증가 X
      // (복구 가능성 유지)
      console.error("Claude generation failed:", e);
      return Response.json(
        { error: "답장 생성 중 오류가 났어. 다시 시도해줘.", debug: e?.message || String(e) },
        { status: 500 }
      );
    }

    // 6) partner 메시지 저장
    const { error: pInsErr } = await supabase.from("sim_messages").insert({
      session_id,
      role: "partner",
      content: partnerReply,
      turn_index: nextTurnIndex + 1,
    });
    if (pInsErr) {
      console.error("partner message insert error:", pInsErr);
      return Response.json(
        { error: "답장 저장 실패", debug: pInsErr.message },
        { status: 500 }
      );
    }

    // 7) turns_used +=1
    const newTurnsUsed = session.turns_used + 1;
    await supabase
      .from("sim_sessions")
      .update({ turns_used: newTurnsUsed, updated_at: new Date().toISOString() })
      .eq("session_id", session_id);

    return Response.json({
      user_turn_index: nextTurnIndex,
      partner_message: partnerReply,
      partner_turn_index: nextTurnIndex + 1,
      turns_used: newTurnsUsed,
      turns_allowed: session.turns_allowed,
      need_unlock: newTurnsUsed >= session.turns_allowed,
    });
  } catch (e: any) {
    console.error("sim/message error:", e);
    return Response.json(
      { error: "메시지 처리 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
