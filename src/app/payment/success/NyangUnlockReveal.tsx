"use client";

import { useEffect, useState } from "react";

// Palette (nyang-unlock-reveal.jsx 원본)
const U_CREAM = "#F4EFE6";
const U_CREAM_CARD = "#FAF6EC";
const U_DARK = "#2B2420";
const U_MUTED = "#8A7F75";
const U_MUSTARD = "#C9A961";
const U_RED = "#D94F4F";
const U_BORDER = "#E5DCC9";

type Phase = "locked" | "unlocking" | "done";

function UnlockNyang({ phase }: { phase: Phase }) {
  const scale = phase === "done" ? 1 : phase === "unlocking" ? 0.9 : 0.7;
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 80 80"
      style={{
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: `scale(${scale})`,
      }}
    >
      <path
        d="M14 74 C 6 50, 6 36, 14 26 C 10 14, 18 6, 26 14 C 32 10, 48 10, 54 14 C 62 6, 70 14, 66 26 C 74 36, 74 50, 66 74 Z"
        fill={U_DARK}
      />
      {phase === "done" ? (
        <>
          <ellipse cx="30" cy="40" rx="6" ry="7.5" fill={U_MUSTARD} />
          <ellipse cx="50" cy="40" rx="6" ry="7.5" fill={U_MUSTARD} />
          <path
            d="M30 34 L 30 46 M 50 34 L 50 46"
            stroke={U_DARK}
            strokeWidth="1.8"
          />
          <circle cx="32" cy="37" r="1.5" fill="#fff" opacity="0.9" />
          <circle cx="52" cy="37" r="1.5" fill="#fff" opacity="0.9" />
        </>
      ) : (
        <>
          <ellipse cx="30" cy="40" rx="4" ry="5" fill={U_MUSTARD} />
          <ellipse cx="50" cy="40" rx="4" ry="5" fill={U_MUSTARD} />
          <path
            d="M30 36 L 30 44 M 50 36 L 50 44"
            stroke={U_DARK}
            strokeWidth="1.4"
          />
        </>
      )}
      <path d="M37 52 L 43 52 L 40 56 Z" fill={U_RED} />
    </svg>
  );
}

function LockIcon({ open, size = 44 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      style={{ display: "block" }}
    >
      <path
        d={
          open
            ? "M13 20 V 14 A 9 9 0 0 1 31 14 V 8"
            : "M13 20 V 14 A 9 9 0 0 1 31 14 V 20"
        }
        stroke={U_DARK}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        style={{ transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
      <rect x="8" y="20" width="28" height="20" rx="2" fill={U_DARK} />
      <circle cx="22" cy="28" r="2.2" fill={U_MUSTARD} />
      <rect x="21" y="29" width="2" height="5" fill={U_MUSTARD} />
    </svg>
  );
}

export function NyangUnlockReveal({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const schedule: [number, number][] = [
      [300, 1],
      [900, 2],
      [1400, 3],
      [1800, 4],
      [2800, 5],
      [3400, 6],
    ];
    const timers = schedule.map(([t, s]) => setTimeout(() => setStage(s), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  const nyangPhase: Phase = stage >= 2 ? "done" : "locked";

  const reports = [
    { num: "01", title: "숨은 신호 해석", sub: "Hidden cues" },
    { num: "02", title: "걔 속마음 풀 리포트", sub: "Full mind report" },
    { num: "03", title: "네가 놓치고 있는 것", sub: "Blind spots" },
    { num: "04", title: "바로 쓸 수 있는 멘트", sub: "Ready-to-send" },
    { num: "05", title: "대화 시뮬레이션", sub: "Realtime chat" },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: U_CREAM,
        fontFamily: "var(--font-sans)",
        color: U_DARK,
        padding: "56px 24px 32px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {stage >= 2 &&
        [
          [12, 18],
          [88, 14],
          [8, 42],
          [92, 48],
          [20, 72],
          [82, 78],
        ].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 4,
              height: 4,
              background: U_MUSTARD,
              transform: "rotate(45deg)",
              opacity: 0,
              animation: `u-twinkle 2.4s ease-in-out ${0.3 + i * 0.2}s infinite`,
            }}
          />
        ))}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 28,
          position: "relative",
          height: 120,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 20,
            opacity: stage < 2 ? 1 : 0,
            transform: stage < 2 ? "scale(1)" : "scale(0.5)",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <LockIcon open={stage >= 1} size={56} />
          {stage === 1 && (
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -18,
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                color: U_MUSTARD,
                animation:
                  "u-pop-bang 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              ✦
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 10,
            opacity: stage >= 2 ? 1 : 0,
            transition: "opacity 0.4s",
          }}
        >
          <UnlockNyang phase={nyangPhase} />
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.5s",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.35em",
            color: U_MUSTARD,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          — P R E M I U M · U N L O C K E D —
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 26,
            color: U_DARK,
            letterSpacing: "-0.01em",
            marginBottom: 6,
          }}
        >
          속마음, 열렸다냥
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: U_MUTED,
            fontWeight: 300,
          }}
        >
          Five hidden reports · now yours
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {reports.map((r, i) => (
          <div
            key={r.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: U_CREAM_CARD,
              border: `1px solid ${U_BORDER}`,
              padding: "12px 14px",
              marginBottom: 6,
              opacity: stage >= 4 ? 1 : 0,
              transform: stage >= 4 ? "translateX(0)" : "translateX(-20px)",
              transition: `all 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s`,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                color: U_DARK,
                fontWeight: 400,
                width: 28,
              }}
            >
              {r.num}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: 13.5,
                  color: U_DARK,
                  marginBottom: 1,
                }}
              >
                {r.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 10.5,
                  color: U_MUTED,
                  letterSpacing: "0.08em",
                }}
              >
                {r.sub}
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{ flexShrink: 0 }}
              aria-hidden
            >
              <path
                d="M3 7.5 L 6 10.5 L 11.5 4"
                stroke={U_MUSTARD}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          opacity: stage >= 5 ? 1 : 0,
          transform: stage >= 5 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.6s",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: U_MUTED,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          AI 냥이 한마디
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 19,
            color: U_DARK,
            lineHeight: 1.45,
            maxWidth: 300,
            margin: "0 auto",
          }}
        >
          &ldquo;이제 냥이가 다 풀어줄게, 천천히 보면 된다냥.&rdquo;
        </div>
      </div>

      <div
        style={{
          opacity: stage >= 6 ? 1 : 0,
          transform: stage >= 6 ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s",
        }}
      >
        <button
          onClick={() => onComplete?.()}
          disabled={stage < 6}
          type="button"
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            background: U_DARK,
            color: U_CREAM,
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 15,
            cursor: stage < 6 ? "default" : "pointer",
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>풀린 리포트 보러가기</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 7 H 11 M 7 3 L 11 7 L 7 11"
              stroke={U_CREAM}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: U_MUTED,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          · 결제 완료 · 영구 소장 ·
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes u-twinkle {
          0%, 100% { opacity: 0; transform: rotate(45deg) scale(0.5); }
          50%      { opacity: 1; transform: rotate(45deg) scale(1.2); }
        }
        @keyframes u-pop-bang {
          0%   { opacity: 0; transform: scale(0.3) rotate(-20deg); }
          60%  { opacity: 1; transform: scale(1.4) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `,
        }}
      />
    </div>
  );
}
