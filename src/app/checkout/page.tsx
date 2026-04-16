"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

// ─── 결제 상품 정의 (분석 / 채팅 시뮬 언락) ───
const PRODUCTS = {
  analysis: {
    name: "AI언니 프리미엄 분석",
    subtitle: "가트만 관계 심리학 + 애착이론 기반 심층 분석",
    amount: 2900,
  },
  "sim-unlock": {
    name: "AI언니 대화 시뮬레이션 · 턴 15회 추가",
    subtitle: "걔 말투로 15번 더 대화 가능",
    amount: 990,
  },
} as const;

type ProductType = keyof typeof PRODUCTS;

function isProductType(v: string | null): v is ProductType {
  return v === "analysis" || v === "sim-unlock";
}

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");
  const typeParam = params.get("type");
  const type: ProductType = isProductType(typeParam) ? typeParam : "analysis";
  const product = PRODUCTS[type];
  const ORDER_NAME = product.name;
  const AMOUNT = product.amount;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const widgetsRef = useRef<any>(null);

  useEffect(() => {
    if (!orderId) {
      setError("주문번호가 없어요. 다시 시도해줘.");
      return;
    }
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setError("결제 클라이언트 키가 설정되지 않았어요. (TOSS_CLIENT_KEY missing)");
      return;
    }

    (async () => {
      try {
        const toss = await loadTossPayments(clientKey);
        const widgets = toss.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: "KRW", value: AMOUNT });
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        setReady(true);
      } catch (e: any) {
        console.error(e);
        setError("결제 위젯 로딩 실패: " + (e?.message || String(e)));
      }
    })();
  }, [orderId]);

  const onPay = async () => {
    if (!widgetsRef.current || !orderId) return;
    setPaying(true);
    try {
      // 언락 결제는 성공 URL에 type=sim-unlock 쿼리 추가 → success 페이지가 분기 처리
      const successBase = window.location.origin + "/payment/success";
      const successUrl =
        type === "sim-unlock" ? `${successBase}?type=sim-unlock` : successBase;
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl,
        failUrl: window.location.origin + "/payment/fail",
      });
      // 위 호출은 성공 시 리디렉션되므로 아래 코드는 실행되지 않음
    } catch (e: any) {
      console.error(e);
      setError("결제 요청 실패: " + (e?.message || String(e)));
      setPaying(false);
    }
  };

  return (
    <div style={{ background: "#FFF5F7", minHeight: "100vh" }}>
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/")}
          className="text-[12px] text-[#8E8A9D] mb-3"
          style={{ background: "none", border: "none", cursor: "pointer" }}>
          ← 돌아가기
        </button>

        <div className="bg-white rounded-[20px] p-5 mb-4 border border-[#FFD6E0]">
          <div className="text-sm font-bold text-[#2D2B3D] mb-1">{ORDER_NAME}</div>
          <div className="text-[12px] text-[#8E8A9D] mb-3">
            {product.subtitle}
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-[#FFE8EC]">
            <span className="text-[13px] text-[#8E8A9D]">결제 금액</span>
            <span className="text-[20px] font-bold text-[#E8456A]">
              ₩{AMOUNT.toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-white rounded-[16px] p-4 mb-3 border border-[#FFB3B3] text-[13px] text-[#D14343]">
            {error}
          </div>
        )}

        <div id="payment-method" className="mb-3" />
        <div id="agreement" className="mb-3" />

        <button
          onClick={onPay}
          disabled={!ready || paying}
          className="w-full py-4 rounded-[16px] text-white text-base font-bold"
          style={{
            background:
              ready && !paying
                ? "linear-gradient(135deg, #FF6B8A, #E8456A)"
                : "#D0CDE0",
            boxShadow: ready ? "0 4px 20px rgba(255,107,138,0.2)" : "none",
            border: "none",
            cursor: ready && !paying ? "pointer" : "not-allowed",
          }}>
          {paying ? "결제 진행 중..." : `₩${AMOUNT.toLocaleString()} 결제하기`}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>로딩 중...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
