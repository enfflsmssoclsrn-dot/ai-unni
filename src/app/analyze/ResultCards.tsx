"use client";

import type { CSSProperties } from "react";

// Palette (result-cards.jsx 원본 그대로)
const R_CREAM = "#F4EFE6";
const R_CREAM_SUB = "#EDE6D8";
const R_CREAM_CARD = "#FAF6EC";
const R_DARK = "#2B2420";
const R_MUTED = "#8A7F75";
const R_RED = "#D94F4F";
const R_MUSTARD = "#C9A961";
const R_BORDER = "#E5DCC9";

type IconType =
  | "search"
  | "thought"
  | "bolt"
  | "target"
  | "chat"
  | "lock"
  | "refresh"
  | "alert"
  | "shield"
  | "eyeoff"
  | "wall"
  | "compass";

function LineIcon({
  type,
  size = 18,
  color = R_DARK,
}: {
  type: IconType;
  size?: number;
  color?: string;
}) {
  const s: CSSProperties = {
    width: size,
    height: size,
  };
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "search")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  if (type === "thought")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M4 10a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5H11l-4 3v-3.2A5 5 0 0 1 4 12z" />
      </svg>
    );
  if (type === "bolt")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
      </svg>
    );
  if (type === "target")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill={color} />
      </svg>
    );
  if (type === "chat")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.8-5.2A8 8 0 1 1 21 12z" />
      </svg>
    );
  if (type === "lock")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <rect x="5" y="11" width="14" height="10" rx="1.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  if (type === "refresh")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
      </svg>
    );
  if (type === "alert")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3 2 20h20z" />
        <path d="M12 10v4M12 17v.5" />
      </svg>
    );
  if (type === "shield")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3 5 6v6c0 5 3 8 7 9 4-1 7-4 7-9V6z" />
      </svg>
    );
  if (type === "eyeoff")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <path d="M3 3l18 18M10.5 10.5a2 2 0 0 0 2.9 2.9M6.5 6.7C4 8.3 2 12 2 12s4 7 10 7c1.8 0 3.4-.5 4.7-1.2M17.3 17.3C19.9 15.7 22 12 22 12s-4-7-10-7c-1 0-2 .2-2.9.5" />
      </svg>
    );
  if (type === "wall")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <rect x="3" y="5" width="18" height="4" />
        <rect x="3" y="9" width="18" height="4" />
        <rect x="3" y="13" width="18" height="4" />
        <rect x="3" y="17" width="18" height="4" />
      </svg>
    );
  if (type === "compass")
    return (
      <svg style={s} viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="m14.5 9.5-5 1.5 1.5 5 5-1.5z" />
      </svg>
    );
  return null;
}

// ─────────────────────────────────────────
// 1) Premium CTA
// ─────────────────────────────────────────

export function PremiumCTA({
  onUnlock,
  disabled = false,
  redirecting = false,
}: {
  onUnlock: () => void;
  disabled?: boolean;
  redirecting?: boolean;
}) {
  const items: {
    icon: IconType;
    title: string;
    sub: string;
    badge?: string;
  }[] = [
    { icon: "search", title: "숨은 신호 해석", sub: "상대 행동의 진짜 의미" },
    { icon: "thought", title: "속마음 낱낱이", sub: "지금 무슨 생각을 하고 있는지" },
    { icon: "bolt", title: "네가 놓치고 있는 것", sub: "이걸 모르면 타이밍 놓쳐" },
    {
      icon: "target",
      title: "바로 쓸 수 있는 카톡 멘트",
      sub: "이렇게 치면 반응이 달라져",
    },
    {
      icon: "chat",
      title: "대화 시뮬레이션",
      sub: "말투 그대로 답장 · 2턴 무료",
      badge: "NEW",
    },
  ];

  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 28,
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          color: R_MUTED,
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        — PREMIUM · NO.027 —
      </div>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 22,
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        진짜 궁금하지 않아?
      </h3>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 14,
          color: R_MUTED,
          margin: "0 0 24px",
        }}
      >
        Five signals you&apos;re about to miss
      </p>

      <div style={{ borderTop: `1px solid ${R_BORDER}` }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 0",
              borderBottom: `1px solid ${R_BORDER}`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: R_CREAM_SUB,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LineIcon type={item.icon} size={18} color={R_DARK} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 500,
                    fontSize: 14,
                    color: R_DARK,
                  }}
                >
                  {item.title}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.15em",
                      background: R_MUSTARD,
                      color: R_DARK,
                      padding: "2px 6px",
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: R_MUTED }}>{item.sub}</div>
            </div>
            <LineIcon type="lock" size={14} color={R_MUTED} />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          margin: "24px 0 14px",
        }}
      >
        <span
          style={{ fontSize: 11, color: R_MUTED, letterSpacing: "0.1em" }}
        >
          5가지 심층 리포트
        </span>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            color: R_DARK,
            fontWeight: 400,
          }}
        >
          ₩2,900
        </span>
      </div>

      <button
        onClick={onUnlock}
        disabled={disabled}
        type="button"
        style={{
          width: "100%",
          padding: "16px",
          border: "none",
          background: disabled ? R_MUTED : R_DARK,
          color: R_CREAM,
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 15,
          borderRadius: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          letterSpacing: "0.02em",
          opacity: disabled ? 0.75 : 1,
        }}
      >
        {redirecting ? "결제창으로 이동 중..." : "속마음 열어보기 →"}
      </button>

      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 11,
          color: R_MUTED,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        · 30초면 나와요 ·
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 2) Gottman Four Horsemen
// ─────────────────────────────────────────

type Horsemen = {
  criticism: number;
  defensiveness: number;
  contempt: number;
  stonewalling: number;
};

export function GottmanCard({ flags }: { flags: Horsemen }) {
  const items: { icon: IconType; label: string; value: number }[] = [
    { icon: "alert", label: "비난", value: flags.criticism ?? 0 },
    { icon: "shield", label: "방어", value: flags.defensiveness ?? 0 },
    { icon: "eyeoff", label: "경멸", value: flags.contempt ?? 0 },
    { icon: "wall", label: "담쌓기", value: flags.stonewalling ?? 0 },
  ];
  const max = Math.max(...items.map((i) => i.value));
  const summary =
    max <= 20
      ? "모든 신호가 안전 구간이야. 건강한 대화 패턴을 보이고 있어."
      : max <= 40
        ? "전반적으로 양호해. 사소한 신호가 있지만 크게 걱정할 수준은 아니야."
        : max <= 60
          ? "일부 신호에 주의가 필요해. 지금 패턴이 반복되면 관계에 영향을 줄 수 있어."
          : "경고 수준의 신호가 감지됐어. 대화 패턴을 의식적으로 바꿔볼 필요가 있어.";

  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 28,
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          color: R_MUTED,
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        — FOUR HORSEMEN · 02 —
      </div>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 20,
          margin: "0 0 6px",
        }}
      >
        관계 위험 신호
      </h3>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 13,
          color: R_MUTED,
          margin: "0 0 18px",
        }}
      >
        Gottman&apos;s Four Horsemen of the Apocalypse
      </p>

      <div
        style={{
          padding: "12px 14px",
          background: R_CREAM_SUB,
          borderLeft: `2px solid ${R_DARK}`,
          fontSize: 12,
          color: R_DARK,
          lineHeight: 1.65,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: R_MUTED,
            marginBottom: 4,
          }}
        >
          Why it matters
        </div>
        40년 종단연구에서 이혼을 93.6% 정확도로 예측한 4가지 신호다냥.
        안전 구간이면 넘어가도 되지만, 반복되면 관계 회복이 기하급수적으로
        어려워져.
      </div>

      <div>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              padding: "14px 0",
              borderTop: i === 0 ? `1px solid ${R_BORDER}` : "none",
              borderBottom: `1px solid ${R_BORDER}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <LineIcon type={it.icon} size={16} color={R_DARK} />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  {it.label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: R_DARK,
                  fontWeight: 400,
                }}
              >
                {it.value}
                <span style={{ color: R_MUTED, fontSize: 12 }}>/100</span>
              </span>
            </div>
            <div
              style={{
                height: 2,
                background: R_BORDER,
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, Math.max(0, it.value))}%`,
                  background: R_DARK,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "14px 16px",
          background: R_CREAM_SUB,
          borderLeft: `2px solid ${R_RED}`,
          fontSize: 13,
          color: R_DARK,
          lineHeight: 1.6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: R_RED,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 4,
          }}
        >
          Warning
        </span>
        {summary}
      </div>

      <p
        style={{
          fontSize: 10,
          color: R_MUTED,
          marginTop: 14,
          lineHeight: 1.6,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
        }}
      >
        * John Gottman · &ldquo;The Seven Principles for Making Marriage Work&rdquo;
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// 3) Attachment Quadrant
// ─────────────────────────────────────────

export function AttachmentQuadrant({
  avoidance = 50,
  anxiety = 50,
  type = "혼합형",
  comment = "",
}: {
  avoidance?: number;
  anxiety?: number;
  type?: string;
  comment?: string;
}) {
  // Clamp 0-100
  const anxClamp = Math.min(100, Math.max(0, anxiety));
  const avoClamp = Math.min(100, Math.max(0, avoidance));
  // X: anxiety 0% (left=low) to 100% (right=high)
  // Y: avoidance 0% (bottom=low) to 100% (top=high) — so top = 0% from top when avo=100
  const pointX = anxClamp;
  const pointY = 100 - avoClamp;

  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 28,
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          color: R_MUTED,
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        — ATTACHMENT · 01 —
      </div>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 20,
          margin: "0 0 6px",
        }}
      >
        걔 애착 유형
      </h3>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 13,
          color: R_MUTED,
          margin: "0 0 18px",
        }}
      >
        Bartholomew-Horowitz Attachment Model
      </p>

      <div
        style={{
          padding: "12px 14px",
          background: R_CREAM_SUB,
          borderLeft: `2px solid ${R_DARK}`,
          fontSize: 12,
          color: R_DARK,
          lineHeight: 1.65,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: R_MUTED,
            marginBottom: 4,
          }}
        >
          Why it matters
        </div>
        애착 유형을 알면 상대 행동의 이유가 보여.
        &ldquo;왜 자꾸 거리를 두지?&rdquo; &ldquo;왜 답장이 들쭉날쭉?&rdquo;
        같은 혼란이 정리되고, 네가 어디서 자꾸 걸리는지도 잡힌다냥.
      </div>

      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            transform: "translate(-50%, -100%)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: R_MUTED,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}
        >
          avoidance ↑
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: -4,
            transform: "translate(100%, -50%)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: R_MUTED,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}
        >
          anxiety →
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            border: `1px solid ${R_BORDER}`,
          }}
        >
          {/* TL: high avoidance, low anxiety → 회피형 dismissive */}
          {renderQuadrantCell("TL", "회피형", "dismissive", type, {
            borderRight: `1px dashed ${R_BORDER}`,
            borderBottom: `1px dashed ${R_BORDER}`,
          })}
          {/* TR: high avoidance, high anxiety → 혼합형 fearful-avoidant */}
          {renderQuadrantCell("TR", "혼합형", "fearful-avoidant", type, {
            borderBottom: `1px dashed ${R_BORDER}`,
          })}
          {/* BL: low avoidance, low anxiety → 안정형 secure */}
          {renderQuadrantCell("BL", "안정형", "secure", type, {
            borderRight: `1px dashed ${R_BORDER}`,
          })}
          {/* BR: low avoidance, high anxiety → 불안형 anxious */}
          {renderQuadrantCell("BR", "불안형", "anxious", type, {})}
        </div>

        <div
          style={{
            position: "absolute",
            left: `${pointX}%`,
            top: `${pointY}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -18,
              borderRadius: "50%",
              border: `1px solid ${R_RED}`,
              animation: "q-pulse 2s ease-out infinite",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: R_RED,
              border: `2px solid ${R_CREAM}`,
              boxShadow: `0 0 0 1px ${R_DARK}`,
            }}
          />
        </div>
      </div>

      {comment && (
        <div
          style={{
            padding: "16px 18px",
            background: R_CREAM_SUB,
            borderLeft: `2px solid ${R_DARK}`,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: R_DARK,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {type}
          </div>
          <p
            style={{
              fontSize: 13,
              color: R_DARK,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {comment}
          </p>
        </div>
      )}

      <p
        style={{
          fontSize: 10,
          color: R_MUTED,
          marginTop: 14,
          lineHeight: 1.6,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
        }}
      >
        * Bartholomew & Horowitz (1991). 회피(감정 거리두기) × 불안(관계 불안) 두 축으로 진단.
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes q-pulse {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}

function renderQuadrantCell(
  pos: string,
  kor: string,
  eng: string,
  activeType: string,
  extraStyle: CSSProperties
) {
  const active = activeType === kor;
  return (
    <div
      style={{
        ...extraStyle,
        padding: 10,
        background: active ? R_CREAM_SUB : undefined,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: active ? R_RED : R_MUTED,
          letterSpacing: "0.2em",
          marginBottom: 2,
          fontWeight: active ? 600 : 400,
        }}
      >
        {active ? "● ACTIVE" : pos}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          color: R_DARK,
        }}
      >
        {kor}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 10,
          color: active ? R_DARK : R_MUTED,
        }}
      >
        {eng}
      </div>
    </div>
  );
}
