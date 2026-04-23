"use client";

import { useEffect, useState } from "react";

// Palette (result-reveal.jsx 원본 그대로)
const RR_CREAM = "#F4EFE6";
const RR_CREAM_CARD = "#FAF6EC";
const RR_DARK = "#2B2420";
const RR_MUTED = "#8A7F75";
const RR_RED = "#D94F4F";
const RR_MUSTARD = "#C9A961";
const RR_BORDER = "#E5DCC9";

type Phase = "loading" | "alert" | "still";

function ResultRevealNyang({ phase }: { phase: Phase }) {
  let eyeRY = 7,
    eyeRX = 5;
  if (phase === "alert") {
    eyeRY = 9;
    eyeRX = 6;
  }
  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 80 80"
      style={{
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: phase === "alert" ? "scale(1.08) rotate(-4deg)" : "scale(1)",
      }}
    >
      <path
        d="M14 74 C 6 50, 6 36, 14 26 C 10 14, 18 6, 26 14 C 32 10, 48 10, 54 14 C 62 6, 70 14, 66 26 C 74 36, 74 50, 66 74 Z"
        fill={RR_DARK}
      />
      <g style={{ transition: "all 0.3s" }}>
        <ellipse cx="30" cy="40" rx={eyeRX} ry={eyeRY} fill={RR_MUSTARD} />
        <ellipse cx="50" cy="40" rx={eyeRX} ry={eyeRY} fill={RR_MUSTARD} />
        <ellipse cx="30" cy="40" rx="2" ry="3" fill={RR_DARK} />
        <ellipse cx="50" cy="40" rx="2" ry="3" fill={RR_DARK} />
      </g>
      <path d="M37 52 L 43 52 L 40 56 Z" fill={RR_RED} />
      <circle cx="22" cy="50" r="2.5" fill={RR_RED} opacity="0.25" />
      <circle cx="58" cy="50" r="2.5" fill={RR_RED} opacity="0.25" />
    </svg>
  );
}

interface ResultRevealProps {
  score: number;
  tags?: string[];
  quote?: string;
  onDone?: () => void;
}

export function ResultReveal({
  score,
  tags = [],
  quote = "",
  onDone,
}: ResultRevealProps) {
  // stage: -1 idle, 0 alert, 1 label, 2 score, 3 subscore, 4 chips, 5 quote, 6 divider + hint
  const [stage, setStage] = useState(-1);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const TARGET_SCORE = score;

  useEffect(() => {
    const schedule: [number, number][] = [
      [0, 0],
      [400, 1],
      [700, 2],
      [1600, 3],
      [1900, 4],
      [2300, 5],
      [2800, 6],
    ];
    const timers = schedule.map(([t, s]) =>
      setTimeout(() => setStage(s), t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage < 2) return;
    const duration = 900;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setScoreDisplay(Math.round(eased * TARGET_SCORE));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, TARGET_SCORE]);

  const nyangPhase: Phase = stage >= 0 ? "alert" : "loading";

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: RR_CREAM,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        padding: "48px 32px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: 20, position: "relative" }}>
        <ResultRevealNyang phase={nyangPhase} />
        {stage >= 0 && stage < 2 && (
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -14,
              fontFamily: "var(--font-serif)",
              fontSize: 32,
              fontWeight: 400,
              color: RR_RED,
              animation:
                "rr-pop-bang 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            !
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.3em",
          color: RR_MUTED,
          marginBottom: 12,
          fontWeight: 500,
          opacity: stage >= 1 ? 1 : 0,
          transform: stage >= 1 ? "translateY(0)" : "translateY(6px)",
          transition: "all 0.5s",
        }}
      >
        — 분 석 완 료 —
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 13,
          color: RR_MUTED,
          marginBottom: 4,
          fontWeight: 400,
          opacity: stage >= 1 ? 1 : 0,
          transition: "opacity 0.5s 0.1s",
        }}
      >
        호감도 점수
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: 108,
            color: RR_DARK,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            opacity: stage >= 2 ? 1 : 0,
            transform:
              stage >= 2
                ? stage === 2
                  ? "scale(1.15)"
                  : "scale(1)"
                : "scale(0.6)",
            transition:
              "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s",
          }}
        >
          {scoreDisplay}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          color: RR_MUTED,
          fontWeight: 300,
          marginBottom: 22,
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(-6px)",
          transition: "all 0.4s",
        }}
      >
        / 100
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tags.map((label, i) => (
            <div
              key={label}
              style={{
                background: RR_CREAM_CARD,
                border: `1px solid ${RR_BORDER}`,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12,
                color: RR_DARK,
                fontWeight: 500,
                opacity: stage >= 4 ? 1 : 0,
                transform:
                  stage >= 4 ? "translateY(0)" : "translateY(-14px)",
                transition: `all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  i * 0.08
                }s`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {quote && (
        <>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: RR_MUTED,
              marginBottom: 8,
              fontWeight: 500,
              opacity: stage >= 5 ? 1 : 0,
              transition: "opacity 0.4s",
            }}
          >
            AI 냥이 한마디
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 20,
              color: RR_DARK,
              textAlign: "center",
              lineHeight: 1.4,
              maxWidth: 280,
              marginBottom: 28,
              opacity: stage >= 5 ? 1 : 0,
              transform: stage >= 5 ? "translateY(0)" : "translateY(8px)",
              transition: "all 0.6s",
            }}
          >
            &ldquo;{quote}&rdquo;
          </div>
        </>
      )}

      <div
        style={{
          width: stage >= 6 ? 140 : 0,
          borderTop: `1px dashed ${RR_DARK}`,
          transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          marginBottom: 14,
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 11,
          color: RR_MUTED,
          fontStyle: "italic",
          opacity: stage >= 6 ? 1 : 0,
          transition: "opacity 0.5s 0.2s",
        }}
      >
        상세 분석 아래로 ↓
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes rr-pop-bang {
          0%   { opacity: 0; transform: scale(0.3) rotate(-20deg); }
          60%  { opacity: 1; transform: scale(1.3) rotate(8deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `,
        }}
      />
    </div>
  );
}
