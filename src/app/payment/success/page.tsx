"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingFinal } from "@/app/analyze/LoadingFinal";
import { NyangUnlockReveal } from "./NyangUnlockReveal";

const PAID_KEY = "ai-unni-paid";
const PAID_RESULT_KEY = "ai-unni-paid-result";
const FREE_RESULT_KEY = "ai-unni-free-result-pending";
const PAID_ORDER_ID_KEY = "ai-unni-paid-order-id";        // 부모 분석 주문 ID (시뮬용)
const SIM_SESSION_ID_KEY = "ai-unni-sim-session-id";      // 채팅 시뮬 세션 ID
const SIM_UNLOCK_PENDING_KEY = "ai-unni-sim-unlock-done"; // 언락 결제 완료 플래그

// ─── 이론 기반 진행 단계 (분석이 오래 걸려도 믿음 있게) ───
const STEPS = [
  { msg: "가트만의 긍정:부정 상호작용 비율 계산 중", detail: "The Gottman Ratio · 5:1 균형 분석", pct: 18 },
  { msg: "애착 유형(안정·불안·회피) 판별 중", detail: "Attachment Theory · Bowlby & Ainsworth", pct: 40 },
  { msg: "4가지 위험 신호 스캔 중", detail: "비난 · 방어 · 경멸 · 담쌓기", pct: 62 },
  { msg: "전환 시도(Bids for Connection) 반응 분석", detail: "관계 유지의 핵심 지표", pct: 82 },
  { msg: "맞춤 행동 전략 생성 중", detail: "네 상황에 딱 맞는 실전 멘트", pct: 94 },
];

// ─── 턴 언락 진행 단계 (짧게) ───
const UNLOCK_STEPS = [
  { msg: "결제 확인 중", detail: "토스페이먼츠 승인", pct: 40 },
  { msg: "+15턴 추가 중", detail: "대화 세션 업데이트", pct: 90 },
];

type ProgressStep = { msg: string; detail: string; pct: number };
function AnalysisProgress({ steps, header, footer }: { steps: readonly ProgressStep[]; header: string; footer: string }) {
  const [i, setI] = useState(0);
  const [smoothPct, setSmoothPct] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 4500);
    return () => clearInterval(iv);
  }, [steps.length]);

  useEffect(() => {
    const t = setTimeout(() => setSmoothPct(steps[i].pct), 100);
    return () => clearTimeout(t);
  }, [i, steps]);

  return (
    <div>
      <div
        className="w-[38px] h-[38px] mx-auto mb-4 rounded-full animate-spin"
        style={{ border: "3px solid #FFD6E0", borderTopColor: "#FF6B8A" }}
      />
      <div className="text-[10px] font-bold mb-2" style={{ color: "#E8456A", letterSpacing: 1.2 }}>
        {header}
      </div>
      <div className="text-[15px] font-bold text-[#2D2B3D] mb-1 leading-[1.4]">
        {steps[i].msg}...
      </div>
      <div className="text-[11px] text-[#8E8A9D] mb-4 italic">
        {steps[i].detail}
      </div>

      <div className="w-full max-w-[260px] mx-auto">
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "#FFE8EC" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${smoothPct}%`,
              background: "linear-gradient(90deg, #FF8FA3, #FF6B8A, #E8456A)",
              transition: "width 3.5s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] font-bold tabular-nums" style={{ color: "#FF6B8A" }}>
          {smoothPct}%
        </p>
      </div>

      <p className="mt-4 text-[11px] text-[#A09CB0] leading-[1.5] whitespace-pre-line">
        {footer}
      </p>
    </div>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const type =
    params.get("type") === "sim-unlock" ? "sim-unlock" : "analysis";
  const [status, setStatus] = useState<"confirming" | "analyzing" | "done" | "error">(
    "confirming"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amountStr = params.get("amount");
    const amount = amountStr ? parseInt(amountStr, 10) : NaN;

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setError("결제 정보가 올바르지 않아요.");
      return;
    }

    (async () => {
      try {
        setStatus("analyzing");

        // ─── 채팅 시뮬 +15턴 언락 확정 ───
        if (type === "sim-unlock") {
          const res = await fetch("/api/sim/unlock/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentKey,
              orderId,
              amount,
            }),
          });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json?.error || json?.debug || "언락 결제 확정 실패");
          }

          // 홈에서 세션 재진입 시 자동 동기화되도록 플래그 저장
          try {
            localStorage.setItem(SIM_SESSION_ID_KEY, json.session_id);
            localStorage.setItem(
              SIM_UNLOCK_PENDING_KEY,
              JSON.stringify({
                session_id: json.session_id,
                turns_allowed: json.turns_allowed,
                turns_used: json.turns_used,
                turns_granted: json.turns_granted,
                at: Date.now(),
              })
            );
          } catch {}

          setStatus("done");
          // sim-unlock 결제 완료 → 채팅 세션이 살아있는 /analyze 로 복귀
          setTimeout(() => router.replace("/analyze"), 1000);
          return;
        }

        // ─── 기존 심층분석 확정 ───
        // 무료 결과가 있으면 앵커로 서버에 전달 → 일관성 보장
        // (클라이언트 머지 제거 — 서버가 일관된 결과를 직접 생성)
        let freeResultForAnchor: any = null;
        try {
          const raw = localStorage.getItem(FREE_RESULT_KEY);
          if (raw) freeResultForAnchor = JSON.parse(raw);
        } catch {}

        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            freeResult: freeResultForAnchor,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || json?.debug || "결제 확정 실패");
        }

        // 유료 결과를 그대로 사용 (서버에서 이미 무료 앵커 반영하여 일관적으로 생성됨)
        const finalResult = json.result;
        try { localStorage.removeItem(FREE_RESULT_KEY); } catch {}

        // 유료 상태 + 결과 + 시뮬용 parent orderId 저장
        try {
          localStorage.setItem(PAID_KEY, "true");
          localStorage.setItem(PAID_RESULT_KEY, JSON.stringify(finalResult));
          localStorage.setItem(PAID_ORDER_ID_KEY, orderId);
        } catch {}

        // 유료 심층 분석은 UnlockReveal → 사용자 클릭으로 전환
        // (sim-unlock 타입은 위 분기에서 이미 return 처리됨)
        setStatus("done");
      } catch (e: any) {
        console.error(e);
        setStatus("error");
        setError(e?.message || String(e));
      }
    })();
  }, [params, router, type]);

  // 심층 분석 중에는 풀뷰포트 LoadingFinal로 교체
  if (status === "analyzing" && type !== "sim-unlock") {
    return <LoadingFinal />;
  }

  // 분석 끝나면 유료 유저는 UnlockReveal 시퀀스 (시뮬 언락 제외)
  if (status === "done" && type !== "sim-unlock") {
    return (
      <NyangUnlockReveal onComplete={() => router.replace("/analyze")} />
    );
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="mx-auto max-w-[420px] px-[22px] py-12 text-center">
        <div className="rounded-[14px] border border-line bg-bg-alt p-8">
          {status === "confirming" && (
            <>
              <div
                className="mx-auto mb-3 h-[36px] w-[36px] animate-spin rounded-full"
                style={{ border: "3px solid var(--color-line)", borderTopColor: "var(--color-ink)" }}
              />
              <div className="text-[15px] font-bold text-ink">결제 확인 중...</div>
            </>
          )}
          {status === "analyzing" && type === "sim-unlock" && (
            <AnalysisProgress
              steps={UNLOCK_STEPS}
              header="💬 +15턴 언락 중"
              footer={"결제가 확인되면 바로 대화로 돌아가\n잠깐만"}
            />
          )}
          {status === "done" && (
            <>
              <div className="mb-2 text-[40px]">{type === "sim-unlock" ? "💬" : "💖"}</div>
              <div className="mb-1 text-[15px] font-bold text-ink">
                {type === "sim-unlock" ? "+15턴 추가 완료!" : "분석 완료!"}
              </div>
              <div className="text-[12px] text-sub">
                {type === "sim-unlock" ? "대화 화면으로 돌아가고 있어" : "잠시 후 결과 화면으로 이동해요"}
              </div>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mb-2 text-[40px]">😥</div>
              <div className="mb-2 text-[15px] font-bold text-ink">
                문제가 생겼어요
              </div>
              <div className="mb-4 whitespace-pre-wrap text-[12px] text-sub">
                {error}
              </div>
              <button
                onClick={() => router.push("/")}
                className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                type="button"
              >
                홈으로
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>로딩...</div>}>
      <SuccessInner />
    </Suspense>
  );
}
