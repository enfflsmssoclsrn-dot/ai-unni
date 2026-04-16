import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/sim/session/[session_id]
// 세션 상태 + 메시지 전체 조회 (페이지 복원용).
// 쿼리: ?clientToken=... (소유 검증 간이)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;
    const { searchParams } = new URL(req.url);
    const clientToken = searchParams.get("clientToken");

    if (!session_id) {
      return Response.json({ error: "session_id가 없어요" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: session, error: sErr } = await supabase
      .from("sim_sessions")
      .select("session_id, parent_order_id, persona, turns_allowed, turns_used, client_token, created_at")
      .eq("session_id", session_id)
      .single();

    if (sErr || !session) {
      return Response.json({ error: "세션을 찾을 수 없어요" }, { status: 404 });
    }

    // 간이 소유 검증: clientToken이 세션에 저장된 것과 같으면 OK
    if (clientToken && session.client_token && session.client_token !== clientToken) {
      return Response.json({ error: "세션 소유자가 아니에요" }, { status: 403 });
    }

    const { data: msgs } = await supabase
      .from("sim_messages")
      .select("role, content, turn_index, created_at")
      .eq("session_id", session_id)
      .order("turn_index", { ascending: true });

    return Response.json({
      session_id: session.session_id,
      parent_order_id: session.parent_order_id,
      persona: session.persona,
      turns_allowed: session.turns_allowed,
      turns_used: session.turns_used,
      messages: msgs || [],
    });
  } catch (e: any) {
    console.error("sim/session GET error:", e);
    return Response.json(
      { error: "조회 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
