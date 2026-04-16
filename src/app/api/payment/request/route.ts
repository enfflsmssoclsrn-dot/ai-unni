import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/payment/request
// 결제 요청 전 orders 행 생성. 입력(text/images)을 저장해두고 orderId 반환.
export async function POST(req: Request) {
  try {
    const { text, images, clientToken } = await req.json();

    if (!clientToken || typeof clientToken !== "string") {
      return Response.json({ error: "clientToken이 필요해요" }, { status: 400 });
    }

    // 주문번호 생성: aiunni_{timestamp}_{random8}
    const orderId =
      "aiunni_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 10);

    const amount = 2900;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("orders").insert({
      order_id: orderId,
      amount,
      status: "pending",
      client_token: clientToken,
      input_text: text ?? null,
      input_images: images ?? null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json(
        { error: "주문 생성 실패", debug: error.message },
        { status: 500 }
      );
    }

    return Response.json({ orderId, amount });
  } catch (e: any) {
    console.error("payment/request error:", e);
    return Response.json(
      { error: "요청 처리 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
