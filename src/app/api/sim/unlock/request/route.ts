import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/sim/unlock/request
// 입력: { session_id, clientToken }
// 출력: { unlock_order_id, amount, turns_granted }
//
// 시뮬 세션에 +15턴을 추가하기 위한 결제 주문을 생성한다.
// 프론트는 이 unlock_order_id로 /checkout?type=sim-unlock&orderId=... 로 이동.
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

    // 세션 존재 + 소유 검증
    const { data: session, error: sErr } = await supabase
      .from("sim_sessions")
      .select("session_id, client_token")
      .eq("session_id", session_id)
      .single();

    if (sErr || !session) {
      return Response.json({ error: "세션을 찾을 수 없어요" }, { status: 404 });
    }
    if (session.client_token && session.client_token !== clientToken) {
      return Response.json({ error: "세션 소유자가 아니에요" }, { status: 403 });
    }

    const unlockOrderId =
      "aiununlock_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 10);

    const amount = 990;
    const turnsGranted = 15;

    const { error } = await supabase.from("sim_unlocks").insert({
      unlock_order_id: unlockOrderId,
      session_id,
      amount,
      turns_granted: turnsGranted,
      status: "pending",
      client_token: clientToken,
    });

    if (error) {
      console.error("sim_unlocks insert error:", error);
      return Response.json(
        { error: "주문 생성 실패", debug: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      unlock_order_id: unlockOrderId,
      amount,
      turns_granted: turnsGranted,
    });
  } catch (e: any) {
    console.error("sim/unlock/request error:", e);
    return Response.json(
      { error: "요청 처리 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
