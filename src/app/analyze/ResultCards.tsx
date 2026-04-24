"use client";

import type { CSSProperties } from "react";

// ─────────────────────────────────────────
// Palette (nyang-result-cards.jsx 기반 · full rewrite v2026-04-24)
// ─────────────────────────────────────────
const R_CREAM = "#F4EFE6";
const R_CREAM_SUB = "#EDE6D8";
const R_CREAM_CARD = "#FAF6EC";
const R_DARK = "#2B2420";
const R_MUTED = "#8A7F75";
const R_MUSTARD = "#C9A961";
const R_BORDER = "#E5DCC9";

// Card tone variants
const TONE_BLUE = { bg: "#E8EBEF", border: "#D6DBE2", accent: "#4A5668" };
const TONE_PINK = { bg: "#F0E4DD", border: "#E2D0C5", accent: "#B86A5B" };

// ─────────────────────────────────────────
// Line icons
// ─────────────────────────────────────────
type IconType =
  | "bulb"
  | "alert"
  | "refresh"
  | "download"
  | "radar"
  | "search"
  | "thought"
  | "bolt"
  | "target"
  | "chat"
  | "lock";

function LineIcon({
  type,
  size = 18,
  color = R_DARK,
  stroke = 1.5,
}: {
  type: IconType;
  size?: number;
  color?: string;
  stroke?: number;
}) {
  const s = {
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "bulb")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3A6 6 0 0 0 12 3z" />
      </svg>
    );
  if (type === "alert")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M12 3 2 20h20z" />
        <path d="M12 10v4M12 17v.5" />
      </svg>
    );
  if (type === "refresh")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
      </svg>
    );
  if (type === "download")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M12 3v13M6 11l6 6 6-6M4 21h16" />
      </svg>
    );
  if (type === "radar")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    );
  if (type === "search")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  if (type === "thought")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M4 10a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5H11l-4 3v-3.2A5 5 0 0 1 4 12z" />
      </svg>
    );
  if (type === "bolt")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
      </svg>
    );
  if (type === "target")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill={color} />
      </svg>
    );
  if (type === "chat")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.8-5.2A8 8 0 1 1 21 12z" />
      </svg>
    );
  if (type === "lock")
    return (
      <svg {...s} viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="1.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  return null;
}

// ─────────────────────────────────────────
// NyangFace — 3 emotion variants
// ─────────────────────────────────────────
type Emotion = "love" | "doctor" | "wise";

export function NyangFace({
  size = 48,
  emotion = "love",
}: {
  size?: number;
  emotion?: Emotion;
}) {
  const BLACK = "#0B0B0E";
  const YELLOW = "#F7C948";
  const PINK = "#E94B6A";
  const RED = "#D94F4F";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d="M14 74 C 6 50, 6 36, 14 26 C 10 14, 18 6, 26 14 C 32 10, 48 10, 54 14 C 62 6, 70 14, 66 26 C 74 36, 74 50, 66 74 Z"
        fill={BLACK}
      />
      {emotion === "love" && (
        <>
          <path
            d="M25 42 Q30 36 35 42"
            stroke={YELLOW}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M45 42 Q50 36 55 42"
            stroke={YELLOW}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {emotion === "doctor" && (
        <>
          <ellipse cx="30" cy="40" rx="5" ry="7" fill={YELLOW} />
          <ellipse cx="50" cy="40" rx="5" ry="7" fill={YELLOW} />
          <path
            d="M30 34 L 30 46 M 50 34 L 50 46"
            stroke={BLACK}
            strokeWidth="1.6"
          />
        </>
      )}
      {emotion === "wise" && (
        <>
          <ellipse cx="30" cy="41" rx="5" ry="5" fill={YELLOW} />
          <ellipse cx="50" cy="41" rx="5" ry="5" fill={YELLOW} />
          <path
            d="M30 36 L 30 46 M 50 36 L 50 46"
            stroke={BLACK}
            strokeWidth="1.5"
          />
          <path
            d="M25 38 Q30 36 35 38 M45 38 Q50 36 55 38"
            stroke={BLACK}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      <path d="M37 52 L 43 52 L 40 56 Z" fill={PINK} />
      <path
        d="M40 56 Q 37 60 34 58 M 40 56 Q 43 60 46 58"
        stroke="#1E1E25"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {emotion === "love" && (
        <path
          d="M60 18 C60 14 66 14 66 18 C66 14 72 14 72 18 C72 24 66 28 66 28 C66 28 60 24 60 18 Z"
          fill={RED}
          stroke={BLACK}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      )}
      {emotion === "doctor" && (
        <g>
          <path
            d="M55 62 Q 62 68 68 66 Q 74 64 72 56"
            stroke={BLACK}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="72" cy="52" r="4" fill={BLACK} stroke={YELLOW} strokeWidth="1.3" />
          <circle cx="72" cy="52" r="1.5" fill={YELLOW} />
        </g>
      )}
      {emotion === "wise" && (
        <g>
          <circle cx="50" cy="41" r="8" fill="none" stroke={BLACK} strokeWidth="1.8" />
          <circle cx="50" cy="41" r="8" fill="#fff" opacity="0.08" />
          <path d="M58 44 L 64 52" stroke={BLACK} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 1 — NyangMessage (공감 말풍선 · 크림)
// ═════════════════════════════════════════════════════════════
export function NyangMessage({ message }: { message?: string }) {
  const body =
    message ||
    "이 불안, 이 관계 때문만은 아닐 수 있어. 너 자신이 혼자서도 괜찮다는 감각, 그게 있어야 연애도 덜 흔들려. 지금 네가 느끼는 불안은 네가 약해서가 아니라, 그만큼 진심이라는 거야. 이 관계가 어떻게 되든, 너는 충분히 사랑받을 자격 있다냥. 🐾";
  return (
    <div
      style={{ fontFamily: "var(--font-sans)", color: R_DARK }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <NyangFace size={40} emotion="love" />
        <div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            냥이가 해주고 싶은 말
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: R_MUTED,
              letterSpacing: "0.1em",
            }}
          >
            from 냥이 · with love
          </div>
        </div>
      </div>

      <div
        style={{
          background: R_CREAM_CARD,
          border: `1px solid ${R_BORDER}`,
          padding: "20px 22px",
          fontSize: 14.5,
          lineHeight: 1.8,
          color: R_DARK,
          position: "relative",
          whiteSpace: "pre-wrap",
        }}
      >
        {body}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 2 — HisMindCard (심리 · 블루그레이)
// ═════════════════════════════════════════════════════════════
export function HisMindCard({ psychology }: { psychology?: string }) {
  const body =
    psychology ||
    "지금 네 불안은 상대를 향한 게 아니라, '이 관계가 깨질 수 있다'는 두려움에서 오는 거야. 불안형 애착은 사랑받고 있어도 '언제 사라질지 모른다'는 공포가 기본값으로 깔려 있거든. 상대가 잘해줄 때는 괜찮다가, 조금만 반응이 느리거나 건조하면 바로 최악의 시나리오로 달려가는 패턴, 익숙하지 않냐옹?";
  return (
    <div
      style={{
        background: TONE_BLUE.bg,
        border: `1px solid ${TONE_BLUE.border}`,
        padding: 26,
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          color: TONE_BLUE.accent,
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        — THEIR MIND · 01 —
      </div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 20,
          margin: "0 0 6px",
        }}
      >
        걔 속마음 들여다보기
      </h3>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 12,
          color: TONE_BLUE.accent,
          margin: "0 0 20px",
        }}
      >
        What they&apos;re actually feeling
      </p>

      <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
        {body}
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 3 — NyangPrescription (처방 · 번호 리스트)
// ═════════════════════════════════════════════════════════════
export function NyangPrescription({
  items,
}: {
  items?: { tag: string; body: string }[];
}) {
  const fallback: { tag: string; body: string }[] = [
    {
      tag: "현실 진단",
      body:
        "솔직히 지금 상태로는, 불안의 원인을 모른 채 계속 가면 관계가 소모전이 될 수 있어. 상대가 잘못한 게 있는지, 아니면 네 패턴이 작동하는 건지 먼저 냉정하게 구분해봐.",
    },
    {
      tag: "그래도 해보고 싶다면",
      body:
        "불안이 올라올 때 상대한테 바로 확인하는 대신, 24시간 룰을 써봐. 대부분은 24시간 안에 자연스럽게 해소된다냥.",
    },
    {
      tag: "이렇게 말해봐",
      body:
        "“나 요즘 괜히 불안할 때가 있는데, 네 잘못이 아니라 내 문제인 것 같아. 그냥 가끔 안심시켜주면 좋겠어.”",
    },
  ];
  const list = items && items.length > 0 ? items : fallback;

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: R_DARK }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <NyangFace size={40} emotion="doctor" />
        <div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            냥이 처방
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: R_MUTED,
              letterSpacing: "0.1em",
            }}
          >
            Prescription · 이렇게 해봐냥
          </div>
        </div>
      </div>

      <div
        style={{
          background: R_CREAM_CARD,
          border: `1px solid ${R_BORDER}`,
          padding: "20px 22px",
        }}
      >
        {list.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "16px 0",
              borderTop: i === 0 ? "none" : `1px dashed ${R_BORDER}`,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                lineHeight: 1,
                color: R_DARK,
                fontWeight: 400,
                width: 28,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 11,
                  color: R_MUTED,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {it.tag}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {it.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 4 — ScoreReason (점수 근거 · 크림)
// ═════════════════════════════════════════════════════════════
export function ScoreReason({ items }: { items?: string[] }) {
  const fallback = [
    "사귀는 관계 자체가 유지되고 있다는 건, 상대가 완전히 관심을 끊은 게 아니라는 최소한의 신호야.",
    "불안을 느끼면서도 관계를 유지하려는 네 의지가 있다는 건, 이 관계에 진심이라는 거야.",
    "지금 불안을 인식하고 있다는 것 자체가 포인트야. 모르고 있는 것보다 훨씬 낫고, 여기서 방향을 잡을 수 있어.",
  ];
  const list = items && items.length > 0 ? items : fallback;
  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 26,
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
        — BEHIND THE SCORE · 02 —
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <LineIcon type="bulb" size={18} />
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 20,
            margin: 0,
          }}
        >
          왜 이 점수냐면
        </h3>
      </div>

      <div>
        {list.map((body, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 0",
              borderTop: i === 0 ? `1px solid ${R_BORDER}` : "none",
              borderBottom: `1px solid ${R_BORDER}`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 14,
                color: R_MUTED,
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              i.{String.fromCharCode(105 + i)}
            </span>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.75,
                margin: 0,
                flex: 1,
                whiteSpace: "pre-wrap",
              }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 5 — WarningCard (걱정 · 더스티핑크)
// ═════════════════════════════════════════════════════════════
export function WarningCard({ items }: { items?: string[] }) {
  const fallback = [
    "불안할 때마다 상대한테 확인받으려 하면, 상대 입장에서는 '내가 뭘 해도 부족한가?'라는 피로감이 쌓여.",
    "지금 불안의 원인이 상대 행동인지, 네 내면 패턴인지 구분 안 하고 넘어가면 다음 관계에서도 똑같이 반복돼.",
  ];
  const list = items && items.length > 0 ? items.filter(Boolean) : fallback;
  if (list.length === 0) return null;
  return (
    <div
      style={{
        background: TONE_PINK.bg,
        border: `1px solid ${TONE_PINK.border}`,
        padding: 26,
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.3em",
          color: TONE_PINK.accent,
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        — RED FLAGS · 03 —
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <LineIcon type="alert" size={18} color={TONE_PINK.accent} />
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 20,
            margin: 0,
          }}
        >
          냥이가 걱정되는 거
        </h3>
      </div>

      <div>
        {list.map((body, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 0",
              borderTop: i === 0 ? `1px solid ${TONE_PINK.border}` : "none",
              borderBottom: `1px solid ${TONE_PINK.border}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 0,
                background: TONE_PINK.accent,
                marginTop: 8,
                flexShrink: 0,
                transform: "rotate(45deg)",
              }}
            />
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.75,
                margin: 0,
                flex: 1,
                whiteSpace: "pre-wrap",
              }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 6 — NyangVerdict (총평 · wise 냥이)
// ═════════════════════════════════════════════════════════════
export function NyangVerdict({ diagnosis }: { diagnosis?: string }) {
  const body =
    diagnosis ||
    "사귀는 사이인데 불안하다는 거, 두 가지 경우야. 상대가 실제로 애매한 행동을 하고 있거나, 아니면 네 불안 패턴이 관계를 흔들고 있거나. 냥이가 지켜보기엔 지금 둘 다 섞여 있다냥.";
  return (
    <div style={{ fontFamily: "var(--font-sans)", color: R_DARK }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <NyangFace size={40} emotion="wise" />
        <div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            AI 냥이 총평
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: R_MUTED,
              letterSpacing: "0.1em",
            }}
          >
            Editor&apos;s note
          </div>
        </div>
      </div>

      <div
        style={{
          background: R_CREAM_CARD,
          border: `1px solid ${R_BORDER}`,
          padding: "22px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 36,
            color: R_DARK,
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          &ldquo;
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 7 — AffectionRadar (6축 · 냥이 한줄 코멘트)
// ═════════════════════════════════════════════════════════════
// 서버 result.axes 는 한글 key로 내려옴 (관심도/적극성/반응성/친밀감/일관성/미래지향)
// 영문 key도 들어오면 수용하도록 alias 포함.
const AXIS_META: {
  key: string;
  aliases: string[];
  label: string;
  sub: string;
}[] = [
  {
    key: "관심도",
    aliases: ["interest"],
    label: "관심도",
    sub: "너한테 얼마나 호기심 있는지",
  },
  {
    key: "적극성",
    aliases: ["proactivity"],
    label: "적극성",
    sub: "먼저 다가오는 정도",
  },
  {
    key: "반응성",
    aliases: ["responsiveness"],
    label: "반응성",
    sub: "답장·리액션 퀄리티",
  },
  {
    key: "친밀감",
    aliases: ["intimacy"],
    label: "친밀감",
    sub: "속마음 공유하는 정도",
  },
  {
    key: "일관성",
    aliases: ["consistency"],
    label: "일관성",
    sub: "행동이 안정적인지",
  },
  {
    key: "미래지향",
    aliases: ["future", "future_orientation"],
    label: "미래지향",
    sub: "같이 뭐 하자는 의사",
  },
];

function readAxisValue(
  axes: Record<string, number> | null | undefined,
  meta: { key: string; aliases: string[] }
): number | null {
  if (!axes) return null;
  const candidates = [meta.key, ...meta.aliases];
  for (const c of candidates) {
    const v = axes[c];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function commentFor(label: string, v: number) {
  if (v >= 75) return `${label} 강해. 확실한 신호다냥.`;
  if (v >= 60) return `${label}은 괜찮은 편. 꾸준히만 가면 돼.`;
  if (v >= 45) return `${label} 중간 지대. 여기서 갈린다냥.`;
  if (v >= 30) return `${label} 약해. 여기가 불안 포인트냐옹.`;
  return `${label} 많이 낮아. 솔직히 걱정되는 축이야.`;
}

export function AffectionRadar({
  axes,
}: {
  axes?: Record<string, number> | null;
}) {
  // 한글 key 우선, 영문 alias 폴백
  const values = AXIS_META.map((m) => {
    const raw = readAxisValue(axes, m);
    const v = raw == null ? 50 : Math.max(0, Math.min(100, raw));
    return {
      ...m,
      value: v,
      comment: commentFor(m.label, v),
    };
  });

  const cx = 160,
    cy = 150,
    R = 100;
  const N = 6;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const pt = (i: number, r: number) =>
    [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as const;
  const ringPoints = (ratio: number) =>
    values.map((_, i) => pt(i, R * ratio).join(",")).join(" ");
  const dataPoints = values
    .map((a, i) => pt(i, R * (a.value / 100)).join(","))
    .join(" ");

  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 26,
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
        — AFFECTION RADAR · 04 —
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <LineIcon type="radar" size={18} />
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 20,
            margin: 0,
          }}
        >
          호감도 레이더
        </h3>
      </div>

      <div
        style={{
          background: R_CREAM_SUB,
          borderLeft: `2px solid ${R_DARK}`,
          padding: "10px 14px",
          margin: "12px 0 18px",
          fontSize: 12.5,
          lineHeight: 1.7,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: R_DARK,
            display: "block",
            marginBottom: 4,
          }}
        >
          WHY IT MATTERS
        </span>
        호감도를 하나로 퉁치면 놓치는 게 많아. 관심·반응·적극·일관·친밀·미래 6축으로 쪼개야 어디가 약한지, 왜 애매한지 보인다냥.
      </div>

      <svg viewBox="0 0 320 300" style={{ width: "100%", display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <polygon
            key={i}
            points={ringPoints(r)}
            fill="none"
            stroke={R_BORDER}
            strokeWidth="1"
            strokeDasharray={i === 3 ? "0" : "2 3"}
          />
        ))}
        {values.map((_, i) => {
          const [x, y] = pt(i, R);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={R_BORDER}
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={dataPoints}
          fill={R_DARK}
          fillOpacity="0.12"
          stroke={R_DARK}
          strokeWidth="1.5"
        />
        {values.map((a, i) => {
          const [x, y] = pt(i, R * (a.value / 100));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill={R_CREAM_CARD}
              stroke={R_DARK}
              strokeWidth="1.5"
            />
          );
        })}
        {values.map((a, i) => {
          const [x, y] = pt(i, R + 22);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-serif)"
              fontSize="12"
              fill={R_DARK}
              fontWeight="500"
            >
              {a.label}
            </text>
          );
        })}
      </svg>

      <div style={{ marginTop: 20 }}>
        {values.map((a, i) => (
          <div
            key={a.key}
            style={{
              padding: "14px 0",
              borderTop: i === 0 ? `1px solid ${R_BORDER}` : "none",
              borderBottom: `1px solid ${R_BORDER}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 600,
                    fontSize: 14,
                    marginRight: 8,
                  }}
                >
                  {a.label}
                </span>
                <span style={{ fontSize: 11.5, color: R_MUTED }}>{a.sub}</span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: R_DARK,
                }}
              >
                {a.value}
                <span style={{ color: R_MUTED, fontSize: 11 }}>/100</span>
              </span>
            </div>
            <div
              style={{ height: 2, background: R_BORDER, marginBottom: 8 }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${a.value}%`,
                  background: R_DARK,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                fontFamily: "var(--font-script)",
                fontSize: 15,
                color: R_DARK,
                lineHeight: 1.45,
                fontStyle: "italic",
              }}
            >
              <span
                style={{
                  color: R_MUSTARD,
                  fontSize: 12,
                  flexShrink: 0,
                  fontFamily: "var(--font-sans)",
                }}
              >
                🐾
              </span>
              <span>{a.comment}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 8 — NyangFooter (다시 분석 · 리포트 저장)
// ═════════════════════════════════════════════════════════════
export function NyangFooter({
  onReset,
  onSave,
}: {
  onReset?: () => void;
  onSave?: () => void;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        color: R_DARK,
        padding: "32px 0 16px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 10,
          }}
        >
          <div style={{ width: 40, borderTop: `1px solid ${R_DARK}` }} />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 12,
              letterSpacing: "0.1em",
            }}
          >
            fin.
          </span>
          <div style={{ width: 40, borderTop: `1px solid ${R_DARK}` }} />
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.05em",
          }}
        >
          AI 냥이 · 연애 분석
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: R_MUTED,
            marginTop: 4,
            letterSpacing: "0.15em",
          }}
        >
          Issue · 026 · 30일 후 자동 파기 · 안심하라냥
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
      >
        <button
          onClick={onReset}
          type="button"
          style={{
            padding: "16px 14px",
            border: "none",
            background: R_DARK,
            color: R_CREAM,
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 14,
            cursor: onReset ? "pointer" : "default",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <LineIcon type="refresh" size={14} color={R_CREAM} />
          <span>다시 분석하기</span>
        </button>
        <button
          onClick={onSave}
          type="button"
          style={{
            padding: "16px 14px",
            background: "transparent",
            border: `1px solid ${R_DARK}`,
            color: R_DARK,
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 14,
            cursor: onSave ? "pointer" : "default",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <LineIcon type="download" size={14} color={R_DARK} />
          <span>리포트 저장</span>
        </button>
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 11,
          color: R_MUTED,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        · 새 분석도 무료 · 캡처만 올리면 끝 ·
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 복원: AttachmentQuadrant (무료+유료 · 원래 순서 유지)
// ═════════════════════════════════════════════════════════════

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
  const anxClamp = Math.min(100, Math.max(0, anxiety));
  const avoClamp = Math.min(100, Math.max(0, avoidance));
  const pointX = anxClamp;
  const pointY = 100 - avoClamp;

  const cell = (
    pos: string,
    kor: string,
    eng: string,
    extra: CSSProperties
  ) => {
    const active = type === kor;
    return (
      <div
        style={{
          ...extra,
          padding: 10,
          background: active ? R_CREAM_SUB : undefined,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: active ? "#D94F4F" : R_MUTED,
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
  };

  return (
    <div
      style={{
        background: R_CREAM_CARD,
        border: `1px solid ${R_BORDER}`,
        padding: 26,
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
        애착 유형을 알면 상대 행동의 이유가 보여. &ldquo;왜 자꾸 거리를 두지?&rdquo; 같은 혼란이 정리된다냥.
      </div>

      <div style={{ position: "relative", aspectRatio: "1 / 1", marginBottom: 20 }}>
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
          {cell("TL", "회피형", "dismissive", {
            borderRight: `1px dashed ${R_BORDER}`,
            borderBottom: `1px dashed ${R_BORDER}`,
          })}
          {cell("TR", "혼합형", "fearful-avoidant", {
            borderBottom: `1px dashed ${R_BORDER}`,
          })}
          {cell("BL", "안정형", "secure", {
            borderRight: `1px dashed ${R_BORDER}`,
          })}
          {cell("BR", "불안형", "anxious", {})}
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
              border: `1px solid #D94F4F`,
              animation: "q-pulse 2s ease-out infinite",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#D94F4F",
              border: `2px solid ${R_CREAM}`,
              boxShadow: `0 0 0 1px ${R_DARK}`,
            }}
          />
        </div>
      </div>

      {comment && (
        <div
          style={{
            padding: "14px 16px",
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
          <p style={{ fontSize: 13, color: R_DARK, lineHeight: 1.65, margin: 0 }}>
            {comment}
          </p>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes q-pulse { 0%{transform:scale(0.8);opacity:0.6;} 100%{transform:scale(2.2);opacity:0;} }`,
        }}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 복원: GottmanCard (Four Horsemen · 무료+유료)
// ═════════════════════════════════════════════════════════════

export function GottmanCard({
  flags,
}: {
  flags: {
    criticism: number;
    defensiveness: number;
    contempt: number;
    stonewalling: number;
  };
}) {
  const items: {
    icon: IconType;
    label: string;
    sub: string;
    value: number;
  }[] = [
    {
      icon: "alert",
      label: "비난",
      sub: "성격·인격 공격",
      value: flags.criticism ?? 0,
    },
    {
      icon: "lock",
      label: "방어",
      sub: "책임 회피 · 역공격",
      value: flags.defensiveness ?? 0,
    },
    {
      icon: "bolt",
      label: "경멸",
      sub: "깔보거나 비꼬기",
      value: flags.contempt ?? 0,
    },
    {
      icon: "chat",
      label: "담쌓기",
      sub: "대화 철회 · 무반응",
      value: flags.stonewalling ?? 0,
    },
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
        padding: 26,
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
        40년 종단연구에서 이혼을 93.6% 정확도로 예측한 4가지 신호다냥. 반복되면 관계 회복이 기하급수적으로 어려워져.
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
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <LineIcon type={it.icon} size={16} color={R_DARK} />
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 500,
                      fontSize: 15,
                      color: R_DARK,
                      marginRight: 8,
                    }}
                  >
                    {it.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: R_MUTED,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.sub}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: R_DARK,
                  fontWeight: 400,
                  flexShrink: 0,
                }}
              >
                {it.value}
                <span style={{ color: R_MUTED, fontSize: 12 }}>/100</span>
              </span>
            </div>
            <div style={{ height: 2, background: R_BORDER }}>
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
          borderLeft: `2px solid #D94F4F`,
          fontSize: 13,
          color: R_DARK,
          lineHeight: 1.6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "#D94F4F",
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
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 유지: MethodologyCard (랜딩에서 사용)
// ═════════════════════════════════════════════════════════════
export function MethodologyCard() {
  const items: { label: string; title: string; sub: string }[] = [
    {
      label: "GOTTMAN",
      title: "관계 위험 신호",
      sub: "40년 종단연구 · 이혼 예측 정확도 93.6%",
    },
    {
      label: "ATTACHMENT",
      title: "성인 애착 4유형",
      sub: "Bartholomew-Horowitz · 행동 패턴의 뿌리",
    },
    {
      label: "AI",
      title: "말투 · 텀 · 행간 해석",
      sub: "사람이 놓치는 미묘한 신호까지 수치화",
    },
  ];
  return (
    <div
      style={{
        padding: "40px 28px",
        textAlign: "center",
        fontFamily: "var(--font-sans)",
        color: R_DARK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.35em",
          color: R_MUTED,
          marginBottom: 14,
          fontWeight: 500,
        }}
      >
        METHOD · 00
      </div>

      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 24,
          margin: "0 0 8px",
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        가트만{" "}
        <span style={{ color: R_MUTED, fontWeight: 300, margin: "0 1px" }}>
          ×
        </span>{" "}
        애착이론{" "}
        <span style={{ color: R_MUTED, fontWeight: 300, margin: "0 1px" }}>
          ×
        </span>{" "}
        <span style={{ fontFamily: "var(--font-serif)" }}>AI</span>
      </h2>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 14,
          color: R_MUTED,
          margin: "0 0 40px",
        }}
      >
        Why this combination is powerful
      </p>

      <div style={{ marginBottom: 36 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              padding: "18px 0",
              borderTop: i === 0 ? "none" : `1px solid ${R_BORDER}`,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                color: R_MUTED,
                fontWeight: 300,
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                color: R_MUSTARD,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                fontSize: 17,
                color: R_DARK,
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              {it.title}
            </div>
            <div style={{ fontSize: 12.5, color: R_MUTED, lineHeight: 1.6 }}>
              {it.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${R_BORDER}`, paddingTop: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: R_MUTED,
            letterSpacing: "0.2em",
            marginBottom: 14,
          }}
        >
          Why it matters
        </div>
        <p
          style={{
            fontSize: 14,
            color: R_DARK,
            lineHeight: 1.8,
            margin: "0 0 12px",
          }}
        >
          셋을 합쳐야 <b>감정이 아닌 증거</b>로 진단할 수 있다냥.
        </p>
        <p
          style={{
            fontSize: 13,
            color: R_MUTED,
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          가트만은 관계 위험을, 애착이론은 행동의 뿌리를, AI는 말투 속 미묘한
          증거를 본다. 하나만 쓰면 놓치는 걸, 셋을 겹치면 보이거든.
        </p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 유지: PremiumCTA (free → paid 업셀 · 결과 페이지 무료 유저용)
// ═════════════════════════════════════════════════════════════
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
        <span style={{ fontSize: 11, color: R_MUTED, letterSpacing: "0.1em" }}>
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
