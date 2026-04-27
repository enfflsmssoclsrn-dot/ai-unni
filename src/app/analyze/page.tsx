"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { BtnPrimary } from "@/components/ui/BtnPrimary";
import { NyangHead, NyangEyes, NyangPaw } from "@/components/nyang-icons";
import { LoadingFree } from "./LoadingFree";
import { LoadingFinal } from "./LoadingFinal";
import { ResultReveal } from "./ResultReveal";
import {
  NyangMessage,
  HisMindCard,
  NyangPrescription,
  ScoreReason,
  WarningCard,
  NyangVerdict,
  AffectionRadar,
  NyangFooter,
  PremiumCTA,
  AttachmentQuadrant,
  GottmanCard,
  NyangLiftPath,
} from "./ResultCards";

// ─── Free Usage Limit (1/day, localStorage) ───
const FREE_LIMIT_KEY = "ai-unni-free-used";
const PAID_KEY = "ai-unni-paid";

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // "2026-04-15"
}

function hasFreeUsedToday(): boolean {
  try {
    if (localStorage.getItem(PAID_KEY) === "true") return false; // 유료 사용자는 제한 없음
    return localStorage.getItem(FREE_LIMIT_KEY) === getTodayStr();
  } catch {
    return false;
  }
}

function markFreeUsed() {
  try {
    localStorage.setItem(FREE_LIMIT_KEY, getTodayStr());
  } catch {}
}

function markPaid() {
  try {
    localStorage.setItem(PAID_KEY, "true");
  } catch {}
}

function isPaidUser(): boolean {
  try {
    return localStorage.getItem(PAID_KEY) === "true";
  } catch {
    return false;
  }
}

// ─── 유료 결과 저장/복원 ───
const PAID_RESULT_KEY = "ai-unni-paid-result";
// 결제 후 merge 용 무료 결과 임시 저장 키
const FREE_RESULT_KEY = "ai-unni-free-result-pending";

function savePaidResult(result: any) {
  try {
    localStorage.setItem(PAID_RESULT_KEY, JSON.stringify(result));
  } catch {}
}

function loadPaidResult(): any | null {
  try {
    const raw = localStorage.getItem(PAID_RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPaidResult() {
  try {
    localStorage.removeItem(PAID_RESULT_KEY);
  } catch {}
}

function saveFreeResultPending(result: any) {
  try {
    localStorage.setItem(FREE_RESULT_KEY, JSON.stringify(result));
  } catch {}
}

// ─── 대화 시뮬레이터 (parent orderId + 세션 캐시) ───
const PAID_ORDER_ID_KEY = "ai-unni-paid-order-id";            // 부모 분석 주문 ID (세션 시작용)
const SIM_SESSION_ID_KEY = "ai-unni-sim-session-id";          // 현재 세션 ID
const SIM_UNLOCK_PENDING_KEY = "ai-unni-sim-unlock-done";     // 언락 결제 완료 플래그

type ChatRole = "user" | "partner";
type ChatMessage = {
  role: ChatRole;
  content: string;
  turn_index: number;
  created_at?: string;
};
type SimPersona = {
  name_ref?: string;
  speech_style?: {
    tone?: string;
    sentence_length?: string;
    emoji_usage?: string;
    honorific?: string;
    punctuation_style?: string;
  };
  vocabulary_samples?: string[];
  attachment_style?: string;
  response_pattern?: {
    reply_speed?: string;
    initiation?: string;
    emotional_expression?: string;
  };
  do_not?: string[];
  current_feeling_toward_user?: string;
  context_summary?: string;
};

function loadPaidOrderId(): string | null {
  try {
    return localStorage.getItem(PAID_ORDER_ID_KEY);
  } catch {
    return null;
  }
}

function loadSimSessionId(): string | null {
  try {
    return localStorage.getItem(SIM_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

function saveSimSessionId(id: string) {
  try {
    localStorage.setItem(SIM_SESSION_ID_KEY, id);
  } catch {}
}

function clearSimAndOrder() {
  try {
    localStorage.removeItem(PAID_ORDER_ID_KEY);
    localStorage.removeItem(SIM_SESSION_ID_KEY);
    localStorage.removeItem(SIM_UNLOCK_PENDING_KEY);
    // 과거 구조(시뮬 히스토리) 정리
    localStorage.removeItem("ai-unni-sim-history");
  } catch {}
}

// ─── Situation Chips ───
const CHIPS = [
  { emoji: "💘", label: "썸인데 나만 진심인 것 같아", prompt: "썸 타는 중인데 나만 진심인 것 같아. " },
  { emoji: "💑", label: "사귀는 중인데 자꾸 불안해", prompt: "사귀고 있는데 자꾸 불안해. " },
  { emoji: "💔", label: "헤어졌는데 다시 가능성 있는지 모르겠어", prompt: "헤어졌는데 다시 가능성이 있는지 모르겠어. " },
  { emoji: "🤔", label: "이 사람이 날 좋아하는지 모르겠어", prompt: "이 사람이 날 좋아하는지 모르겠어. " },
  { emoji: "💍", label: "부부 사이가 너무 멀어진 느낌이야", prompt: "부부 사이인데 너무 멀어진 느낌이야. " },
];

// ─── API call helper ───
async function analyzeAPI(text: string, images: any[], tier: string) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, images, tier }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// ─── File to base64 ───
function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        data: result.split(",")[1],
        mediaType: file.type || "image/jpeg",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Score Gauge ───
function ScoreGauge({ score }: { score: number }) {
  const r = 50, c = 2 * Math.PI * r, p = (score / 100) * c;
  const [n, setN] = useState(0);
  useEffect(() => {
    let f: number; const s = performance.now();
    const go = (now: number) => {
      const t = Math.min((now - s) / 1500, 1);
      setN(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) f = requestAnimationFrame(go);
    };
    f = requestAnimationFrame(go);
    return () => cancelAnimationFrame(f);
  }, [score]);
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - p}
          transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }} />
        <text x="70" y="68" textAnchor="middle" dominantBaseline="central" fill="var(--color-ink)"
          style={{ fontSize: 32, fontWeight: 800 }}>{n}</text>
      </svg>
      <p className="text-[12px] font-semibold tracking-wide" style={{ color: "var(--color-sub)", marginTop: -8 }}>
        호감도 점수
      </p>
    </div>
  );
}

// ─── Badges ───
function StageBadge({ stage }: { stage: string }) {
  const m: Record<string, { e: string; bg: string; c: string }> = {
    // 썸/연애/재회 모드
    "관심없음": { e: "😐", bg: "var(--color-line)", c: "var(--color-sub)" },
    "예의": { e: "🙂", bg: "var(--color-bg-alt)", c: "var(--color-primary-deep)" },
    "호감": { e: "✨", bg: "var(--color-bg-alt)", c: "var(--color-primary)" },
    "썸": { e: "💕", bg: "var(--color-bg-alt)", c: "var(--color-primary)" },
    "연애직전": { e: "🔥", bg: "var(--color-bg-alt)", c: "var(--color-primary-deep)" },
    "안정기": { e: "🌿", bg: "var(--color-bg-alt)", c: "#5B8A72" },
    "권태 직전": { e: "🌫️", bg: "var(--color-line)", c: "var(--color-sub)" },
    // 부부 모드
    "권태기": { e: "🌫️", bg: "var(--color-line)", c: "var(--color-sub)" },
    "냉랭": { e: "🧊", bg: "var(--color-line)", c: "#6B7A8F" },
    "회복기": { e: "🌱", bg: "var(--color-bg-alt)", c: "#5B8A72" },
    "안정": { e: "🏡", bg: "var(--color-bg-alt)", c: "var(--color-primary)" },
    "애정기": { e: "💞", bg: "var(--color-bg-alt)", c: "var(--color-primary-deep)" },
  };
  const v = m[stage] || m["호감"];
  return (
    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
      style={{ background: v.bg, color: v.c }}>{v.e} {stage}</span>
  );
}

function TempBadge({ temperature }: { temperature: string }) {
  const te: Record<string, string> = { "차가움": "🧊", "미지근": "🌤", "따뜻": "☀️", "뜨거움": "🔥" };
  return (
    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
      style={{ background: "var(--color-bg-alt)", color: "var(--color-ink)" }}>{te[temperature] || "🌡"} {temperature}</span>
  );
}

// ─── Section Cards ───
function SectionCard({ title, icon, accent, children }: { title: string; icon: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] border border-[rgba(26,23,20,0.14)] shadow-[0_2px_20px_rgba(26,23,20,0.08)] p-5 mb-3">
      <div className="text-sm font-bold mb-3" style={{ color: accent || "var(--color-ink)" }}>{icon} {title}</div>
      {children}
    </div>
  );
}

function BulletItem({ text, color }: { text: string; color?: string }) {
  return (
    <div className="flex gap-2.5 mb-2.5 items-start">
      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color || "var(--color-primary)" }} />
      <div className="text-sm text-[var(--color-ink)] leading-[1.7]">{text}</div>
    </div>
  );
}

// ─── 레이더 차트 (6각형, 호감도 6개 축) ───
const AXIS_META: { key: string; label: string; desc: string }[] = [
  { key: "관심도", label: "관심도", desc: "너한테 얼마나 호기심 있는지" },
  { key: "적극성", label: "적극성", desc: "먼저 다가오는 정도" },
  { key: "반응성", label: "반응성", desc: "답장·리액션 퀄리티" },
  { key: "친밀감", label: "친밀감", desc: "속마음 공유하는 정도" },
  { key: "일관성", label: "일관성", desc: "행동이 안정적인지" },
  { key: "미래지향", label: "미래지향", desc: "같이 뭐 하자는 의사" },
];

// ─── 위험 신호 차트 (가트만 Four Horsemen) ───
function RedFlagsChart({ flags }: { flags: { criticism: number; defensiveness: number; contempt: number; stonewalling: number } }) {
  const items = [
    { key: "비난", value: flags.criticism, color: "var(--color-primary)", icon: "💢" },
    { key: "방어", value: flags.defensiveness, color: "var(--color-accent-c)", icon: "🛡" },
    { key: "경멸", value: flags.contempt, color: "var(--color-primary-deep)", icon: "😤" },
    { key: "담쌓기", value: flags.stonewalling, color: "var(--color-primary-deep)", icon: "🧱" },
  ];
  const maxVal = Math.max(...items.map(i => i.value), 1);
  const getLevel = (v: number) => {
    if (v <= 20) return { text: "안전", color: "#3E8C66" };
    if (v <= 40) return { text: "양호", color: "#6BAF8D" };
    if (v <= 60) return { text: "주의", color: "var(--color-primary)" };
    if (v <= 80) return { text: "경고", color: "var(--color-primary-deep)" };
    return { text: "위험", color: "#C0392B" };
  };

  return (
    <div>
      {items.map((item) => {
        const level = getLevel(item.value);
        return (
          <div key={item.key} className="mb-2.5 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px]">{item.icon}</span>
                <span className="text-[12px] font-bold text-[var(--color-ink)]">{item.key}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold" style={{ color: level.color }}>{level.text}</span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--color-sub)" }}>{item.value}</span>
              </div>
            </div>
            <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "var(--color-line)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max((item.value / 100) * 100, 3)}%`,
                  background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({ axes }: { axes: Record<string, number> }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 95; // 최대 반경
  // 12시 방향부터 시계방향 6각
  const angles = AXIS_META.map((_, i) => (-90 + i * 60) * (Math.PI / 180));

  // 값(0~100) → 점 좌표
  const point = (val: number, i: number, scale = 1) => {
    const r = (R * (val / 100)) * scale;
    return [cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i])];
  };

  // 데이터 폴리곤
  const dataPts = AXIS_META.map((m, i) => {
    const v = Math.max(0, Math.min(100, axes?.[m.key] ?? 0));
    return point(v, i);
  });
  const dataPath = dataPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // 격자 (25, 50, 75, 100%)
  const gridLevels = [25, 50, 75, 100];

  // 라벨 좌표 (최대 반경 바깥)
  const labelPt = (i: number) => {
    const r = R + 22;
    return [cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i])];
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-primary-deep)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 격자 (동심 6각형) */}
      {gridLevels.map((lv) => {
        const pts = AXIS_META.map((_, i) => point(lv, i)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        return (
          <polygon key={lv} points={pts}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={lv === 100 ? 1.2 : 0.8}
            strokeDasharray={lv === 100 ? "0" : "3 3"} />
        );
      })}

      {/* 축선 */}
      {AXIS_META.map((_, i) => {
        const [x, y] = point(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={0.8} />;
      })}

      {/* 데이터 폴리곤 */}
      <polygon points={dataPath} fill="url(#radarFill)" stroke="var(--color-primary-deep)" strokeWidth={1.8} strokeLinejoin="round" />

      {/* 데이터 점 */}
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#fff" stroke="var(--color-primary-deep)" strokeWidth={1.5} />
      ))}

      {/* 라벨 */}
      {AXIS_META.map((m, i) => {
        const [x, y] = labelPt(i);
        return (
          <text key={m.key} x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="700"
            fill="var(--color-ink)">
            {m.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── 축별 설명 + 점수 바 ───
function AxesList({ axes }: { axes: Record<string, number> }) {
  return (
    <div className="mt-2">
      {AXIS_META.map((m) => {
        const v = Math.max(0, Math.min(100, axes?.[m.key] ?? 0));
        return (
          <div key={m.key} className="mb-2.5 last:mb-0">
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-[13px] font-bold text-[var(--color-ink)]">
                {m.label} <span className="text-[11px] font-medium text-[var(--color-sub)] ml-1">{m.desc}</span>
              </div>
              <div className="text-[12px] font-bold tabular-nums" style={{ color: "var(--color-primary-deep)" }}>{v}</div>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${v}%`,
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-deep))",
                  transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 애착 유형 4분면 차트 (Bartholomew-Horowitz) ───
// X축: 불안(anxiety) 낮음(왼쪽) → 높음(오른쪽)
// Y축: 회피(avoidance) 낮음(아래) → 높음(위)
// 4사분면:
//   좌상: 회피형 (회피高 불안低) / 우상: 혼합형 (회피高 불안高)
//   좌하: 안정형 (회피低 불안低) / 우하: 불안형 (회피低 불안高)
function AttachmentChart({
  avoidance,
  anxiety,
  type,
}: {
  avoidance: number;
  anxiety: number;
  type: string;
}) {
  // ── 레이아웃 원칙: 사분면 라벨은 모두 플롯 "바깥"에 배치.
  //    상단(회피형/혼합형) · 하단(안정형/불안형) 순서로 외부에 띄워두면,
  //    데이터 점이 사분면 어디에 떨어져도 라벨이 가려지지 않음.
  const W = 280;
  const H = 270;
  const padL = 28;
  const padR = 42;   // 우측: "불안 →" 라벨 공간
  const padT = 48;   // 상단: "회피 ↑" 축 라벨 + 사분면 라벨 2줄
  const padB = 34;   // 하단: 사분면 라벨
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const cx = padL + plotW / 2;
  const cy = padT + plotH / 2;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const pointX = padL + (clamp(anxiety) / 100) * plotW;
  const pointY = padT + (1 - clamp(avoidance) / 100) * plotH;

  // 사분면 메타 (이모지 없음, 색만)
  const quadrants = [
    { label: "회피형", light: "#E6EFF8", textOn: "#3B6490", deep: "#4A7FB8", pos: "tl" },
    { label: "혼합형", light: "var(--color-bg-alt)", textOn: "#5D3F80", deep: "#7B55A6", pos: "tr" },
    { label: "안정형", light: "#E4F1E9", textOn: "#2D6B4D", deep: "#3E8C66", pos: "bl" },
    { label: "불안형", light: "var(--color-bg-alt)", textOn: "#A83557", deep: "#D64B74", pos: "br" },
  ] as const;

  // 사분면 영역 좌표
  const quadRect = (pos: string) => {
    const half = { w: plotW / 2, h: plotH / 2 };
    if (pos === "tl") return { x: padL, y: padT, ...half };
    if (pos === "tr") return { x: padL + half.w, y: padT, ...half };
    if (pos === "bl") return { x: padL, y: padT + half.h, ...half };
    return { x: padL + half.w, y: padT + half.h, ...half };
  };

  // 사분면 라벨 좌표 — 플롯 "바깥"
  //   tl/tr: 플롯 위쪽 (y = padT - 8), 각 사분면 가로 중앙
  //   bl/br: 플롯 아래쪽 (y = padT + plotH + 20), 각 사분면 가로 중앙
  const labelPos = (pos: string) => {
    if (pos === "tl") return { x: padL + plotW * 0.25, y: padT - 12 };
    if (pos === "tr") return { x: padL + plotW * 0.75, y: padT - 12 };
    if (pos === "bl") return { x: padL + plotW * 0.25, y: padT + plotH + 20 };
    return { x: padL + plotW * 0.75, y: padT + plotH + 20 };
  };

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="block mx-auto"
      style={{ maxWidth: 320 }}
    >
      <defs>
        <radialGradient id="attachDotGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="60%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-deep)" />
        </radialGradient>
        <radialGradient id="attachHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
        <filter id="attachDotShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
          <feOffset dx="0" dy="2" result="shadow" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="plotShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="shadow" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="plotClip">
          <rect x={padL} y={padT} width={plotW} height={plotH} rx="14" />
        </clipPath>
      </defs>

      {/* 플롯 드롭 섀도우 */}
      <rect x={padL - 2} y={padT - 2} width={plotW + 4} height={plotH + 4}
        fill="#fff" rx="16" filter="url(#plotShadow)" />

      {/* 사분면 배경 (라벨은 플롯 밖이므로 내부는 순수 배경만) */}
      <g clipPath="url(#plotClip)">
        {quadrants.map((q) => {
          const r = quadRect(q.pos);
          const active = q.label === type;
          return (
            <rect key={q.label} x={r.x} y={r.y} width={r.w} height={r.h}
              fill={q.light}
              opacity={active ? 1 : 0.5} />
          );
        })}
      </g>

      {/* 활성 사분면 테두리 하이라이트 */}
      {quadrants.filter((q) => q.label === type).map((q) => {
        const r = quadRect(q.pos);
        return (
          <rect key={"active-" + q.label}
            x={r.x + 1.5} y={r.y + 1.5} width={r.w - 3} height={r.h - 3}
            fill="none" stroke={q.deep} strokeWidth="1.5" strokeOpacity="0.55"
            rx="8" />
        );
      })}

      {/* 플롯 외곽 */}
      <rect x={padL} y={padT} width={plotW} height={plotH}
        fill="none" stroke="var(--color-bg-alt)" strokeWidth="1.2" rx="14" />
      {/* 십자 점선 */}
      <line x1={cx} y1={padT + 4} x2={cx} y2={padT + plotH - 4}
        stroke="#C9C2D6" strokeWidth="0.9" strokeDasharray="2 3" />
      <line x1={padL + 4} y1={cy} x2={padL + plotW - 4} y2={cy}
        stroke="#C9C2D6" strokeWidth="0.9" strokeDasharray="2 3" />

      {/* 사분면 라벨 — 플롯 "바깥"에 배치 (데이터 점이 절대 가리지 않음) */}
      {quadrants.map((q) => {
        const p = labelPos(q.pos);
        const active = q.label === type;
        return (
          <text
            key={q.label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={active ? "12" : "11"}
            fontWeight={active ? "800" : "600"}
            fill={active ? q.textOn : "#9994A8"}
            letterSpacing="0.4"
          >
            {q.label}
          </text>
        );
      })}

      {/* 축 라벨 — 최외곽 */}
      <text x={cx} y={18} textAnchor="middle"
        fontSize="10" fontWeight="700" fill="#7B9FC4" letterSpacing="1.2">
        회피 ↑
      </text>
      <text x={padL + plotW + 6} y={cy - 4} textAnchor="start"
        fontSize="10" fontWeight="700" fill="#D64B74" letterSpacing="1.2">
        불안
      </text>
      <text x={padL + plotW + 6} y={cy + 9} textAnchor="start"
        fontSize="12" fontWeight="700" fill="#D64B74">
        →
      </text>
      <text x={padL - 6} y={cy} textAnchor="end" dominantBaseline="middle"
        fontSize="9" fontWeight="600" fill="#B8B0C8" letterSpacing="0.5">
        안정
      </text>

      {/* 데이터 점 */}
      <circle cx={pointX} cy={pointY} r="18" fill="url(#attachHalo)" />
      <circle cx={pointX} cy={pointY} r="9"
        fill="url(#attachDotGrad)" opacity="0.55" />
      <circle cx={pointX} cy={pointY} r="5.5"
        fill="url(#attachDotGrad)" stroke="#fff" strokeWidth="2"
        filter="url(#attachDotShadow)" />
    </svg>
  );
}

// ─── 프리미엄 분석 예고 카드 (무료 유저용) ───
function PremiumPreview({ onUnlock, unlocking, redirecting }: { onUnlock: () => void; unlocking: boolean; redirecting?: boolean }) {
  const items = [
    { icon: "🔍", title: "걔가 보낸 숨은 신호 해석", desc: "너는 몰랐던 그 행동의 진짜 의미" },
    { icon: "💭", title: "걔 속마음 낱낱이", desc: "지금 걔 머릿속에서 무슨 생각을 하고 있는지" },
    { icon: "⚡", title: "지금 네가 놓치고 있는 것", desc: "이걸 모르면 타이밍 놓쳐" },
    { icon: "🎯", title: "바로 쓸 수 있는 카톡 멘트", desc: "이렇게 치면 걔 반응이 달라져" },
    { icon: "💬", title: "걔랑 대화 시뮬레이션 NEW", desc: "걔 말투 그대로 답장이 와 · 2턴 무료" },
  ];

  return (
    <div className="rounded-[20px] p-5 mb-3 border"
      style={{
        background: "linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-bg-alt) 100%)",
        borderColor: "var(--color-line)",
      }}>
      <p className="text-[15px] font-bold text-[var(--color-ink)] leading-[1.5] mb-1">
        걔 속마음, 진짜 궁금하지 않아?
      </p>
      <p className="text-[12px] text-[var(--color-sub)] mb-3.5 leading-[1.55]">
        지금 이대로면 모르고 지나칠 결정적 신호가 있어
      </p>
      <div className="mb-3.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 border-b last:border-b-0"
            style={{ borderColor: "rgba(26,23,20,0.06)" }}>
            <div className="text-[16px] leading-none mt-0.5">{it.icon}</div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[var(--color-ink)] leading-[1.4]">{it.title}</div>
              <div className="text-[11.5px] text-[var(--color-sub)] leading-[1.45] mt-0.5">{it.desc}</div>
            </div>
            <div className="text-[11px] font-bold text-[var(--color-primary)] shrink-0 mt-0.5">🔒</div>
          </div>
        ))}
      </div>

      <button onClick={onUnlock}
        disabled={redirecting || unlocking}
        className="w-full py-4 rounded-[16px] border-none text-white text-base font-bold transition-all"
        style={{
          background: (redirecting || unlocking)
            ? "#D0CDE0"
            : "linear-gradient(135deg, var(--color-primary), var(--color-primary-deep))",
          boxShadow: (redirecting || unlocking) ? "none" : "0 4px 20px rgba(217,117,87,0.2)",
          cursor: (redirecting || unlocking) ? "not-allowed" : "pointer",
        }}>
        {redirecting ? "결제창으로 이동 중..." : "걔 속마음 열어보기 · ₩2,900"}
      </button>
      {!redirecting && !unlocking && (
        <p className="text-center text-[11px] text-[var(--color-sub)] mt-2">⚡ 30초면 나와요</p>
      )}
    </div>
  );
}

// ─── Unlocking Progress ───
function UnlockingProgress() {
  const steps = [
    { msg: "심층 분석 시작... 🔓", pct: 20 },
    { msg: "숨은 심리 패턴 읽는 중... 🧠", pct: 45 },
    { msg: "행동 전략 짜는 중... 🎯", pct: 70 },
    { msg: "리포트 완성 중... ✍️", pct: 92 },
  ];
  const [i, setI] = useState(0);
  const [smoothPct, setSmoothPct] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 2500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSmoothPct(steps[i].pct), 100);
    return () => clearTimeout(timer);
  }, [i]);

  return (
    <div className="py-5 px-4 rounded-[20px] mb-3 text-center"
      style={{ background: "linear-gradient(135deg, var(--color-bg-alt), var(--color-bg))", border: "1px solid var(--color-line)" }}>
      <div className="w-[36px] h-[36px] mx-auto mb-3 rounded-full animate-spin"
        style={{ border: "3px solid var(--color-line)", borderTopColor: "var(--color-primary)" }} />
      <p className="text-[14px] text-[var(--color-ink)] font-semibold mb-3">{steps[i].msg}</p>
      <div className="w-full max-w-[220px] mx-auto">
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
          <div className="h-full rounded-full" style={{
            width: `${smoothPct}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-primary))",
            transition: "width 1.8s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold" style={{ color: "var(--color-primary)" }}>
          {smoothPct}%
        </p>
      </div>
    </div>
  );
}

// ─── Result Card ───
function ResultCard({ result, isPaid, onReset, onResetPaid, onUnlock, unlocking, redirecting, freeUsed }: any) {
  const prescriptionItems = isPaid && Array.isArray(result.actions)
    ? result.actions.slice(0, 3).map((body: string, i: number) => ({
        tag: ["현실 진단", "그래도 해보고 싶다면", "이렇게 말해봐"][i] || "냥이 한마디",
        body,
      }))
    : undefined;

  // NyangMessage: 유료 → actions[3] ("언니가 해주고 싶은 말"), 없으면 summary 보강
  const nyangMessage = isPaid
    ? (result.actions?.[3] || result.summary)
    : result.summary;

  const handleSave = async () => {
    try {
      const el = document.getElementById("result-card");
      if (!el) return;
      const { toPng } = await import("html-to-image");
      const btns = el.querySelectorAll<HTMLElement>("[data-footer-btn]");
      btns.forEach((b) => (b.style.display = "none"));
      const dataUrl = await toPng(el, {
        backgroundColor: "#F4EFE6",
        pixelRatio: 2,
        cacheBust: true,
      });
      btns.forEach((b) => (b.style.display = ""));

      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile && navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `AI 냥이-분석리포트.png`, {
            type: "image/png",
          });
          await navigator.share({ files: [file], title: "AI 냥이 분석 리포트" });
          return;
        } catch {}
      }
      if (isMobile) {
        const w = window.open();
        if (w) {
          w.document.write(
            `<img src="${dataUrl}" style="width:100%;"/><p style="text-align:center;color:#888;font-size:14px;">이미지를 길게 눌러서 저장해줘!</p>`
          );
        }
        return;
      }
      const link = document.createElement("a");
      link.download = "AI 냥이-분석리포트.png";
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("save image failed", e);
    }
  };

  const resetHandler = freeUsed && !isPaid ? onResetPaid : onReset;

  return (
    <div id="result-card" className="w-full animate-fadeUp flex flex-col gap-5">
      {/* 호감도 점수 요약 카드 — reveal에서 짠 후 스크롤 돌아왔을 때 재확인용 */}
      <div
        style={{
          background: "#FAF6EC",
          border: "1px solid #E5DCC9",
          padding: "20px 22px",
          fontFamily: "var(--font-sans)",
          color: "#2B2420",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#8A7F75",
            fontWeight: 500,
            marginBottom: 10,
          }}
        >
          — HOGAM SCORE · 00 —
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 64,
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#2B2420",
            }}
          >
            {result.score ?? 0}
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 18,
              color: "#8A7F75",
            }}
          >
            / 100
          </div>
        </div>
        {(result.stage || result.temperature) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.stage && <StageBadge stage={result.stage} />}
            {result.temperature && <TempBadge temperature={result.temperature} />}
          </div>
        )}
      </div>

      {/* 냥이가 해주고 싶은 말 (무료+유료) */}
      <NyangMessage message={nyangMessage} />

      {/* 애착 유형 4분면 (무료+유료) */}
      {result.attachment &&
        typeof result.attachment.avoidance === "number" &&
        typeof result.attachment.anxiety === "number" && (
          <AttachmentQuadrant
            avoidance={result.attachment.avoidance}
            anxiety={result.attachment.anxiety}
            type={result.attachment.type || ""}
            comment={result.attachment.comment || ""}
          />
        )}

      {/* 관계 위험 신호 (Gottman Four Horsemen · 무료+유료) */}
      {result.red_flags && typeof result.red_flags === "object" && (
        <GottmanCard flags={result.red_flags} />
      )}

      {/* 호감도 레이더 (유료만) */}
      {isPaid && result.axes && <AffectionRadar axes={result.axes} />}

      {/* AI 냥이 총평 (무료+유료) */}
      <NyangVerdict diagnosis={result.diagnosis} />

      {/* 왜 이 점수냐면 (유료만 · reasons) */}
      {isPaid && Array.isArray(result.reasons) && result.reasons.length > 0 && (
        <ScoreReason items={result.reasons} />
      )}

      {/* 냥이가 걱정되는 거 (유료만 · warnings) */}
      {isPaid &&
        Array.isArray(result.warnings) &&
        result.warnings.length > 0 &&
        result.warnings[0] && <WarningCard items={result.warnings} />}

      {/* 걔 속마음 (유료만 · psychology) */}
      {isPaid && result.psychology && <HisMindCard psychology={result.psychology} />}

      {/* 냥이 처방 (유료만 · actions[0..2]) */}
      {prescriptionItems && prescriptionItems.length > 0 && (
        <NyangPrescription items={prescriptionItems} />
      )}

      {/* 호감도 올리는 길 (유료만 · lift_advice 신규 필드) */}
      {isPaid &&
        Array.isArray(result.lift_advice) &&
        result.lift_advice.length > 0 && (
          <NyangLiftPath
            items={result.lift_advice}
            current={result.score}
          />
        )}

      {/* 무료 유저: 프리미엄 업셀 */}
      {!isPaid && (
        <PremiumCTA
          onUnlock={onUnlock}
          disabled={unlocking || redirecting}
          redirecting={redirecting}
        />
      )}

      {/* 페이지 푸터 — 다시 분석 + 리포트 저장 (유료만 저장 활성) */}
      <div data-footer-btn>
        <NyangFooter
          onReset={resetHandler}
          onSave={isPaid ? handleSave : undefined}
        />
      </div>
    </div>
  );
}

// ─── Save as Image ───
function SaveImageButton({ targetId }: { targetId: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) return;

      // html-to-image: Tailwind v4의 oklch() 색공간 완벽 지원
      const { toPng } = await import("html-to-image");

      // 저장 버튼 숨기기
      const saveBtn = el.querySelector("[data-save-btn]") as HTMLElement;
      if (saveBtn) saveBtn.style.display = "none";

      const dataUrl = await toPng(el, {
        backgroundColor: "var(--color-bg)",
        pixelRatio: 2,
        cacheBust: true,
      });

      // 저장 버튼 복원
      if (saveBtn) saveBtn.style.display = "";

      // iOS/모바일: Web Share API 또는 새 탭에서 이미지 열기
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.share) {
        // Web Share API (모바일 공유 시트)
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `AI 냥이-분석리포트.png`, { type: "image/png" });
          await navigator.share({ files: [file], title: "AI 냥이 분석 리포트" });
        } catch {
          // 공유 취소 또는 미지원 → 새 탭으로 열기
          const w = window.open();
          if (w) {
            w.document.write(`<img src="${dataUrl}" style="width:100%;"/><p style="text-align:center;color:#888;font-size:14px;">이미지를 길게 눌러서 저장해줘!</p>`);
          }
        }
      } else if (isMobile) {
        // Share API 없는 모바일 → 새 탭
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${dataUrl}" style="width:100%;"/><p style="text-align:center;color:#888;font-size:14px;">이미지를 길게 눌러서 저장해줘!</p>`);
        }
      } else {
        // 데스크톱: 일반 다운로드
        const link = document.createElement("a");
        link.download = `AI 냥이-분석리포트-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save image error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4" data-save-btn>
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3.5 rounded-[16px] text-sm font-semibold transition-all"
        style={{
          background: saved ? "var(--color-bg-alt)" : "var(--color-bg-alt)",
          border: saved ? "1px solid #A5D6A7" : "1px solid var(--color-line)",
          color: saved ? "#2E7D32" : "var(--color-primary)",
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}>
        {saving ? "이미지 생성 중..." : saved ? "✅ 저장 완료!" : "📸 리포트 이미지로 저장"}
      </button>
    </div>
  );
}

// ─── 채팅 시뮬레이터 (유료 분석 이후 노출, 실시간 대화형) ───
// 무료 2턴 → +15턴 ₩990 언락 반복
const UNLOCK_PRICE = 990;

function ChatBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`mb-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] px-4 py-3 text-[14px] leading-[1.55] whitespace-pre-wrap ${
          isUser
            ? "rounded-[18px] rounded-br-[4px] bg-ink text-bg"
            : "rounded-[18px] rounded-bl-[4px] border border-line bg-bg-alt text-ink"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function ChatSimulator({ parentOrderId }: { parentOrderId: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [persona, setPersona] = useState<SimPersona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnsAllowed, setTurnsAllowed] = useState(2);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [draft, setDraft] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [needUnlock, setNeedUnlock] = useState(false);
  const [unlockRedirecting, setUnlockRedirecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needImages, setNeedImages] = useState(false); // 캡처 없이 분석한 경우
  const scrollRef = useRef<HTMLDivElement>(null);

  const getClientToken = () => {
    try {
      const KEY = "ai-unni-client-token";
      let t = localStorage.getItem(KEY);
      if (!t) {
        t = crypto.randomUUID();
        localStorage.setItem(KEY, t);
      }
      return t;
    } catch {
      return "anon-" + Date.now();
    }
  };

  // 세션 초기화: 기존 세션이 있으면 GET으로 복원, 없으면 start
  useEffect(() => {
    (async () => {
      setInitializing(true);
      setError(null);
      try {
        const existing = loadSimSessionId();
        if (existing) {
          const res = await fetch(`/api/sim/session/${existing}`);
          const json = await res.json();
          if (res.ok && json.session_id) {
            setSessionId(json.session_id);
            setPersona(json.persona || null);
            setMessages(json.messages || []);
            setTurnsAllowed(json.turns_allowed ?? 2);
            setTurnsUsed(json.turns_used ?? 0);
            setNeedUnlock((json.turns_used ?? 0) >= (json.turns_allowed ?? 2));
            try {
              localStorage.removeItem(SIM_UNLOCK_PENDING_KEY);
            } catch {}
            setInitializing(false);
            return;
          }
          // 없거나 만료되면 새로 생성 (fall-through)
        }
        const res = await fetch("/api/sim/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parent_order_id: parentOrderId,
            clientToken: getClientToken(),
          }),
        });
        const json = await res.json();
        // 캡처 없으면 시뮬 불가 — 별도 안내 화면으로
        if (json?.error === "NEED_IMAGES") {
          setNeedImages(true);
          setInitializing(false);
          return;
        }
        if (!res.ok || !json.session_id) {
          throw new Error(json?.error || "세션 생성 실패");
        }
        saveSimSessionId(json.session_id);
        setSessionId(json.session_id);
        setPersona(json.persona || null);
        setMessages(json.messages || []);
        setTurnsAllowed(json.turns_allowed ?? 2);
        setTurnsUsed(json.turns_used ?? 0);
        setNeedUnlock(false);
      } catch (e: any) {
        setError(e?.message || "시뮬레이션 준비 중 오류가 났어");
      } finally {
        setInitializing(false);
      }
    })();
  }, [parentOrderId]);

  // 새 메시지 들어올 때 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, sending]);

  const handleSend = async () => {
    if (!sessionId || !draft.trim() || sending) return;
    if (draft.length > 500) {
      setError("한 번에 500자 이하로 써줘");
      return;
    }
    const toSend = draft.trim();

    // ─── 낙관적 업데이트: 내 메시지를 즉시 화면에 띄우고 입력창 비움 ───
    // turn_index는 서버 확정 전까지 임시로 -1 사용
    setMessages(prev => [...prev, { role: "user", content: toSend, turn_index: -1 }]);
    setDraft("");
    setSending(true);
    setError(null);

    // 낙관적 추가를 롤백하는 헬퍼 (실패/거부 시 사용)
    const rollbackOptimistic = () => {
      setMessages(prev =>
        prev.filter(m => !(m.role === "user" && m.turn_index === -1))
      );
      setDraft(toSend); // 입력창에 되돌려줘서 재전송 편의 제공
    };

    try {
      const res = await fetch("/api/sim/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          content: toSend,
          clientToken: getClientToken(),
        }),
      });
      const json = await res.json();

      // 턴 카운트는 need_unlock 여부와 무관하게 가장 먼저 갱신
      if (typeof json.turns_used === "number") setTurnsUsed(json.turns_used);
      if (typeof json.turns_allowed === "number") setTurnsAllowed(json.turns_allowed);

      // 서버가 "턴 초과 거부" 로 응답한 경우 — 낙관적 추가 롤백
      if (json.need_unlock && !json.partner_message) {
        rollbackOptimistic();
        setNeedUnlock(true);
        return;
      }
      if (!res.ok) {
        rollbackOptimistic();
        throw new Error(json?.error || "메시지 전송 실패");
      }

      // 서버가 저장 완료한 user turn_index 확정 + partner 메시지 append
      if (typeof json.user_turn_index === "number" && typeof json.partner_message === "string") {
        setMessages(prev => {
          // 임시 turn_index=-1인 내 메시지를 서버 확정값으로 치환
          const patched = prev.map(m =>
            m.role === "user" && m.turn_index === -1
              ? { ...m, turn_index: json.user_turn_index as number }
              : m
          );
          // 상대 메시지 추가
          patched.push({
            role: "partner",
            content: json.partner_message,
            turn_index: json.partner_turn_index,
          });
          return patched;
        });
      }

      // 턴 소진 여부는 서버의 권위 있는 need_unlock 플래그를 그대로 사용
      if (json.need_unlock) setNeedUnlock(true);
    } catch (e: any) {
      setError(e?.message || "전송 중 오류가 났어");
    } finally {
      setSending(false);
    }
  };

  const handleUnlock = async () => {
    if (!sessionId || unlockRedirecting) return;
    setUnlockRedirecting(true);
    setError(null);
    try {
      const res = await fetch("/api/sim/unlock/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          clientToken: getClientToken(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.unlock_order_id) {
        throw new Error(json?.error || "언락 주문 생성 실패");
      }
      window.location.href = `/checkout?orderId=${encodeURIComponent(
        json.unlock_order_id
      )}&type=sim-unlock`;
    } catch (e: any) {
      setError(e?.message || "결제 페이지 이동 실패");
      setUnlockRedirecting(false);
    }
  };

  const handleReset = async () => {
    if (!sessionId || resetting) return;
    if (!confirm("대화 내용을 모두 지울게. 남은 턴 수는 유지돼. 계속할까?")) return;
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/sim/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          clientToken: getClientToken(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "리셋 실패");
      }
      setMessages([]);
    } catch (e: any) {
      setError(e?.message || "리셋 중 오류가 났어");
    } finally {
      setResetting(false);
    }
  };

  const turnsRemaining = Math.max(0, turnsAllowed - turnsUsed);
  const isFreePhase = turnsAllowed <= 2;
  // 개인정보 이슈로 UI에는 상대방 실명/닉네임을 노출하지 않음. 항상 "걔"로 표시.
  // (persona.name_ref 는 Claude 컨텍스트 내부에서만 사용)

  if (initializing) {
    return (
      <div className="mt-6 mb-2 py-8 px-5 text-center animate-fadeUp rounded-[18px] bg-white border border-[var(--color-line)]">
        <div
          className="w-[32px] h-[32px] mx-auto mb-3 rounded-full animate-spin"
          style={{ border: "3px solid var(--color-line)", borderTopColor: "var(--color-primary)" }}
        />
        <div className="text-[13px] font-bold text-[var(--color-ink)] mb-1">
          걔 말투 학습 중...
        </div>
        <div className="text-[11px] text-[var(--color-sub)]">
          캡처한 대화 기반으로 진짜처럼 대답하게 만들고 있어
        </div>
      </div>
    );
  }

  // 캡처 없이 분석한 경우 — 시뮬 불가 안내 (editorial)
  if (needImages) {
    return (
      <div className="animate-fadeUp mt-6">
        <div className="mb-4 border-t border-line pt-5">
          <div className="mb-2 font-mono text-[9px] font-bold tracking-[2.5px] text-sub">
            LIVE SIMULATION · LOCKED
          </div>
          <div className="flex items-center gap-3">
            <NyangHead size={34} />
            <div className="flex-1">
              <div
                className="text-[22px] font-medium leading-tight tracking-[-0.5px] text-ink"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                대화 연습은 캡처가 있어야 열린다냥
              </div>
              <div className="mt-0.5 text-[11px] leading-[1.4] text-sub">
                Realtime chat · needs KakaoTalk / DM screenshot
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#FAF6EC",
            border: "1px solid #E5DCC9",
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#8A7F75",
              marginBottom: 10,
            }}
          >
            WHY IT MATTERS
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: "#2B2420",
              margin: "0 0 8px",
            }}
          >
            걔 말투 그대로 답장을 만들려면 실제 대화 캡처가 필요하다냥.
          </p>
          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.7,
              color: "#8A7F75",
              margin: 0,
            }}
          >
            카톡·DM 캡처를 올리고 다시 분석하면 대화 시뮬도 바로 열려.
          </p>
        </div>

        <button
          onClick={() => {
            clearSimAndOrder();
            clearPaidResult();
            try {
              localStorage.removeItem(PAID_KEY);
            } catch {}
            if (typeof window !== "undefined") window.scrollTo({ top: 0 });
            window.location.href = "/analyze";
          }}
          type="button"
          style={{
            marginTop: 12,
            width: "100%",
            padding: "16px",
            background: "#2B2420",
            color: "#F4EFE6",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F4EFE6"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 12.5 12.5 21a5.5 5.5 0 0 1-7.8-7.8L13 5a3.5 3.5 0 0 1 5 5L9.5 18.5a1.5 1.5 0 0 1-2.1-2.1L15 8.9" />
          </svg>
          <span>캡처 올려서 다시 분석</span>
        </button>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: "#8A7F75",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          · 새 분석도 무료 ·
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-2 animate-fadeUp">
      {/* 섹션 헤더 — editorial */}
      <div className="mb-4 border-t border-line pt-5">
        <div className="mb-2 font-mono text-[9px] font-bold tracking-[2.5px] text-sub">
          LIVE SIMULATION · NEW
        </div>
        <div className="flex items-center gap-3">
          <NyangHead size={34} />
          <div className="flex-1">
            <div className="font-serif text-[22px] font-medium leading-tight tracking-[-0.5px] text-ink">
              걔랑 대화 연습
            </div>
            <div className="mt-0.5 text-[11px] leading-[1.4] text-sub">
              걔 말투 그대로 답장이 와 · 냥이가 옆에서 코칭한다냥
            </div>
          </div>
        </div>
      </div>

      {/* 턴 상태 바 */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[11px] font-bold" style={{ color: "var(--color-primary-deep)" }}>
          🎫 남은 턴:{" "}
          <span style={{ color: "var(--color-primary-deep)" }}>{turnsRemaining}</span> / {turnsAllowed}
          <span className="ml-1 text-[10px] text-[var(--color-sub)] font-semibold">
            {isFreePhase ? "(무료)" : "(결제됨)"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-line)",
              color: "var(--color-primary)",
              cursor: resetting ? "wait" : "pointer",
            }}>
            🔄 대화 리셋
          </button>
        )}
      </div>

      {/* 채팅창 */}
      <div
        ref={scrollRef}
        className="rounded-[18px] bg-white p-3.5 mb-2.5"
        style={{
          border: "1px solid var(--color-line)",
          boxShadow: "0 2px 14px rgba(26,23,20,0.08)",
          minHeight: 260,
          maxHeight: 420,
          overflowY: "auto",
        }}>
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-[28px] mb-2">💭</div>
            <div className="text-[12px] text-[var(--color-sub)] leading-[1.6]">
              아래에 먼저 보낼 말 써봐.
              <br />
              걔 말투 그대로 답장이 올 거야.
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} content={m.content} />
          ))
        )}
        {sending && (
          <div className="flex justify-start mb-2">
            <div
              className="px-3.5 py-2.5 rounded-[18px] rounded-bl-[6px] text-[13px]"
              style={{ background: "var(--color-bg-alt)", border: "1px solid var(--color-line)", color: "var(--color-sub)" }}>
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--color-primary)" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--color-primary)", animationDelay: "0.15s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--color-primary)", animationDelay: "0.3s" }}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-white rounded-[14px] p-3 mb-2.5 border border-[var(--color-primary)] text-[12px] text-[#D14343]">
          {error}
        </div>
      )}

      {/* 입력창 or 언락 CTA */}
      {needUnlock ? (
        <div
          className="rounded-[18px] p-4 border"
          style={{
            background: "linear-gradient(135deg, var(--color-bg-alt), var(--color-bg-alt))",
            borderColor: "var(--color-primary)",
          }}>
          <div className="text-[14px] font-extrabold text-[var(--color-ink)] mb-1">
            🎫 턴 {turnsAllowed}개 전부 썼어
          </div>
          <div className="text-[11.5px] text-[var(--color-sub)] mb-3 leading-[1.5]">
            +15턴 추가하면 같은 맥락 그대로 더 돌려볼 수 있어.
          </div>
          <button
            onClick={handleUnlock}
            disabled={unlockRedirecting}
            className="w-full py-3.5 rounded-[14px] text-white text-[14px] font-bold"
            style={{
              background: unlockRedirecting
                ? "#D0CDE0"
                : "linear-gradient(135deg, var(--color-primary), var(--color-primary-deep))",
              boxShadow: unlockRedirecting
                ? "none"
                : "0 4px 18px rgba(217,117,87,0.25)",
              border: "none",
              cursor: unlockRedirecting ? "not-allowed" : "pointer",
            }}>
            {unlockRedirecting
              ? "결제창으로 이동 중..."
              : `🔓 +15턴 추가 · ₩${UNLOCK_PRICE.toLocaleString()}`}
          </button>
          <p className="text-center text-[10.5px] text-[var(--color-sub)] mt-2 leading-[1.5]">
            같은 맥락 유지 · 리셋해도 남은 턴 수는 그대로
          </p>
        </div>
      ) : (
        <div
          className="rounded-[18px] p-2.5 bg-white flex gap-2 items-end"
          style={{
            border: "1px solid var(--color-line)",
            boxShadow: "0 2px 14px rgba(26,23,20,0.08)",
          }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            maxLength={500}
            placeholder={`걔한테 보낼 말 써봐...`}
            rows={2}
            className="flex-1 resize-none text-[13.5px] leading-[1.55] text-[var(--color-ink)] outline-none rounded-[12px] p-2.5"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-bg-alt)",
              fontFamily: "inherit",
              minHeight: 46,
              maxHeight: 120,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="shrink-0 px-4 rounded-[12px] text-white text-[13px] font-bold"
            style={{
              background:
                draft.trim() && !sending
                  ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-deep))"
                  : "#D0CDE0",
              border: "none",
              cursor: draft.trim() && !sending ? "pointer" : "not-allowed",
              height: 46,
            }}>
            전송
          </button>
        </div>
      )}

      <p className="text-center mt-2 text-[10.5px] text-[var(--color-sub)] leading-[1.5]">
        실제 답장 예측 · 무료 2턴 이후 +15턴 ₩{UNLOCK_PRICE.toLocaleString()}
      </p>
    </div>
  );
}

// ─── Sample Preview (결과 예시) ───
// 실제 ResultCard 구조 그대로 축소 재현 (샘플 데이터)
const SAMPLE_RESULT = {
  score: 58,
  temperature: "미지근",
  stage: "호감",
  summary: "걔 발만 살짝 걸쳐놨어",
  attachment: { type: "불안형", anxiety: 72, avoidance: 25 },
  axes: {
    관심도: 68,
    적극성: 42,
    반응성: 72,
    친밀감: 48,
    일관성: 55,
    미래지향: 35,
  } as Record<string, number>,
  diagnosis:
    "이 사람, 아예 마음이 없는 건 아니야. 답장은 꾸준하고 너 얘기에 반응도 해주거든. 근데 자기 얘길 먼저 꺼내거나 다음 약속을 짚는 건 피해 — 관계를 책임지고 진전시킬 준비는 덜 된 상태야.",
  reasons: [
    "답장은 꾸준한데 관계 진전 얘기는 피하고 있어",
    "호감 표현보다 상황 설명이 더 많아",
    "네가 불안해질수록 더 애매하게 반응하는 흐름이 보여",
  ],
  advice: "지금은 답을 재촉하기보다 조금 텀을 두고 상대 반응을 보는 게 더 유리해.",
  inner_psychology: "상대방은 호감은 있지만 '확신이 없는 상태'야. 거절당할까 봐 확실한 표현을 피하고 있어.",
  caution_points: [
    "네가 먼저 감정 표현을 과하게 하면 부담 느낄 수 있어",
    "연락 텀이 불규칙해지면 불안 신호일 수 있어",
  ],
  recommended_messages: [
    "오늘 뭐 했어? 나는 — 하고 있었는데 갑자기 네 생각 남ㅋㅋ",
    "이번 주 시간 되면 — 가볼래? 거기 맛집이래",
  ],
  red_flags: { criticism: 10, defensiveness: 15, contempt: 5, stonewalling: 30 },
};

function SamplePreview() {
  const s = SAMPLE_RESULT;
  return (
    <div className="mb-1">
      <p className="text-[14px] text-[var(--color-ink)] font-bold mb-0.5">
        👀 결과가 어떻게 나오냐면
      </p>
      <p className="text-[11px] text-[var(--color-sub)] mb-3">그 사람 말보다 태도를 읽어줄게</p>

      {/* 실제 결과 카드와 동일한 구조로 축소 렌더링 */}
      <div
        className="rounded-[22px] p-3 relative overflow-hidden"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-line)",
          boxShadow: "0 2px 16px rgba(26,23,20,0.08)",
        }}>
        {/* SAMPLE 배지 */}
        <div className="absolute top-3 right-3 z-10 px-2 py-[3px] rounded-full text-[9px] font-extrabold tracking-[1.5px]"
          style={{ background: "var(--color-ink)", color: "#fff" }}>
          SAMPLE
        </div>

        {/* 1) Score Header 축소 버전 */}
        <div className="text-center py-4 px-3 rounded-[18px] mb-2.5"
          style={{
            background: "linear-gradient(180deg, var(--color-bg-alt) 0%, #fff 100%)",
            border: "1px solid rgba(26,23,20,0.14)",
          }}>
          <p className="mb-2 text-[9px] font-semibold tracking-[0.3px]" style={{ color: "var(--color-sub)" }}>
            가트만 관계 심리학 · 애착이론 기반 분석
          </p>
          {/* Mini score gauge */}
          <div className="flex justify-center">
            <svg width="86" height="86" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="sampleScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r="50" fill="none" stroke="var(--color-line)" strokeWidth="10" />
              <circle cx="70" cy="70" r="50" fill="none" stroke="url(#sampleScoreGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - s.score / 100)}
                transform="rotate(-90 70 70)" />
              <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fill="var(--color-ink)"
                style={{ fontSize: 36, fontWeight: 800 }}>{s.score}</text>
            </svg>
          </div>
          <p className="text-[10px] font-semibold mt-[-4px]" style={{ color: "var(--color-sub)" }}>호감도 점수</p>
          <div className="mt-2 flex justify-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-[4px] rounded-full text-[11px] font-semibold"
              style={{ background: "var(--color-bg-alt)", color: "var(--color-primary)" }}>✨ {s.stage}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-[4px] rounded-full text-[11px] font-semibold"
              style={{ background: "var(--color-bg-alt)", color: "var(--color-ink)" }}>🌤 {s.temperature}</span>
          </div>
          {/* 촌철살인 한마디 */}
          <div className="mt-3 px-2">
            <div className="text-[9px] font-bold mb-1" style={{ color: "var(--color-primary-deep)", letterSpacing: 1 }}>
              💬 AI 냥이 한마디
            </div>
            <div className="text-[14px] font-extrabold leading-[1.35] text-[var(--color-ink)]">
              &ldquo;{s.summary}&rdquo;
            </div>
          </div>
        </div>

        {/* 2) 애착 유형 4분면 (축소 버전) */}
        <div className="bg-white rounded-[16px] p-3 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
          <div className="text-[12px] font-bold mb-1 text-[var(--color-ink)]">💜 상대방 애착 유형</div>
          <div className="text-center">
            <div style={{ transform: "scale(0.75)", transformOrigin: "top center", height: 203 }}>
              <AttachmentChart
                avoidance={s.attachment.avoidance}
                anxiety={s.attachment.anxiety}
                type={s.attachment.type}
              />
            </div>
          </div>
          <div className="text-center mt-[-4px]">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: "var(--color-bg-alt)", color: "#A83557" }}>
              {s.attachment.type}
            </span>
          </div>
        </div>

        {/* 3) 위험 신호 진단 */}
        <div className="bg-white rounded-[16px] p-3 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
          <div className="text-[12px] font-bold mb-1 text-[var(--color-ink)]">🚨 관계 위험 신호</div>
          <div className="text-[9px] text-[var(--color-sub)] mb-2">가트만 Four Horsemen 기반</div>
          <div style={{ transform: "scale(0.9)", transformOrigin: "top left" }}>
            <RedFlagsChart flags={s.red_flags} />
          </div>
        </div>

        {/* 4) AI 냥이 총평 */}
        <div className="bg-white rounded-[16px] p-3 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
          <div className="text-[12px] font-bold mb-1.5 text-[var(--color-ink)]">🔍 AI 냥이 총평</div>
          <p className="text-[11.5px] text-[var(--color-ink)] leading-[1.7]">{s.diagnosis}</p>
        </div>

        {/* 5) 유료 결과 미리보기 */}
        <div className="rounded-[16px] p-3 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-bg-alt) 100%)",
            border: "1px dashed var(--color-primary)",
          }}>
          <div className="text-[12px] font-bold mb-2.5" style={{ color: "var(--color-primary-deep)" }}>🔒 프리미엄에선 여기까지 나와</div>

          {/* 호감도 레이더 */}
          <div className="bg-white rounded-[12px] p-2.5 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
            <div className="text-[10px] font-bold mb-1 text-[var(--color-primary)]">📊 호감도 레이더</div>
            <div className="flex gap-2 items-center">
              <div className="shrink-0" style={{ width: 120 }}>
                <div style={{ transform: "scale(0.43)", transformOrigin: "top left", width: 280, height: 151 }}>
                  <RadarChart axes={s.axes} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {Object.entries(s.axes).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1 mb-[3px] last:mb-0">
                    <span className="text-[9px] font-semibold text-[var(--color-ink)] shrink-0" style={{ width: 40 }}>{k}</span>
                    <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-deep))" }} />
                    </div>
                    <span className="text-[8px] font-bold tabular-nums shrink-0" style={{ color: "var(--color-primary)", width: 16 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 이 점수가 나온 이유 */}
          <div className="bg-white rounded-[12px] p-2.5 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
            <div className="text-[10px] font-bold mb-1 text-[var(--color-primary)]">💡 이 점수가 나온 이유</div>
            <ul className="space-y-1">
              {s.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-[var(--color-ink)] leading-[1.5]">
                  <span className="w-1 h-1 rounded-full mt-[6px] shrink-0" style={{ background: "var(--color-primary)" }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 걔 속마음 */}
          <div className="bg-white rounded-[12px] p-2.5 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: "var(--color-primary-deep)" }}>🧠 걔 속마음</div>
            <p className="text-[10.5px] text-[var(--color-ink)] leading-[1.55]">{s.inner_psychology}</p>
          </div>

          {/* 걸리는 부분 */}
          <div className="bg-white rounded-[12px] p-2.5 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: "var(--color-primary)" }}>⚠️ 걸리는 부분</div>
            <ul className="space-y-1">
              {s.caution_points.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-[var(--color-ink)] leading-[1.5]">
                  <span className="w-1 h-1 rounded-full mt-[6px] shrink-0" style={{ background: "var(--color-primary)" }} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 이렇게 해봐 + 멘트 예시 */}
          <div className="bg-white rounded-[12px] p-2.5 mb-2" style={{ border: "1px solid rgba(26,23,20,0.14)" }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: "#3E8C66" }}>🎯 이렇게 해봐</div>
            <p className="text-[10.5px] text-[var(--color-ink)] leading-[1.55] mb-2">{s.advice}</p>
            <div className="text-[10px] font-bold mb-1" style={{ color: "var(--color-primary)" }}>💬 이런 멘트 보내봐</div>
            {s.recommended_messages.map((m, i) => (
              <div key={i} className="text-[10.5px] text-[var(--color-ink)] leading-[1.5] p-1.5 rounded-[8px] mb-1 last:mb-0"
                style={{ background: "rgba(26,23,20,0.05)" }}>
                &ldquo;{m}&rdquo;
              </div>
            ))}
          </div>

          {/* 채팅 시뮬 NEW */}
          <div
            className="px-2.5 py-[6px] rounded-[10px] text-center"
            style={{ background: "rgba(45,43,61,0.85)" }}>
            <span
              className="text-[9px] font-extrabold tracking-[1.5px] mr-1 px-1.5 py-[1px] rounded-full"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              NEW
            </span>
            <span className="text-[10.5px] font-bold text-white">
              💬 분석 후 걔랑 실시간 대화 시뮬레이션까지
            </span>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-[var(--color-sub)] text-center mt-1.5">
        실제 결과는 네 상황에 맞게 달라져
      </p>
    </div>
  );
}

// ─── Upload Zone ───
const MAX_IMAGES = 3;

function UploadZone({ images, onAdd, onRemove }: any) {
  const ref = useRef<HTMLInputElement>(null);
  const atLimit = images.length >= MAX_IMAGES;
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const slots = MAX_IMAGES - images.length;
          onAdd(files.slice(0, Math.max(0, slots)));
          e.target.value = "";
        }}
      />
      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full items-center gap-[14px] border border-dashed border-ink bg-transparent p-[18px_20px] text-left transition-colors hover:bg-ink/5 active:scale-[0.99]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line"
            style={{ background: "#EDE6D8" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink"
              aria-hidden
            >
              <path d="M21 12.5 12.5 21a5.5 5.5 0 0 1-7.8-7.8L13 5a3.5 3.5 0 0 1 5 5L9.5 18.5a1.5 1.5 0 0 1-2.1-2.1L15 8.9" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
              여기 눌러서 캡처 추가
            </div>
            <div className="mt-0.5 text-[11px] leading-[1.4] text-sub">
              선택 · 최대 3장 · 많을수록 정확하다냥
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      ) : (
        <div>
          <div
            className="mb-2 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)`,
            }}
          >
            {images.map((img: any, i: number) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-[8px] border border-line"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="block h-[110px] w-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  type="button"
                  className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-none bg-ink/70 text-xs text-bg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => !atLimit && ref.current?.click()}
            disabled={atLimit}
            className={
              atLimit
                ? "w-full rounded-[6px] border border-dashed border-line bg-transparent px-4 py-3 text-[12px] text-sub"
                : "w-full rounded-[6px] border border-dashed border-ink bg-transparent px-4 py-3 text-[12px] font-semibold text-ink transition-colors hover:bg-ink/5"
            }
          >
            {atLimit
              ? `최대 ${MAX_IMAGES}장까지 (${images.length}/${MAX_IMAGES})`
              : `+ 더 추가하기 (${images.length}/${MAX_IMAGES})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Text Input ───
function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleChip = (prompt: string) => {
    if (value.includes(prompt)) return;
    let next = value;
    for (const c of CHIPS) {
      if (c.prompt !== prompt && next.includes(c.prompt)) {
        next = next.replace(c.prompt, "");
      }
    }
    onChange(prompt + next);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-[7px]">
        {CHIPS.map((chip, i) => {
          const isActive = value.includes(chip.prompt);
          return (
            <button
              key={i}
              onClick={() => {
                if (isActive) return;
                handleChip(chip.prompt);
              }}
              disabled={isActive}
              aria-pressed={isActive}
              type="button"
              className={
                isActive
                  ? "inline-flex cursor-default items-center gap-1.5 rounded-full border border-ink bg-ink px-3.5 py-2 text-[12.5px] font-medium text-bg"
                  : "inline-flex items-center gap-1.5 rounded-full border border-line bg-transparent px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bg active:scale-[0.97]"
              }
            >
              {isActive && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m5 12 4 4 10-10" />
                </svg>
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="또는 직접 풀어쓰기…"
        className="w-full min-h-[110px] resize-y border border-line px-4 py-3.5 text-[13.5px] leading-[1.5] text-ink outline-none transition-colors placeholder:text-sub/70 focus:border-ink"
        style={{ background: "#FAF6EC", borderRadius: 0 }}
      />
    </div>
  );
}

// ─── Loading (editorial 5-stage pipeline with live evidence) ───
function LoadingState() {
  const stages = [
    {
      label: "캡처 읽는 중",
      sub: "OCR · 메시지 추출",
      stats: [
        { k: "메시지", v: "142", u: "건" },
        { k: "기간", v: "17", u: "일" },
        { k: "발신 비율", v: "54 : 46", u: "" },
      ],
      chips: ["한국어 정상 인식", "이모지 24종", "URL 3건 스킵"],
    },
    {
      label: "말투 뜯어보는 중",
      sub: "언어학적 패턴 분석",
      stats: [
        { k: "평균 답장 텀", v: "1h 42m", u: "" },
        { k: "단답률", v: "38", u: "%" },
        { k: "질문 비율", v: "12 : 3", u: "" },
      ],
      chips: ["회피 표현 6회", "친밀 지표 11회", "미래 언급 2회"],
    },
    {
      label: "애착 유형 매칭 중",
      sub: "Bartholomew 4유형 모델",
      stats: [
        { k: "불안형", v: "62", u: "%" },
        { k: "회피형", v: "24", u: "%" },
        { k: "안정형", v: "14", u: "%" },
      ],
      chips: ["근접 회피 ↑", "자아 불안 ↑", "승인 추구 ↑"],
    },
    {
      label: "Gottman 4요소 스캔",
      sub: "Four Horsemen 분석",
      stats: [
        { k: "비난", v: "10", u: "/100" },
        { k: "방어", v: "15", u: "/100" },
        { k: "담쌓기", v: "30", u: "/100" },
      ],
      chips: ["경멸 신호 없음", "대화 철회 관찰", "안전 수준"],
    },
    {
      label: "냥이 소견 정리 중",
      sub: "리포트 합성",
      stats: [
        { k: "호감도", v: "58", u: "/100" },
        { k: "확신도", v: "91", u: "%" },
        { k: "분석 근거", v: "14", u: "개" },
      ],
      chips: ["멘트 추천 3종", "시뮬 시나리오 준비", "리스크 1건"],
    },
  ];
  const methodology = [
    { tag: "Gottman", t: "Four Horsemen", d: "이혼 예측 정확도 93.6% · 40년 종단연구" },
    { tag: "Bowlby", t: "애착 이론", d: "성인 관계 패턴 · 4유형 분류" },
    { tag: "Clark", t: "관계 만족도 지표", d: "상호성·공감·갈등 회복 기반" },
  ];

  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      350
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, stages.length - 1)),
      1800
    );
    return () => clearInterval(id);
  }, []);

  const cur = stages[step];
  const pct = Math.round(((step + 1) / stages.length) * 100);

  return (
    <div className="animate-fadeUp relative px-[22px] pb-6 pt-2">
      {/* Top row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="mb-1 font-mono text-[10px] font-bold tracking-[3px] text-primary-deep">
            — 분석 중 · {pct}%
          </div>
          <div className="font-mono text-[11px] tracking-[1.5px] text-sub">
            STAGE {String(step + 1).padStart(2, "0")} / 0{stages.length}
          </div>
        </div>
        <div className="animate-[nyangBounce_1.4s_ease-in-out_infinite]">
          <NyangHead size={56} />
        </div>
      </div>

      {/* Headline */}
      <div className="mb-1 font-serif text-[30px] font-normal leading-[1.15] tracking-[-0.8px] text-ink">
        {cur.label}
        <span className="inline-block w-[18px] text-left text-sub">{dots}</span>
      </div>
      <div className="mb-3.5 font-mono text-[12px] tracking-[1.2px] text-sub">
        {cur.sub}
      </div>

      {/* Progress bar */}
      <div className="mb-[18px] h-[3px] overflow-hidden rounded-sm bg-line">
        <div
          className="h-full bg-ink transition-[width] duration-[550ms] ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Live evidence */}
      <div className="relative mb-3 rounded-md border border-line bg-bg-alt p-4">
        <div className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] tracking-[2px] text-sub">
          <span className="inline-block h-1.5 w-1.5 animate-[nyangPulse_1.2s_ease-in-out_infinite] rounded-full bg-[#2BB673]" />
          LIVE · DETECTED SIGNALS
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {cur.stats.map((s, i) => (
            <div
              key={i}
              className={i > 0 ? "border-l border-line pl-2.5" : ""}
            >
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[1px] text-sub">
                {s.k}
              </div>
              <div className="flex items-baseline gap-0.5">
                <div className="font-serif text-[24px] font-medium leading-none tracking-[-0.8px] text-ink">
                  {s.v}
                </div>
                {s.u && <div className="font-mono text-[10px] text-sub">{s.u}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {cur.chips.map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-line bg-bg px-2.5 py-1 text-[10px] font-semibold text-ink"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="px-0.5 pb-3.5 pt-1">
        <div className="mb-2.5 font-mono text-[9px] tracking-[2px] text-sub">
          — METHODOLOGY
        </div>
        {methodology.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 py-2.5 ${i < 2 ? "border-b border-line" : ""}`}
          >
            <div className="h-fit whitespace-nowrap rounded-sm border border-primary-deep px-1.5 py-[3px] font-mono text-[9px] font-bold tracking-[1px] text-primary-deep">
              {m.tag}
            </div>
            <div className="flex-1">
              <div className="mb-0.5 text-[13px] font-semibold tracking-[-0.3px] text-ink">
                {m.t}
              </div>
              <div className="text-[11px] leading-[1.4] text-sub">{m.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="pb-1 pt-2">
        <div className="mb-2.5 font-mono text-[9px] tracking-[2px] text-sub">
          — PIPELINE
        </div>
        {stages.map((s, i) => {
          const done = i < step;
          const run = i === step;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 py-1.5 text-[12px] ${
                i <= step ? "text-ink" : "text-sub"
              } ${run ? "font-bold" : ""}`}
              style={{ opacity: i <= step ? 1 : 0.4 }}
            >
              <span
                className={`inline-block w-5 font-mono text-[9px] tracking-[1px] ${
                  done ? "text-[#2BB673]" : run ? "text-primary-deep" : "text-sub"
                }`}
              >
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">{s.label}</span>
              <span className="font-mono text-[10px] text-sub">
                {done ? "DONE" : run ? "RUN" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reassurance */}
      <div className="mt-[18px] flex items-start gap-2.5 rounded-sm bg-bg-alt p-3.5">
        <div className="mt-0.5 shrink-0">
          <NyangEyes size={22} color="var(--color-primary)" />
        </div>
        <div className="text-[11px] leading-[1.55] text-sub">
          업로드한 캡처는{" "}
          <b className="text-ink">30일 후 자동 파기</b>된다냥. 무료 분석은 DB에
          저장도 안 해.
        </div>
      </div>

      {/* Scattered sticker */}
      <div className="pointer-events-none absolute right-4 top-4 rotate-[-18deg] opacity-40">
        <NyangPaw size={22} color="var(--color-ink)" pad="var(--color-primary)" />
      </div>

      <style jsx>{`
        @keyframes nyangBounce {
          0%,
          100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-8px) rotate(3deg);
          }
        }
        @keyframes nyangPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Small inline icon helper ───
function ArrowRightIcon({ color = "currentColor", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ─── Main Page ───
export default function Home() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // 결제창으로 이동 중
  const [freeResult, setFreeResult] = useState<any>(null);
  const [paidResult, setPaidResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const [forcePaid, setForcePaid] = useState(false); // "새로 분석하기(유료)" 눌렀을 때 유료 모드 강제
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);   // 채팅 시뮬 부모 주문 ID
  const [simSessionId, setSimSessionId] = useState<string | null>(null);  // 채팅 시뮬 세션 ID (holder)
  const [imageConsent, setImageConsent] = useState(false);                // 캡처 업로드 시 개인정보 동의
  const [situation, setSituation] = useState<string | null>(null);        // 랜딩 01에서 고른 상황
  const [revealDone, setRevealDone] = useState(false);                    // reveal hero 해제 여부
  const inputRef = useRef({ text: "", imageData: [] as any[] });

  // Check free usage + restore paid result on mount
  // ?reset=1 붙이면 전체 초기화 (테스트용)
  useEffect(() => {
    // 페이지 진입 시 항상 스크롤 최상단 (결제 후 돌아왔을 때 등)
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    if (window.location.search.includes("reset=1")) {
      localStorage.removeItem(FREE_LIMIT_KEY);
      localStorage.removeItem(PAID_KEY);
      localStorage.removeItem(PAID_RESULT_KEY);
      clearSimAndOrder();
      window.location.href = window.location.pathname;
      return;
    }
    setFreeUsed(hasFreeUsedToday());
    const saved = loadPaidResult();
    if (saved && isPaidUser()) {
      setPaidResult(saved);
      setPaidOrderId(loadPaidOrderId());
      setSimSessionId(loadSimSessionId());
      // 이미 본 결과 복원 시엔 reveal 바로 스킵
      setRevealDone(true);
    }
  }, []);

  const hasInput = text.trim().length > 0 || images.length > 0;
  // 캡처 업로드 시에만 동의 필수. 텍스트만 입력했을 땐 불필요.
  const needsConsent = images.length > 0;
  const consentOk = !needsConsent || imageConsent;
  const canAnalyze = hasInput && consentOk;
  const result = paidResult || freeResult;
  const isPaid = !!paidResult;

  const addImages = useCallback((files: File[]) => {
    setImages(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }, []);

  const removeImage = useCallback((idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const analyze = async () => {
    if (!hasInput) return;
    if (freeUsed) return;
    setLoading(true);
    setError(null);

    try {
      // Convert images to base64 (최대 3장)
      const imageData = await Promise.all(
        images.slice(0, MAX_IMAGES).map(img => fileToBase64(img.file))
      );
      inputRef.current = { text, imageData };

      const result = await analyzeAPI(text, imageData, "free");
      setRevealDone(false); // 새 결과 들어오면 reveal 재생
      setFreeResult(result);
      markFreeUsed();
      setFreeUsed(true);
      // 결과 나오면 최상단으로
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } catch (err: any) {
      setError("앗, 오류가 났어! 다시 한번 해볼래? 🥲");
    } finally {
      setLoading(false);
    }
  };

  // 브라우저 고유 토큰 (결제 주문 조회용)
  const getClientToken = () => {
    try {
      const KEY = "ai-unni-client-token";
      let t = localStorage.getItem(KEY);
      if (!t) {
        t = crypto.randomUUID();
        localStorage.setItem(KEY, t);
      }
      return t;
    } catch {
      return "anon-" + Date.now();
    }
  };

  // 결제 페이지로 이동 (입력값을 서버에 저장 후 /checkout 으로 리디렉션)
  const goToCheckout = async (payload: { text: string; imageData: any[] }) => {
    setRedirecting(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload.text,
          images: payload.imageData,
          clientToken: getClientToken(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.orderId) {
        throw new Error(json?.error || "주문 생성 실패");
      }
      window.location.href = `/checkout?orderId=${encodeURIComponent(json.orderId)}`;
    } catch (err: any) {
      setError("결제 페이지로 이동하지 못했어. 다시 시도해줘 🥲");
      setRedirecting(false);
    }
  };

  // 무료 다 썼을 때 홈에서 바로 유료(결제) 진행
  const analyzePaidDirect = async () => {
    if (!hasInput) return;
    const allImageData = await Promise.all(images.map(img => fileToBase64(img.file)));
    inputRef.current = { text, imageData: allImageData };
    // 무료 결과 없음 → merge 대상 없으므로 pending 삭제
    try { localStorage.removeItem(FREE_RESULT_KEY); } catch {}
    await goToCheckout({ text, imageData: allImageData });
  };

  // 무료 결과 화면에서 "프리미엄 분석 보기" 클릭 시 결제 진행
  const handleUnlock = async () => {
    // 무료 결과를 localStorage에 저장 → 결제 후 merge 용
    if (freeResult) saveFreeResultPending(freeResult);
    const allImageData = await Promise.all(images.map(img => fileToBase64(img.file)));
    await goToCheckout({ text: inputRef.current.text, imageData: allImageData });
  };

  const reset = (opts?: { forcePaidMode?: boolean }) => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setText("");
    setFreeResult(null);
    setPaidResult(null);
    setError(null);
    clearPaidResult();
    clearSimAndOrder();
    setPaidOrderId(null);
    setSimSessionId(null);
    setFreeUsed(hasFreeUsedToday());
    setForcePaid(!!opts?.forcePaidMode);
    // 첫 화면으로 돌아갈 때 스크롤 최상단으로
    // ※ setTimeout 으로 React 리렌더 완료 후 즉시(instant) 이동
    if (typeof window !== "undefined") {
      setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), 50);
    }
  };

  // 분석 중에는 전체 viewport 로딩 화면으로 교체
  if (loading) {
    return forcePaid ? <LoadingFinal /> : <LoadingFree />;
  }

  // 결과 도착 직후 reveal 전용 화면 — 버튼 클릭 시 상세로 전환
  if (result && !revealDone) {
    return (
      <ResultReveal
        score={result.score || 0}
        tags={[result.stage, result.temperature].filter(
          (t): t is string => Boolean(t)
        )}
        quote={result.summary || ""}
        onDone={() => setRevealDone(true)}
      />
    );
  }

  return (
    <>
      <Masthead />
      <main className="min-h-screen bg-bg text-ink">
        <div className="mx-auto max-w-[420px]">
          {!result && !loading && (
            <>
              <section className="px-[22px] pt-[22px] pb-5">
                <SectionHeader
                  num="01"
                  label="지금 네 고민"
                  title="어디에 제일 가깝다냥?"
                />
                <p className="mb-4 mt-2 text-[13px] leading-[1.5] text-sub">
                  상황 골라두거나 직접 풀어써줘. 길게 안 써도 돼.
                </p>
                <TextInput value={text} onChange={setText} />
              </section>
              <DashedDivider />
            </>
          )}
          <div id="analyze" className="px-[22px] pt-6 pb-10 scroll-mt-16">
            {!result && !loading && (
              <div className="mb-4">
                <SectionHeader
                  num="02"
                  label="대화 업로드"
                  title="카톡 · DM 캡처 최대 3장"
                />
                <p className="mt-2 text-[13px] leading-[1.5] text-sub">
                  많을수록 말투 분석이 정확해져. 대화 시뮬하려면 꼭 필요해.
                </p>
              </div>
            )}


        {result ? (
          <>
            <ResultCard result={result} isPaid={isPaid} onReset={reset} onResetPaid={() => reset({ forcePaidMode: true })} onUnlock={handleUnlock} unlocking={unlocking} redirecting={redirecting} freeUsed={freeUsed} />
            {isPaid && paidOrderId && (
              <ChatSimulator
                key={simSessionId ?? paidOrderId}
                parentOrderId={paidOrderId}
              />
            )}
          </>
        ) : (
          <div className="animate-fadeUp flex flex-col gap-4">
            <UploadZone images={images} onAdd={addImages} onRemove={removeImage} />

            {/* 캡처 업로드 시 개인정보 동의 */}
            {images.length > 0 && (
              <label
                className="flex cursor-pointer select-none items-start gap-2.5 p-3.5 transition-colors"
                style={{
                  background: imageConsent ? "#FAF6EC" : "transparent",
                  border: `1px solid ${imageConsent ? "var(--color-ink)" : "var(--color-line)"}`,
                  borderRadius: 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={imageConsent}
                  onChange={(e) => setImageConsent(e.target.checked)}
                  className="mt-[3px] shrink-0 cursor-pointer"
                  style={{ accentColor: "var(--color-ink)", width: 16, height: 16 }}
                />
                <div className="flex-1 text-[12.5px] leading-[1.55] text-ink">
                  <span className="font-semibold text-primary-deep">[필수]</span>{" "}
                  대화 내용 분석 동의 ·{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    자세히
                  </a>
                </div>
              </label>
            )}

            {error && (
              <div
                className="px-4 py-3 text-[13px]"
                style={{
                  background: "#FAF6EC",
                  borderLeft: "2px solid var(--color-primary-deep)",
                  color: "var(--color-ink)",
                }}
              >
                {error}
              </div>
            )}

            {(freeUsed || forcePaid) && (
              <div
                className="p-4"
                style={{
                  background: "#FAF6EC",
                  border: "1px solid var(--color-line)",
                  borderRadius: 0,
                }}
              >
                <div
                  className="mb-1 font-mono text-[10px] font-bold tracking-[0.3em] text-sub"
                >
                  {freeUsed ? "— FREE USED —" : "— PREMIUM MODE —"}
                </div>
                <div
                  className="mb-2 text-[14px] text-ink"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  {freeUsed
                    ? "오늘 무료 분석 완료 · 내일 다시 와줘"
                    : "심층 유료 분석 모드"}
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className="px-1.5 py-[2px] font-mono text-[9px] font-bold tracking-[0.15em] text-ink"
                    style={{ background: "#C9A961" }}
                  >
                    BONUS
                  </span>
                  <span className="text-[11px] text-sub">
                    결제하면 걔랑 대화 시뮬 2턴 무료
                  </span>
                </div>
              </div>
            )}

            {(freeUsed || forcePaid) ? (
              <button
                onClick={analyzePaidDirect}
                disabled={!canAnalyze || redirecting || unlocking}
                type="button"
                style={{
                  width: "100%",
                  padding: "18px",
                  border: "none",
                  background: canAnalyze ? "var(--color-ink)" : "#EDE6D8",
                  color: canAnalyze ? "var(--color-bg)" : "var(--color-sub)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: canAnalyze ? "pointer" : "default",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: redirecting || unlocking ? 0.7 : 1,
                }}
              >
                <span>
                  {redirecting
                    ? "결제창으로 이동 중..."
                    : !hasInput
                      ? "먼저 상황을 알려줘"
                      : !consentOk
                        ? "캡처 이용 동의에 체크해줘"
                        : "바로 심층 분석 · ₩2,900"}
                </span>
                {canAnalyze && !redirecting && (
                  <ArrowRightIcon color="var(--color-bg)" />
                )}
              </button>
            ) : (
              <button
                onClick={analyze}
                disabled={!canAnalyze}
                type="button"
                style={{
                  width: "100%",
                  padding: "18px",
                  border: "none",
                  background: canAnalyze ? "var(--color-ink)" : "#EDE6D8",
                  color: canAnalyze ? "var(--color-bg)" : "var(--color-sub)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: canAnalyze ? "pointer" : "default",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>
                  {!hasInput
                    ? "먼저 상황을 알려줘"
                    : !consentOk
                      ? "캡처 이용 동의에 체크해줘"
                      : "무료로 분석해보기"}
                </span>
                {canAnalyze && <ArrowRightIcon color="var(--color-bg)" />}
              </button>
            )}

            {/* NEW 대화 시뮬 배너 */}
            <div
              className="flex items-center gap-2.5 p-[12px_16px]"
              style={{
                background: "#FAF6EC",
                border: "1px solid var(--color-line)",
              }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center"
                style={{ background: "var(--color-ink)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-bg)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.8-5.2A8 8 0 1 1 21 12z" />
                </svg>
              </div>
              <span
                className="shrink-0 px-[7px] py-[3px] font-mono text-[9px] font-bold tracking-[0.2em] text-ink"
                style={{ background: "#C9A961" }}
              >
                NEW
              </span>
              <span className="flex-1 text-[12.5px] text-ink">
                분석 후, 실시간 대화 시뮬레이션 가능
              </span>
            </div>

            {/* 데이터 파기 안내 */}
            <p
              className="text-center text-[11px] text-sub"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              · 첨부한 대화는 30일 후 자동 파기 ·
            </p>
          </div>
        )}

          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

// ─── Site Footer (사업자 정보 + 법적 페이지) ───
// ※ [대괄호] 플레이스홀더는 사업자등록 완료 후 실제 값으로 교체할 것.
function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-8 text-[11px] leading-[1.7] text-sub">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
          <a href="/terms" className="font-semibold text-ink hover:underline">이용약관</a>
          <span className="text-sub/40">·</span>
          <a href="/privacy" className="font-semibold text-ink hover:underline">개인정보처리방침</a>
          <span className="text-sub/40">·</span>
          <a href="/refund" className="font-semibold text-ink hover:underline">환불정책</a>
        </div>
        <div className="text-[10.5px] leading-[1.75] text-sub/80">
          <div>상호: 주니랩스튜디오 | 대표자: 김경은</div>
          <div>사업자등록번호: 875-56-01088 | 통신판매업신고번호: 제2026-서울서초-1459호</div>
          <div>주소: 서울특별시 서초구 바우뫼로7길 29</div>
          <div>고객센터: junilabstudio@gmail.com (평일 10:00~18:00)</div>
          <div className="mt-1.5 text-sub/60">
            © {new Date().getFullYear()} AI 냥이. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Sections (PR #3 · editorial reference) ─────────────────

function DashedDivider() {
  return <div className="mx-[22px] h-px bg-ink opacity-[0.28]" />;
}

function scrollToId(id: string) {
  if (typeof document !== "undefined") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function SectionHeader({
  num,
  label,
  title,
}: {
  num: string;
  label: string;
  title: string;
}) {
  return (
    <>
      <div className="mb-2 font-mono text-[11px] font-bold tracking-[2.5px] text-sub">
        {num} · {label}
      </div>
      <div className="font-serif text-[30px] font-medium leading-[1.1] tracking-[-0.6px] text-ink">
        {title}
      </div>
    </>
  );
}

function SituationPickerSection({
  onPick,
  selected,
}: {
  onPick: (s: string) => void;
  selected: string | null;
}) {
  const situations = [
    { label: "썸 · 나만 진심", full: "썸인데 나만 진심인 것 같아" },
    { label: "연애 중 불안", full: "사귀는 중인데 자꾸 불안해" },
    { label: "이별 · 재회 가능?", full: "헤어졌는데 다시 가능성 있는지 모르겠어" },
    { label: "호감 있는지", full: "이 사람이 날 좋아하는지 모르겠어" },
    { label: "부부 거리감", full: "부부 사이가 너무 멀어진 느낌이야" },
  ];
  return (
    <section className="relative px-[22px] pt-[22px] pb-4">
      <SectionHeader num="01" label="지금 네 고민" title="어디에 제일 가깝다냥?" />
      <p className="mt-2 text-[13px] leading-[1.5] text-sub">
        하나 골라두면 냥이가 상황 맞춰 분석해줄게.
      </p>
      <div className="pointer-events-none absolute right-4 top-3 rotate-[-8deg]">
        <NyangPaw size={30} color="var(--color-ink)" pad="var(--color-primary)" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {situations.map((s) => {
          const isSelected = selected === s.full;
          return (
            <button
              key={s.full}
              onClick={() => onPick(s.full)}
              type="button"
              className={
                isSelected
                  ? "rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-bg"
                  : "rounded-full border border-ink/60 px-3.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bg"
              }
            >
              {isSelected ? `✓ ${s.label}` : s.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

