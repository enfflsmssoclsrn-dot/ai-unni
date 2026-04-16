import { getSupabaseAdmin } from "@/lib/supabase";
import { confirmTossPayment } from "@/lib/toss";
import { runPaidAnalysis, processPaidResult } from "@/lib/paid-analysis";

// ─────────────────────────────────────────────
//  POST /api/payment/confirm
//  토스 결제 확정 → DB 업데이트 → 유료 심층분석 → 결과 반환
//  분석 로직(프롬프트·점수 스냅·attachment 파생)은
//  /lib/paid-analysis.ts 에 단일 출처로 관리.
// ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount, freeResult } = await req.json();

    if (!paymentKey || !orderId || typeof amount !== "number") {
      return Response.json(
        { error: "paymentKey, orderId, amount가 필요해요" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. 주문 조회 + 금액 검증 (프론트 위조 방지)
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (fetchErr || !order) {
      return Response.json({ error: "주문을 찾을 수 없어요" }, { status: 404 });
    }

    if (order.amount !== amount) {
      return Response.json(
        { error: "결제 금액이 주문 금액과 달라요" },
        { status: 400 }
      );
    }

    // 2. 이미 paid + 분석 결과 있으면 후처리만 한번 더 적용해서 반환 (멱등성 + 구버전 보정)
    //    ※ 옛날에 저장된 결과는 attachment 누락 상태일 수 있으므로 processPaidResult 로 재보정
    if (order.status === "paid" && order.analysis_result) {
      const reprocessed = processPaidResult(order.analysis_result);
      // 보정 결과가 원본과 달라졌으면 DB 도 업데이트 (이후 호출에선 바로 반환되도록)
      try {
        await supabase
          .from("orders")
          .update({ analysis_result: reprocessed })
          .eq("order_id", orderId);
      } catch {}
      return Response.json({ orderId, result: reprocessed });
    }

    // 3. 아직 paid 아니면 토스 확정 호출
    if (order.status !== "paid") {
      await confirmTossPayment({ paymentKey, orderId, amount });
      await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_key: paymentKey,
          paid_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);
    }

    // 4. Claude 유료 분석 실행 (프롬프트 · 후처리 전부 포함)
    //    freeResult 가 있으면 앵커로 전달 → 무료↔유료 일관성 보장
    const result = await runPaidAnalysis(order.input_text, order.input_images, freeResult || undefined);

    // 5. 결과 저장
    await supabase
      .from("orders")
      .update({ analysis_result: result })
      .eq("order_id", orderId);

    return Response.json({ orderId, result });
  } catch (e: any) {
    console.error("payment/confirm error:", e);
    return Response.json(
      { error: "결제 확정 중 오류", debug: e?.message || String(e) },
      { status: 500 }
    );
  }
}
