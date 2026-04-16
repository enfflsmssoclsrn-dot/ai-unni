import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/sim/reset
// 입력: { session_id, clientToken }
// 출력: { session_id, turns_allowed, turns_used, messages: [] }
//
// 동작: 세션의 sim_messages 만 전부 삭제.
// turns_used / turns_allowed / persona 는 그대로 유지 (= 턴 카운트 공유).
// 리셋 시점까지 쓴 턴 수는 돌아오지 않음. 상대방 페르소나는 캐시 유지.
export async function POST(req: Request) {
  try {
    const { session_id, clientToken } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return Response.json({ error: "session_id가 필요해요" }, { status: 400 });
    }
    if (!clientToken || typeof clientToken !== "string") {
      return Response.json({ error: "clientToken이 필요해요" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 세션 조회 + 소유 검증
    const { data: session, error: sErr } = await supabase
      .from("sim_sessions")
      .select("session_id, turns_allowed, turns_used, client_token")
      .eq("session_id", session_id)
      .single();

    if (sErr || !session) {
      return Response.json({ error: "세션을 찾을 수 없어요" }, { status: 404 });
    }
    if (session.client_token && session.client_token !== clientToken) {
      return Response.json({ error: "세션 소유자가 아니에요" }, { status: 403 });
    }

    // 메시지 전량 삭제
    const { error: delErr } = await supabase
      .from("sim_messages")
      .delete()
      .eq("session_id", session_id);

    if (delErr) {
      console.error("sim_messages delete error:", delErr);
      return Response.json(
        { error: "리셋 실패", debug: delErr.message },
        { status: 500 }
      );
    }

    // updated_at만 갱신 (턴 카운트는 유지)
    await supabase
      .from("sim_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("session_id", session_id);

    return Response.json({
      session_id,
      turns_allowed: session.turns_allowed,
      turns_used: session.turns_used,
      messages: [],
    });
  } catch (e: any) {
    console.error("sim/reset error:", e);
    return Response.json(
      { error: "리셋 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
