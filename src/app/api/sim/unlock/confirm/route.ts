import { getSupabaseAdmin } from "@/lib/supabase";
import { confirmTossPayment } from "@/lib/toss";

// POST /api/sim/unlock/confirm
// 입력: { paymentKey, orderId, amount }  (orderId = unlock_order_id)
// 출력: { session_id, turns_allowed, turns_used, turns_granted }
//
// 멱등: 이미 paid 면 현재 세션 상태만 반환.
export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || typeof amount !== "number") {
      return Response.json(
        { error: "paymentKey, orderId, amount가 필요해요" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1) 언락 주문 조회 + 금액 검증
    const { data: unlock, error: uErr } = await supabase
      .from("sim_unlocks")
      .select("*")
      .eq("unlock_order_id", orderId)
      .single();

    if (uErr || !unlock) {
      return Response.json({ error: "언락 주문을 찾을 수 없어요" }, { status: 404 });
    }
    if (unlock.amount !== amount) {
      return Response.json(
        { error: "결제 금액이 주문 금액과 달라요" },
        { status: 400 }
      );
    }

    // 2) 이미 paid 면 현 상태만 반환
    if (unlock.status === "paid") {
      const { data: sess } = await supabase
        .from("sim_sessions")
        .select("session_id, turns_allowed, turns_used")
        .eq("session_id", unlock.session_id)
        .single();
      return Response.json({
        session_id: unlock.session_id,
        turns_allowed: sess?.turns_allowed ?? null,
        turns_used: sess?.turns_used ?? null,
        turns_granted: unlock.turns_granted,
        already_paid: true,
      });
    }

    // 3) 토스 결제 확정
    await confirmTossPayment({
      paymentKey,
      orderId,
      amount,
    });

    // 4) 언락 주문 paid 처리
    await supabase
      .from("sim_unlocks")
      .update({
        status: "paid",
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("unlock_order_id", orderId);

    // 5) 세션의 turns_allowed += turns_granted
    //    읽고 쓰는 사이 경합 가능성 낮음(같은 디바이스) → 단순 RMW.
    const { data: sess, error: sErr } = await supabase
      .from("sim_sessions")
      .select("turns_allowed, turns_used")
      .eq("session_id", unlock.session_id)
      .single();

    if (sErr || !sess) {
      return Response.json({ error: "세션 조회 실패" }, { status: 500 });
    }

    const newAllowed = sess.turns_allowed + unlock.turns_granted;
    await supabase
      .from("sim_sessions")
      .update({ turns_allowed: newAllowed, updated_at: new Date().toISOString() })
      .eq("session_id", unlock.session_id);

    return Response.json({
      session_id: unlock.session_id,
      turns_allowed: newAllowed,
      turns_used: sess.turns_used,
      turns_granted: unlock.turns_granted,
      already_paid: false,
    });
  } catch (e: any) {
    console.error("sim/unlock/confirm error:", e);
    return Response.json(
      { error: "결제 확정 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
