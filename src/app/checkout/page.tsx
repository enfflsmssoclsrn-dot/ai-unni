"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

// Palette (payment-page.jsx 원본)
const P_CREAM = "#F4EFE6";
const P_CREAM_SUB = "#EDE6D8";
const P_CREAM_CARD = "#FAF6EC";
const P_DARK = "#2B2420";
const P_MUTED = "#8A7F75";
const P_RED = "#D94F4F";
const P_MUSTARD = "#C9A961";
const P_BORDER = "#E5DCC9";

function PayIcon({
  type,
  size = 16,
  color = P_DARK,
}: {
  type: "back" | "check" | "chev" | "info";
  size?: number;
  color?: string;
}) {
  const s = {
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "back")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    );
  if (type === "check")
    return (
      <svg {...s} viewBox="0 0 24 24" strokeWidth={2}>
        <path d="m5 12 4 4 10-10" />
      </svg>
    );
  if (type === "chev")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="m9 6 6 6-6 6" />
      </svg>
    );
  if (type === "info")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v.5M12 11v5" />
      </svg>
    );
  return null;
}

// ─── 결제 상품 정의 (분석 / 채팅 시뮬 언락) ───
const PRODUCTS = {
  analysis: {
    name: "프리미엄 심층 분석",
    subtitle: "Gottman's relational psychology + Attachment theory",
    amount: 2900,
    orderNumber: "NO.027",
  },
  "sim-unlock": {
    name: "대화 시뮬 · 턴 15회 추가",
    subtitle: "걔 말투로 15번 더 대화 가능",
    amount: 990,
    orderNumber: "NO.+15",
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
  const [isTest, setIsTest] = useState(false);
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
    setIsTest(clientKey.startsWith("test_"));

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
  }, [orderId, AMOUNT]);

  const onPay = async () => {
    if (!widgetsRef.current || !orderId) return;
    setPaying(true);
    try {
      const successBase = window.location.origin + "/payment/success";
      const successUrl =
        type === "sim-unlock" ? `${successBase}?type=sim-unlock` : successBase;
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl,
        failUrl: window.location.origin + "/payment/fail",
      });
    } catch (e: any) {
      console.error(e);
      setError("결제 요청 실패: " + (e?.message || String(e)));
      setPaying(false);
    }
  };

  return (
    <div
      style={{
        background: P_CREAM,
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        color: P_DARK,
      }}
    >
      <div
        style={{
          padding: "16px 20px 32px",
          maxWidth: 420,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            padding: "8px 0",
            color: P_DARK,
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 16,
            fontFamily: "inherit",
          }}
          type="button"
        >
          <PayIcon type="back" size={16} />
          <span>돌아가기</span>
        </button>

        {/* Order summary */}
        <div
          style={{
            background: P_CREAM_CARD,
            border: `1px solid ${P_BORDER}`,
            padding: "20px 22px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: P_MUTED,
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            — ORDER · {product.orderNumber} —
          </div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 18,
              margin: "0 0 4px",
            }}
          >
            {ORDER_NAME}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 12,
              color: P_MUTED,
              margin: "0 0 16px",
            }}
          >
            {product.subtitle}
          </p>

          <div
            style={{
              borderTop: `1px dashed ${P_DARK}`,
              paddingTop: 14,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: P_MUTED }}>결제 금액</span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                color: P_DARK,
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              ₩{AMOUNT.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Test env notice */}
        {isTest && (
          <div
            style={{
              background: P_CREAM_SUB,
              borderLeft: `2px solid ${P_MUSTARD}`,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <PayIcon type="info" size={14} color={P_MUSTARD} />
            <span style={{ fontSize: 12, color: P_DARK, flex: 1 }}>
              테스트 환경 — 실제로 결제되지 않습니다
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fff",
              borderLeft: `2px solid ${P_RED}`,
              padding: "12px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: P_DARK,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Payment methods section header */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: P_MUTED,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            — 01 · PAYMENT METHOD —
          </div>
          <h4
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 16,
              margin: 0,
            }}
          >
            결제 방법 선택
          </h4>
        </div>

        {/* Toss widget area — SDK injects into #payment-method */}
        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${P_BORDER}`,
            padding: 18,
            marginBottom: 14,
            minHeight: 240,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              fontSize: 9,
              color: P_MUTED,
              letterSpacing: "0.15em",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              pointerEvents: "none",
            }}
          >
            via Toss Payments
          </div>
          <div id="payment-method" />
        </div>

        {/* Agreement header */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: P_MUTED,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            — 02 · AGREEMENT —
          </div>
        </div>

        {/* Toss agreement widget */}
        <div
          style={{
            background: P_CREAM_CARD,
            border: `1px solid ${P_BORDER}`,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div id="agreement" />
        </div>

        {/* CTA */}
        <button
          onClick={onPay}
          disabled={!ready || paying}
          type="button"
          style={{
            width: "100%",
            padding: "18px",
            border: "none",
            background: !ready || paying ? P_MUTED : P_DARK,
            color: P_CREAM,
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 16,
            cursor: !ready || paying ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em",
            opacity: !ready || paying ? 0.8 : 1,
          }}
        >
          {paying
            ? "결제 진행 중..."
            : `₩${AMOUNT.toLocaleString()} 결제하기 →`}
        </button>

        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: P_MUTED,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          안전한 결제 · powered by Toss Payments
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: P_CREAM,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: P_MUTED,
          }}
        >
          로딩 중...
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
