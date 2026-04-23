"use client";

import { useState, useEffect } from "react";

// Palette (loading-final.jsx 원본 그대로)
const CREAM = "#F4EFE6";
const CREAM_SUB = "#EDE6D8";
const CREAM_CARD = "#FAF6EC";
const DARK = "#2B2420";
const MUTED = "#8A7F75";
const RED = "#D94F4F";
const MUSTARD = "#C9A961";
const BORDER = "#E5DCC9";

type Mood = "reading" | "suspicious" | "blink" | "sad";

const CONVO: { l: string; r: string; mood: Mood }[] = [
  { l: "뭐해?", r: "ㅇㅇ", mood: "reading" },
  { l: "내일 볼까?", r: "음... 바빠", mood: "suspicious" },
  { l: "괜찮아?", r: "ㅇㅋ", mood: "suspicious" },
  { l: "미안해", r: "아니야", mood: "sad" },
  { l: "잘자~", r: "ㄱㄴ", mood: "reading" },
  { l: "왜 답 없어", r: "자는 중", mood: "suspicious" },
];

const PHASES = [
  { at: 0, label: "대 화 톤 스 캔 중", title: "말투 뜯어보는 중" },
  { at: 20, label: "긍 정 : 부 정 비 율", title: "가트만 비율 계산 중" },
  { at: 45, label: "애 착 유 형 매 칭", title: "관계 패턴 매칭 중" },
  { at: 70, label: "숨 은 신 호 해 석", title: "행간 읽는 중" },
  { at: 90, label: "총 평 작 성 중", title: "리포트 정리 중" },
];

const AMBIENT = [
  "응~",
  "ㅇㅇ",
  "글쎄",
  "음...",
  "ㅋㅋ",
  "ㄱㄴ",
  "나중에",
  "알겠어",
  "바빠",
  "미안",
];

function NyangFace({ mood = "reading" }: { mood?: Mood }) {
  let eyeY = 40,
    eyeRX = 5,
    eyeRY = 7,
    pupilRX = 2,
    pupilRY = 3;
  const eyeColor = MUSTARD;
  let mouthD = "M37 52 L 43 52 L 40 56 Z";
  let mouthFill: string = RED;

  if (mood === "suspicious") {
    eyeRY = 3;
    eyeY = 42;
  } else if (mood === "blink") {
    eyeRY = 0.5;
  } else if (mood === "sad") {
    eyeY = 42;
    eyeRY = 5;
    mouthD = "M36 54 Q 40 52 44 54";
    mouthFill = "none";
  }

  return (
    <svg width="110" height="110" viewBox="0 0 80 80">
      <path
        d="M14 74 C 6 50, 6 36, 14 26 C 10 14, 18 6, 26 14 C 32 10, 48 10, 54 14 C 62 6, 70 14, 66 26 C 74 36, 74 50, 66 74 Z"
        fill={DARK}
      />
      <g
        style={{
          animation:
            mood === "reading" ? "nyang-scan 1.8s ease-in-out infinite" : "none",
        }}
      >
        <ellipse cx="30" cy={eyeY} rx={eyeRX} ry={eyeRY} fill={eyeColor} />
        <ellipse cx="50" cy={eyeY} rx={eyeRX} ry={eyeRY} fill={eyeColor} />
        {mood !== "blink" && mood !== "sad" && (
          <>
            <ellipse cx="30" cy={eyeY} rx={pupilRX} ry={pupilRY} fill={DARK} />
            <ellipse cx="50" cy={eyeY} rx={pupilRX} ry={pupilRY} fill={DARK} />
          </>
        )}
      </g>
      {mood === "sad" ? (
        <path
          d={mouthD}
          stroke={RED}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path d={mouthD} fill={mouthFill} />
      )}
      <circle cx="22" cy="50" r="2.5" fill={RED} opacity="0.25" />
      <circle cx="58" cy="50" r="2.5" fill={RED} opacity="0.25" />
    </svg>
  );
}

export function LoadingFinal() {
  const [progress, setProgress] = useState(0);
  const [convoIdx, setConvoIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setProgress((p) => (p >= 100 ? 100 : p + 1)),
      300
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setConvoIdx((i) => (i + 1) % CONVO.length),
      3200
    );
    return () => clearInterval(t);
  }, []);

  const phase =
    [...PHASES].reverse().find((p) => progress >= p.at) || PHASES[0];
  const convo = CONVO[convoIdx];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        padding: 48,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: 0.5,
        }}
      >
        {AMBIENT.map((text, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${8 + ((i * 9.3) % 82)}%`,
              left: "100%",
              background: i % 3 === 0 ? CREAM_SUB : CREAM_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "5px 11px",
              fontSize: 11,
              color: MUTED,
              whiteSpace: "nowrap",
              animation: `bubble-drift ${18 + (i % 5) * 3}s linear infinite`,
              animationDelay: `${-i * 2.3}s`,
            }}
          >
            {text}
          </div>
        ))}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 340,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginBottom: 36,
            minHeight: 120,
          }}
        >
          <div
            key={`l-${convoIdx}`}
            style={{
              background: CREAM_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "14px 14px 14px 3px",
              padding: "8px 13px",
              fontSize: 12,
              color: DARK,
              fontWeight: 500,
              animation: "pop-left 3.2s ease-out",
              minWidth: 52,
              maxWidth: 120,
            }}
          >
            {convo.l}
          </div>

          <NyangFace mood={convo.mood} />

          <div
            key={`r-${convoIdx}`}
            style={{
              background: DARK,
              color: CREAM,
              borderRadius: "14px 14px 3px 14px",
              padding: "8px 13px",
              fontSize: 12,
              fontWeight: 500,
              animation: "pop-right 3.2s ease-out 0.8s both",
              minWidth: 36,
              maxWidth: 120,
            }}
          >
            {convo.r}
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: MUTED,
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          — {phase.label} —
        </div>

        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 22,
            color: DARK,
            marginBottom: 10,
            letterSpacing: "-0.01em",
          }}
        >
          {phase.title}
          <span style={{ opacity: 0.4 }}>...</span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 13,
            color: MUTED,
            marginBottom: 36,
          }}
        >
          The Gottman Ratio · 5:1 균형 분석
        </div>

        <div
          style={{
            height: 2,
            background: BORDER,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: DARK,
              transition: "width 0.3s linear",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-serif)",
            fontSize: 11,
            color: MUTED,
            fontStyle: "italic",
          }}
        >
          <span>30초 정도 걸려요</span>
          <span>{progress}%</span>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes nyang-scan {
          0%, 100% { transform: translateX(-2.5px); }
          50%      { transform: translateX(2.5px); }
        }
        @keyframes pop-left {
          0%   { opacity: 0; transform: translateX(12px) scale(0.9); }
          15%  { opacity: 1; transform: translateX(0) scale(1); }
          85%  { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(-4px) scale(0.95); }
        }
        @keyframes pop-right {
          0%   { opacity: 0; transform: translateX(-12px) scale(0.9); }
          15%  { opacity: 1; transform: translateX(0) scale(1); }
          85%  { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(4px) scale(0.95); }
        }
        @keyframes bubble-drift {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100vw - 200px)); }
        }
      `,
        }}
      />
    </div>
  );
}
