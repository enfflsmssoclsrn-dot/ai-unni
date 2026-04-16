"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");
  const message = params.get("message");

  return (
    <div style={{ background: "#FFF5F7", minHeight: "100vh" }}>
      <div className="max-w-[420px] mx-auto px-4 py-10 text-center">
        <div className="bg-white rounded-[24px] p-8 border border-[#FFD6E0]">
          <div className="text-[40px] mb-2">😥</div>
          <div className="text-[16px] font-bold text-[#2D2B3D] mb-2">결제가 취소됐어요</div>
          {message && (
            <div className="text-[12px] text-[#8E8A9D] mb-1">{message}</div>
          )}
          {code && (
            <div className="text-[11px] text-[#C4C0D0] mb-4">코드: {code}</div>
          )}
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-5 py-2.5 rounded-full text-white text-[13px] font-bold"
            style={{
              background: "linear-gradient(135deg, #FF6B8A, #E8456A)",
              border: "none",
              cursor: "pointer",
            }}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>로딩...</div>}>
      <FailInner />
    </Suspense>
  );
}
