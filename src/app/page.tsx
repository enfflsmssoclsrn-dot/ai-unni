"use client";
import { useState, useRef, useCallback, useEffect } from "react";

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
            <stop offset="0%" stopColor="#FF6B8A" />
            <stop offset="100%" stopColor="#FF8FA3" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#FFD6E0" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - p}
          transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }} />
        <text x="70" y="68" textAnchor="middle" dominantBaseline="central" fill="#2D2B3D"
          style={{ fontSize: 32, fontWeight: 800 }}>{n}</text>
      </svg>
      <p className="text-[12px] font-semibold tracking-wide" style={{ color: "#8E8A9D", marginTop: -8 }}>
        호감도 점수
      </p>
    </div>
  );
}

// ─── Badges ───
function StageBadge({ stage }: { stage: string }) {
  const m: Record<string, { e: string; bg: string; c: string }> = {
    // 썸/연애/재회 모드
    "관심없음": { e: "😐", bg: "#F0F0F0", c: "#8E8A9D" },
    "예의": { e: "🙂", bg: "#EEF0FF", c: "#7B7FC4" },
    "호감": { e: "✨", bg: "#FFF4E6", c: "#E8956A" },
    "썸": { e: "💕", bg: "#FFF0F3", c: "#FF6B8A" },
    "연애직전": { e: "🔥", bg: "#FFE8EC", c: "#E8456A" },
    "안정기": { e: "🌿", bg: "#E8F5E9", c: "#5B8A72" },
    "권태 직전": { e: "🌫️", bg: "#F0F0F5", c: "#8E8A9D" },
    // 부부 모드
    "권태기": { e: "🌫️", bg: "#F0F0F5", c: "#8E8A9D" },
    "냉랭": { e: "🧊", bg: "#EEF2F7", c: "#6B7A8F" },
    "회복기": { e: "🌱", bg: "#E8F5E9", c: "#5B8A72" },
    "안정": { e: "🏡", bg: "#FFF4E6", c: "#E8956A" },
    "애정기": { e: "💞", bg: "#FFE8EC", c: "#E8456A" },
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
      style={{ background: "#FFF0F3", color: "#2D2B3D" }}>{te[temperature] || "🌡"} {temperature}</span>
  );
}

// ─── Section Cards ───
function SectionCard({ title, icon, accent, children }: { title: string; icon: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] border border-[rgba(255,143,171,0.15)] shadow-[0_2px_20px_rgba(255,143,171,0.08)] p-5 mb-3">
      <div className="text-sm font-bold mb-3" style={{ color: accent || "#2D2B3D" }}>{icon} {title}</div>
      {children}
    </div>
  );
}

function BulletItem({ text, color }: { text: string; color?: string }) {
  return (
    <div className="flex gap-2.5 mb-2.5 items-start">
      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color || "#FF6B8A" }} />
      <div className="text-sm text-[#2D2B3D] leading-[1.7]">{text}</div>
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
          <stop offset="0%" stopColor="#FF8FA3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E8456A" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 격자 (동심 6각형) */}
      {gridLevels.map((lv) => {
        const pts = AXIS_META.map((_, i) => point(lv, i)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        return (
          <polygon key={lv} points={pts}
            fill="none"
            stroke="#FFD6E0"
            strokeWidth={lv === 100 ? 1.2 : 0.8}
            strokeDasharray={lv === 100 ? "0" : "3 3"} />
        );
      })}

      {/* 축선 */}
      {AXIS_META.map((_, i) => {
        const [x, y] = point(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#FFD6E0" strokeWidth={0.8} />;
      })}

      {/* 데이터 폴리곤 */}
      <polygon points={dataPath} fill="url(#radarFill)" stroke="#E8456A" strokeWidth={1.8} strokeLinejoin="round" />

      {/* 데이터 점 */}
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#fff" stroke="#E8456A" strokeWidth={1.5} />
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
            fill="#2D2B3D">
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
              <div className="text-[13px] font-bold text-[#2D2B3D]">
                {m.label} <span className="text-[11px] font-medium text-[#8E8A9D] ml-1">{m.desc}</span>
              </div>
              <div className="text-[12px] font-bold tabular-nums" style={{ color: "#E8456A" }}>{v}</div>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "#FFE8EC" }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${v}%`,
                  background: "linear-gradient(90deg, #FF8FA3, #E8456A)",
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
    { label: "혼합형", light: "#F0E8F5", textOn: "#5D3F80", deep: "#7B55A6", pos: "tr" },
    { label: "안정형", light: "#E4F1E9", textOn: "#2D6B4D", deep: "#3E8C66", pos: "bl" },
    { label: "불안형", light: "#FDE3EA", textOn: "#A83557", deep: "#D64B74", pos: "br" },
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
          <stop offset="0%" stopColor="#FFB0C2" />
          <stop offset="60%" stopColor="#FF6B8A" />
          <stop offset="100%" stopColor="#E8456A" />
        </radialGradient>
        <radialGradient id="attachHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B8A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6B8A" stopOpacity="0" />
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
        fill="none" stroke="#EAE5F2" strokeWidth="1.2" rx="14" />
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
    { icon: "💡", title: "이 점수가 나온 구체적 이유", desc: "걔 행동 하나하나가 어떤 신호인지" },
    { icon: "⚠️", title: "솔직히 걸리는 부분", desc: "놓치면 안 되는 경고 신호" },
    { icon: "🧠", title: "걔 속마음 해석", desc: "지금 걔가 진짜로 생각하는 것" },
    { icon: "🎯", title: "언니의 맞춤 행동 전략", desc: "실제 카톡에 칠 수 있는 멘트 + 현실 진단" },
    { icon: "💬", title: "걔랑 실시간 대화 시뮬레이션 NEW", desc: "걔 말투 그대로 답장이 와 · 2턴 무료" },
  ];

  return (
    <div className="rounded-[20px] p-5 mb-3 border"
      style={{
        background: "linear-gradient(135deg, #FFF0F3 0%, #FFE8EC 100%)",
        borderColor: "#FFD6E0",
      }}>
      <div className="text-sm font-bold mb-0.5 text-[#2D2B3D]">
        🔒 상세 프리미엄 분석
      </div>
      <p className="text-[11px] text-[#8E8A9D] mb-3 leading-[1.5]">
        애매한 관계일수록 객관적인 해석이 필요해
      </p>
      <div className="mb-3.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 border-b last:border-b-0"
            style={{ borderColor: "rgba(255,214,224,0.6)" }}>
            <div className="text-[16px] leading-none mt-0.5">{it.icon}</div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#2D2B3D] leading-[1.4]">{it.title}</div>
              <div className="text-[11.5px] text-[#8E8A9D] leading-[1.45] mt-0.5">{it.desc}</div>
            </div>
            <div className="text-[11px] font-bold text-[#FF6B8A] shrink-0 mt-0.5">🔒</div>
          </div>
        ))}
      </div>

      <button onClick={onUnlock}
        disabled={redirecting || unlocking}
        className="w-full py-4 rounded-[16px] border-none text-white text-base font-bold transition-all"
        style={{
          background: (redirecting || unlocking)
            ? "#D0CDE0"
            : "linear-gradient(135deg, #FF6B8A, #E8456A)",
          boxShadow: (redirecting || unlocking) ? "none" : "0 4px 20px rgba(255,107,138,0.2)",
          cursor: (redirecting || unlocking) ? "not-allowed" : "pointer",
        }}>
        {redirecting ? "결제창으로 이동 중..." : "🔓 프리미엄 분석 보기 · ₩2,900"}
      </button>
      {!redirecting && !unlocking && (
        <p className="text-center text-[11px] text-[#C4C0D0] mt-2">⚡ 30초면 나와요</p>
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
      style={{ background: "linear-gradient(135deg, #FFF0F3, #FFF5F7)", border: "1px solid #FFD6E0" }}>
      <div className="w-[36px] h-[36px] mx-auto mb-3 rounded-full animate-spin"
        style={{ border: "3px solid #FFD6E0", borderTopColor: "#FF6B8A" }} />
      <p className="text-[14px] text-[#2D2B3D] font-semibold mb-3">{steps[i].msg}</p>
      <div className="w-full max-w-[220px] mx-auto">
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "#FFE8EC" }}>
          <div className="h-full rounded-full" style={{
            width: `${smoothPct}%`,
            background: "linear-gradient(90deg, #FF8FA3, #FF6B8A)",
            transition: "width 1.8s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold" style={{ color: "#FF6B8A" }}>
          {smoothPct}%
        </p>
      </div>
    </div>
  );
}

// ─── Result Card ───
function ResultCard({ result, isPaid, onReset, onResetPaid, onUnlock, unlocking, redirecting, freeUsed }: any) {
  return (
    <div id="result-card" className="w-full max-w-[400px] mx-auto animate-fadeUp">
      {/* Score Header */}
      <div className="text-center mb-5 py-7 px-5 rounded-[24px] border border-[rgba(255,143,171,0.15)] shadow-[0_2px_20px_rgba(255,143,171,0.08)]"
        style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #fff 100%)" }}>
        <p className="mb-3" style={{ fontSize: 11, color: "#A09CB0", letterSpacing: 0.3, fontWeight: 600 }}>
          가트만 관계 심리학 · 애착이론 기반 분석
        </p>
        <ScoreGauge score={result.score} />
        <div className="mt-2.5 flex justify-center gap-2 flex-wrap">
          {result.stage && <StageBadge stage={result.stage} />}
          <TempBadge temperature={result.temperature} />
        </div>
        {/* 촌철살인 한마디 — AI언니의 팩폭 */}
        <div className="mt-5 mb-1 px-3">
          <div className="text-[10px] font-bold mb-1.5" style={{ color: "#E8456A", letterSpacing: 1.2 }}>
            💬 AI언니 한마디
          </div>
          <div className="text-[19px] font-extrabold leading-[1.4]"
            style={{
              color: "#2D2B3D",
              textShadow: "0 1px 0 rgba(255,255,255,0.5)",
            }}>
            &ldquo;{result.summary}&rdquo;
          </div>
        </div>
      </div>

      {/* 애착 유형 4분면 — 무료/유료 둘 다 표시 (무료에선 단독, 유료에선 육각형과 함께) */}
      {result.attachment && typeof result.attachment.avoidance === "number" && typeof result.attachment.anxiety === "number" && (
        <SectionCard title="걔 애착 유형은?" icon="🧭">
          <AttachmentChart
            avoidance={result.attachment.avoidance}
            anxiety={result.attachment.anxiety}
            type={result.attachment.type || ""}
          />
          <div className="mt-3 px-3 py-2.5 rounded-[12px]"
            style={{ background: "#FFF0F3", border: "1px solid #FFD6E0" }}>
            <div className="text-[11px] font-bold mb-1" style={{ color: "#E8456A" }}>
              {result.attachment.type}
            </div>
            <div className="text-[13px] leading-[1.6] text-[#2D2B3D]">
              {result.attachment.comment}
            </div>
          </div>
          <div className="mt-2 text-[10.5px] text-[#8E8A9D] leading-[1.5] px-1">
            * Bartholomew-Horowitz 애착이론 기반. 회피(감정 거리두기) × 불안(관계 불안) 두 축으로 유형 진단.
          </div>
        </SectionCard>
      )}
      {/* 유료 추가: 6축 호감도 레이더 (육각형) */}
      {isPaid && result.axes && (
        <SectionCard title="호감도 레이더" icon="📊">
          <RadarChart axes={result.axes} />
          <AxesList axes={result.axes} />
        </SectionCard>
      )}

      {/* AI언니 총평 */}
      <SectionCard title="AI언니 총평" icon="🔍">
        <div className="text-sm text-[#2D2B3D] leading-[1.8]">{result.diagnosis}</div>
      </SectionCard>

      {isPaid ? (
        <>
          <SectionCard title="이 점수가 나온 이유" icon="💡" accent="#FF6B8A">
            {result.reasons?.map((r: string, i: number) => <BulletItem key={i} text={r} color="#FF6B8A" />)}
          </SectionCard>

          {result.warnings?.length > 0 && result.warnings[0] && (
            <SectionCard title="솔직히 좀 걸리는 부분" icon="⚠️" accent="#FFB347">
              {result.warnings.map((w: string, i: number) => <BulletItem key={i} text={w} color="#FFB347" />)}
            </SectionCard>
          )}

          <SectionCard title="걔는 지금 이런 마음이야" icon="🧠" accent="#7B7FC4">
            <div className="text-sm text-[#2D2B3D] leading-[1.8]">{result.psychology}</div>
          </SectionCard>

          <div className="p-5 rounded-[20px] mb-4 border border-[#FFD6E0]"
            style={{ background: "linear-gradient(135deg, #FFF0F3, #FFF5F7)" }}>
            <div className="text-sm font-bold mb-3 text-[#FF6B8A]">🎯 언니 말 들어, 이렇게 해봐</div>
            {result.actions?.slice(0, 3).map((a: string, i: number) => {
              const labels = ["📋 현실 진단", "💪 그래도 해보고 싶다면", "💬 이렇게 말해봐"];
              const colors = ["#8E8A9D", "#FF6B8A", "#7B7FC4"];
              return (
                <div key={i} className="mb-3">
                  <div className="text-[11px] font-bold mb-1" style={{ color: colors[i] }}>{labels[i]}</div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: colors[i] }}>
                      {i + 1}
                    </div>
                    <div className="text-sm text-[#2D2B3D] leading-[1.7]">{a}</div>
                  </div>
                </div>
              );
            })}
            {result.actions?.[3] && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px dashed #FFD6E0" }}>
                <div className="text-[11px] font-bold mb-1" style={{ color: "#E8956A" }}>🤗 언니가 해주고 싶은 말</div>
                <div className="text-sm leading-[1.8] p-3 rounded-[14px]"
                  style={{ background: "rgba(255,255,255,0.7)", color: "#2D2B3D" }}>
                  {result.actions[3]}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <PremiumPreview onUnlock={onUnlock} unlocking={unlocking} redirecting={redirecting} />
      )}

      {/* Watermark */}
      <p className="text-center text-[11px] text-[#C4C0D0] mt-2 mb-3.5 tracking-wider font-semibold">
        AI언니 · 연애 분석
      </p>

      {/* Buttons */}
      <div className="flex gap-2.5">
        {isPaid ? (
          <button onClick={onReset}
            className="flex-1 py-3.5 rounded-[16px] text-sm font-semibold cursor-pointer transition-all"
            style={{ background: "#FFF0F3", border: "1px solid #FFD6E0", color: "#FF6B8A" }}>
            다시 분석하기
          </button>
        ) : freeUsed ? (
          <button onClick={onResetPaid}
            className="flex-1 py-3.5 rounded-[16px] text-sm font-semibold cursor-pointer transition-all"
            style={{ background: "#FFF0F3", border: "1px solid #FFD6E0", color: "#FF6B8A" }}>
            🔄 새로 분석하기 (유료)
          </button>
        ) : (
          <button onClick={onReset}
            className="flex-1 py-3.5 rounded-[16px] text-sm font-semibold cursor-pointer transition-all"
            style={{ background: "#FFF0F3", border: "1px solid #FFD6E0", color: "#FF6B8A" }}>
            다시 분석하기
          </button>
        )}
      </div>

      {/* Save as Image — 유료 분석에서만 노출 (무료는 뿌옇게 흐려져서 저장 품질 낮음) */}
      {isPaid && <SaveImageButton targetId="result-card" />}
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
        backgroundColor: "#FFF5F7",
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
          const file = new File([blob], `AI언니-분석리포트.png`, { type: "image/png" });
          await navigator.share({ files: [file], title: "AI언니 분석 리포트" });
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
        link.download = `AI언니-분석리포트-${new Date().toISOString().slice(0, 10)}.png`;
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
          background: saved ? "#E8F5E9" : "#FFF0F3",
          border: saved ? "1px solid #A5D6A7" : "1px solid #FFD6E0",
          color: saved ? "#2E7D32" : "#FF6B8A",
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
    <div className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-[1.6] whitespace-pre-wrap ${
          isUser ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-bl-[6px]"
        }`}
        style={{
          background: isUser
            ? "linear-gradient(135deg, #FF8FA3, #FF6B8A)"
            : "#F4F4FA",
          color: isUser ? "#fff" : "#2D2B3D",
          border: isUser ? "none" : "1px solid #EAEAF0",
          boxShadow: isUser ? "0 2px 10px rgba(255,107,138,0.18)" : "none",
        }}>
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
      <div className="mt-6 mb-2 py-8 px-5 text-center animate-fadeUp rounded-[18px] bg-white border border-[#FFD6E0]">
        <div
          className="w-[32px] h-[32px] mx-auto mb-3 rounded-full animate-spin"
          style={{ border: "3px solid #FFD6E0", borderTopColor: "#FF6B8A" }}
        />
        <div className="text-[13px] font-bold text-[#2D2B3D] mb-1">
          걔 말투 학습 중...
        </div>
        <div className="text-[11px] text-[#8E8A9D]">
          캡처한 대화 기반으로 진짜처럼 대답하게 만들고 있어
        </div>
      </div>
    );
  }

  // 캡처 없이 분석한 경우 — 시뮬 불가 안내
  if (needImages) {
    return (
      <div className="mt-6 mb-2 animate-fadeUp">
        <div className="text-center mb-3">
          <div className="text-[18px] font-extrabold text-[#2D2B3D] mb-1">
            💬 실시간 대화 시뮬레이션
          </div>
        </div>
        <div
          className="rounded-[18px] p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #FFF0F3, #FFF5F7)",
            border: "1px dashed #FFADC4",
          }}>
          <div className="text-[32px] mb-2">📱</div>
          <div className="text-[14px] font-extrabold text-[#2D2B3D] mb-1.5">
            대화 캡처가 있어야 시뮬레이션이 가능해
          </div>
          <p className="text-[12px] text-[#6E6A80] leading-[1.6] mb-4">
            걔 말투 그대로 답장을 만들려면 실제 대화 캡처가 필요해.
            <br />
            카톡·DM 캡처를 올려서 다시 분석하면 시뮬레이션까지 바로 열려.
          </p>
          <button
            onClick={() => {
              clearSimAndOrder();
              clearPaidResult();
              try {
                localStorage.removeItem(PAID_KEY);
              } catch {}
              if (typeof window !== "undefined") window.scrollTo({ top: 0 });
              window.location.href = "/";
            }}
            className="px-5 py-3 rounded-[14px] text-white text-[13px] font-bold"
            style={{
              background: "linear-gradient(135deg, #FF6B8A, #E8456A)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,107,138,0.2)",
            }}>
            📎 캡처 올려서 다시 분석
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-2 animate-fadeUp">
      {/* 섹션 헤더 */}
      <div className="text-center mb-3">
        <div className="text-[18px] font-extrabold text-[#2D2B3D] mb-1">
          💬 걔랑 대화 한번 해봐
        </div>
        <div className="text-[12px] text-[#6E6A80] leading-[1.55] px-3">
          걔 말투 그대로 답장이 와. 보내기 전에 어떤 반응일지 미리 돌려봐.
        </div>
      </div>

      {/* 턴 상태 바 */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[11px] font-bold" style={{ color: "#7B7FC4" }}>
          🎫 남은 턴:{" "}
          <span style={{ color: "#E8456A" }}>{turnsRemaining}</span> / {turnsAllowed}
          <span className="ml-1 text-[10px] text-[#A09CB0] font-semibold">
            {isFreePhase ? "(무료)" : "(결제됨)"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "#FFF0F3",
              border: "1px solid #FFD6E0",
              color: "#FF6B8A",
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
          border: "1px solid #FFD6E0",
          boxShadow: "0 2px 14px rgba(255,107,138,0.08)",
          minHeight: 260,
          maxHeight: 420,
          overflowY: "auto",
        }}>
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-[28px] mb-2">💭</div>
            <div className="text-[12px] text-[#8E8A9D] leading-[1.6]">
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
              style={{ background: "#F4F4FA", border: "1px solid #EAEAF0", color: "#8E8A9D" }}>
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#FF6B8A" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#FF8FA3", animationDelay: "0.15s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#FFB3C1", animationDelay: "0.3s" }}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-white rounded-[14px] p-3 mb-2.5 border border-[#FFB3B3] text-[12px] text-[#D14343]">
          {error}
        </div>
      )}

      {/* 입력창 or 언락 CTA */}
      {needUnlock ? (
        <div
          className="rounded-[18px] p-4 border"
          style={{
            background: "linear-gradient(135deg, #FFF0F3, #FFE8EC)",
            borderColor: "#FFADC4",
          }}>
          <div className="text-[14px] font-extrabold text-[#2D2B3D] mb-1">
            🎫 턴 {turnsAllowed}개 전부 썼어
          </div>
          <div className="text-[11.5px] text-[#6E6A80] mb-3 leading-[1.5]">
            +15턴 추가하면 같은 맥락 그대로 더 돌려볼 수 있어.
          </div>
          <button
            onClick={handleUnlock}
            disabled={unlockRedirecting}
            className="w-full py-3.5 rounded-[14px] text-white text-[14px] font-bold"
            style={{
              background: unlockRedirecting
                ? "#D0CDE0"
                : "linear-gradient(135deg, #FF6B8A, #E8456A)",
              boxShadow: unlockRedirecting
                ? "none"
                : "0 4px 18px rgba(255,107,138,0.25)",
              border: "none",
              cursor: unlockRedirecting ? "not-allowed" : "pointer",
            }}>
            {unlockRedirecting
              ? "결제창으로 이동 중..."
              : `🔓 +15턴 추가 · ₩${UNLOCK_PRICE.toLocaleString()}`}
          </button>
          <p className="text-center text-[10.5px] text-[#A09CB0] mt-2 leading-[1.5]">
            같은 맥락 유지 · 리셋해도 남은 턴 수는 그대로
          </p>
        </div>
      ) : (
        <div
          className="rounded-[18px] p-2.5 bg-white flex gap-2 items-end"
          style={{
            border: "1px solid #FFD6E0",
            boxShadow: "0 2px 14px rgba(255,107,138,0.08)",
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
            className="flex-1 resize-none text-[13.5px] leading-[1.55] text-[#2D2B3D] outline-none rounded-[12px] p-2.5"
            style={{
              background: "#FFF8FA",
              border: "1px solid #FFE8EC",
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
                  ? "linear-gradient(135deg, #FF6B8A, #E8456A)"
                  : "#D0CDE0",
              border: "none",
              cursor: draft.trim() && !sending ? "pointer" : "not-allowed",
              height: 46,
            }}>
            전송
          </button>
        </div>
      )}

      <p className="text-center mt-2 text-[10.5px] text-[#A09CB0] leading-[1.5]">
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
  axes: {
    관심도: 68,
    적극성: 42,
    반응성: 72,
    친밀감: 48,
    일관성: 55,
    미래지향: 35,
  } as Record<string, number>,
  diagnosis:
    "이 사람, 아예 마음이 없는 건 아니야. 답장은 꾸준하고 너 얘기에 반응도 해주거든. 근데 자기 얘길 먼저 꺼내거나 다음 약속을 짚는 건 피해 — 관계를 책임지고 진전시킬 준비는 덜 된 상태야. 네가 불안해질수록 상대는 더 애매해지는 흐름이라, 지금 결정타는 너의 감정 싸움이 아니라 '속도 조절'이야.",
  reasons: [
    "답장은 꾸준한데 관계 진전 얘기는 피하고 있어",
    "호감 표현보다 상황 설명이 더 많아",
    "네가 불안해질수록 더 애매하게 반응하는 흐름이 보여",
  ],
  advice: "지금은 답을 재촉하기보다 조금 텀을 두고 상대 반응을 보는 게 더 유리해.",
};

function SamplePreview() {
  const s = SAMPLE_RESULT;
  return (
    <div className="mb-1">
      <p className="text-[14px] text-[#2D2B3D] font-bold mb-0.5">
        👀 결과가 어떻게 나오냐면
      </p>
      <p className="text-[11px] text-[#8E8A9D] mb-3">그 사람 말보다 태도를 읽어줄게</p>

      {/* 실제 결과 카드와 동일한 구조로 축소 렌더링 */}
      <div
        className="rounded-[22px] p-3 relative overflow-hidden"
        style={{
          background: "#FFF5F7",
          border: "1px solid #FFD6E0",
          boxShadow: "0 2px 16px rgba(255,107,138,0.08)",
        }}>
        {/* SAMPLE 배지 */}
        <div className="absolute top-3 right-3 z-10 px-2 py-[3px] rounded-full text-[9px] font-extrabold tracking-[1.5px]"
          style={{ background: "#2D2B3D", color: "#fff" }}>
          SAMPLE
        </div>

        {/* 1) Score Header 축소 버전 */}
        <div className="text-center py-4 px-3 rounded-[18px] mb-2.5"
          style={{
            background: "linear-gradient(180deg, #FFF0F3 0%, #fff 100%)",
            border: "1px solid rgba(255,143,171,0.2)",
          }}>
          <p className="mb-2 text-[9px] font-semibold tracking-[0.3px]" style={{ color: "#A09CB0" }}>
            가트만 관계 심리학 · 애착이론 기반 분석
          </p>
          {/* Mini score gauge */}
          <div className="flex justify-center">
            <svg width="86" height="86" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="sampleScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B8A" />
                  <stop offset="100%" stopColor="#FF8FA3" />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r="50" fill="none" stroke="#FFD6E0" strokeWidth="10" />
              <circle cx="70" cy="70" r="50" fill="none" stroke="url(#sampleScoreGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - s.score / 100)}
                transform="rotate(-90 70 70)" />
              <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fill="#2D2B3D"
                style={{ fontSize: 36, fontWeight: 800 }}>{s.score}</text>
            </svg>
          </div>
          <p className="text-[10px] font-semibold mt-[-4px]" style={{ color: "#8E8A9D" }}>호감도 점수</p>
          <div className="mt-2 flex justify-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-[4px] rounded-full text-[11px] font-semibold"
              style={{ background: "#FFF4E6", color: "#E8956A" }}>✨ {s.stage}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-[4px] rounded-full text-[11px] font-semibold"
              style={{ background: "#FFF0F3", color: "#2D2B3D" }}>🌤 {s.temperature}</span>
          </div>
          {/* 촌철살인 한마디 */}
          <div className="mt-3 px-2">
            <div className="text-[9px] font-bold mb-1" style={{ color: "#E8456A", letterSpacing: 1 }}>
              💬 AI언니 한마디
            </div>
            <div className="text-[14px] font-extrabold leading-[1.35] text-[#2D2B3D]">
              &ldquo;{s.summary}&rdquo;
            </div>
          </div>
        </div>

        {/* 2) 호감도 레이더 (축소 버전) */}
        <div className="bg-white rounded-[16px] p-3 mb-2" style={{ border: "1px solid rgba(255,143,171,0.15)" }}>
          <div className="text-[12px] font-bold mb-1.5 text-[#2D2B3D]">📊 호감도 레이더</div>
          <div className="flex gap-2 items-center">
            <div className="shrink-0" style={{ width: 150 }}>
              <div style={{ transform: "scale(0.54)", transformOrigin: "top left", width: 280, height: 151 }}>
                <RadarChart axes={s.axes} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {Object.entries(s.axes).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 mb-1 last:mb-0">
                  <span className="text-[10px] font-semibold text-[#2D2B3D] shrink-0" style={{ width: 44 }}>{k}</span>
                  <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: "#FFE8EC" }}>
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: "linear-gradient(90deg, #FF8FA3, #E8456A)" }} />
                  </div>
                  <span className="text-[9px] font-bold tabular-nums shrink-0" style={{ color: "#FF6B8A", width: 18 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3) AI언니 총평 */}
        <div className="bg-white rounded-[16px] p-3 mb-2" style={{ border: "1px solid rgba(255,143,171,0.15)" }}>
          <div className="text-[12px] font-bold mb-1.5 text-[#2D2B3D]">🔍 AI언니 총평</div>
          <p className="text-[11.5px] text-[#2D2B3D] leading-[1.7]">{s.diagnosis}</p>
        </div>

        {/* 4) 유료에서 더 보여주는 파트 (잠금 티저) */}
        <div className="rounded-[16px] p-3 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFF0F3 0%, #FFE8EC 100%)",
            border: "1px dashed #FFADC4",
          }}>
          <div className="text-[12px] font-bold mb-2" style={{ color: "#E8456A" }}>🔒 프리미엄에선 여기까지 나와</div>
          <div className="mb-2">
            <div className="text-[10px] font-bold mb-1 text-[#FF6B8A]">💡 이 점수가 나온 이유</div>
            <ul className="space-y-1">
              {s.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#2D2B3D] leading-[1.5]">
                  <span className="w-1 h-1 rounded-full mt-[6px] shrink-0" style={{ background: "#FF6B8A" }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2" style={{ borderTop: "1px dashed #FFADC4" }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: "#7B7FC4" }}>🎯 언니 말 들어, 이렇게 해봐</div>
            <div className="text-[11px] text-[#2D2B3D] leading-[1.55] italic p-2 rounded-[10px]"
              style={{ background: "rgba(255,255,255,0.75)" }}>
              {s.advice}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold" style={{ color: "#A09CB0" }}>
            <span>🧠 걔 속마음 · ⚠️ 걸리는 부분 · 💬 멘트 예시</span>
          </div>
          {/* 채팅 시뮬 NEW 한 줄 (어필 4/5) */}
          <div
            className="mt-2 px-2.5 py-[6px] rounded-[10px] text-center"
            style={{ background: "rgba(45,43,61,0.85)" }}>
            <span
              className="text-[9px] font-extrabold tracking-[1.5px] mr-1 px-1.5 py-[1px] rounded-full"
              style={{ background: "#FF6B8A", color: "#fff" }}>
              NEW
            </span>
            <span className="text-[10.5px] font-bold text-white">
              💬 분석 후 걔랑 실시간 대화 시뮬레이션까지
            </span>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-[#A09CB0] text-center mt-1.5">
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
      <p className="text-[14px] text-[#2D2B3D] font-bold mb-1">
        📱 카톡·DM 대화 캡처 최대 3장
      </p>
      <p className="text-[12px] text-[#6E6A80] leading-[1.55] mb-1.5">
        길게 설명 안 해도 괜찮아. 카톡·인스타 DM·문자 어디서든 대화 캡처를 올려주면
        말투, 텀, 애매한 표현, 거리감까지 보고 지금 이 관계가 어떤 상태인지 읽어줄게.
        캡처가 많을수록 말투 분석도 정확해져.
      </p>
      <p className="text-[11px] font-semibold text-[#FF6B8A] leading-[1.5] mb-1.5">
        💬 분석 후 대화 시뮬레이션을 하려면 캡처가 꼭 필요해.
      </p>
      <div
        onClick={() => !atLimit && ref.current?.click()}
        className="rounded-[16px] text-center transition-all"
        style={{
          padding: images.length > 0 ? "14px" : "28px 20px",
          border: "1.5px dashed #FFADC4",
          background: "#FFF0F3",
          cursor: atLimit ? "not-allowed" : "pointer",
          opacity: atLimit ? 0.85 : 1,
        }}>
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
          <>
            <div className="text-[28px] mb-1.5">📎</div>
            <div className="text-[13px] text-[#8E8A9D]">
              여기 눌러서 카톡·DM 캡처 추가{" "}
              <span className="text-[#9994A8]">(선택 · 최대 3장)</span>
            </div>
          </>
        ) : (
          <>
            <div
              className="grid gap-2 mb-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)` }}>
              {images.map((img: any, i: number) => (
                <div key={i} className="relative rounded-[10px] overflow-hidden">
                  <img
                    src={img.preview}
                    alt=""
                    className="w-full h-[100px] object-cover block"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(i);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 border-none text-white text-xs cursor-pointer flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#C4C0D0]">
              {atLimit
                ? `📌 최대 ${MAX_IMAGES}장 (${images.length}/${MAX_IMAGES})`
                : `+ 더 추가하기 (${images.length}/${MAX_IMAGES})`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Text Input ───
function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // 단일 선택: 새 칩을 누르면 다른 활성 칩의 프롬프트는 전부 제거 후 새 프롬프트만 prepend
  const handleChip = (prompt: string) => {
    if (value.includes(prompt)) return; // 이미 같은 칩 활성 — 무시
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
      <p className="text-[14px] text-[#2D2B3D] font-bold mb-1">✏️ 지금 네 고민, 어디에 제일 가까워?</p>
      <p className="text-[11px] text-[#8E8A9D] mb-2.5">괜히 예민한 건지, 진짜 이상한 건지 구분해줄게</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {CHIPS.map((chip, i) => {
          const isActive = value.includes(chip.prompt);
          return (
            <button
              key={i}
              onClick={() => {
                if (isActive) return;        // 이미 추가된 칩은 중복 클릭 차단
                handleChip(chip.prompt);
              }}
              disabled={isActive}
              aria-pressed={isActive}
              className="inline-flex items-center gap-1 px-3.5 py-[8px] rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
              style={{
                background: isActive ? "#FF6B8A" : "#fff",
                color: isActive ? "#fff" : "#2D2B3D",
                border: isActive ? "1.5px solid #FF6B8A" : "1.5px solid #FFD6E0",
                boxShadow: isActive
                  ? "0 4px 14px rgba(255,107,138,0.32)"
                  : "0 2px 8px rgba(255,143,171,0.15)",
                cursor: isActive ? "default" : "pointer",
                opacity: isActive ? 0.95 : 1,
              }}>
              {chip.emoji} {chip.label}
            </button>
          );
        })}
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={"상황 버튼을 누르거나 직접 써줘!\n\n예시: 3주 전에 소개팅으로 만났는데, 카톡은 매일 해. 근데 항상 내가 먼저 연락하거든? 답장은 빠르고 이모티콘도 많이 쓰는데, 만나자는 말은 안 해..."}
        className="w-full min-h-[110px] py-3.5 px-4 rounded-[20px] text-sm leading-[1.7] resize-y outline-none transition-colors focus:border-[#FF6B8A]"
        style={{
          border: "1.5px solid #FFD6E0",
          background: "#fff",
          color: "#2D2B3D",
          boxShadow: "0 2px 12px rgba(255,143,171,0.06)",
        }} />
    </div>
  );
}

// ─── Loading (무료 분석: 이론 기반 진행 문구) ───
function LoadingState() {
  const steps = [
    { msg: "카톡·상황 읽는 중", detail: "Conversation Decoding", pct: 22 },
    { msg: "긍정:부정 상호작용 비율 계산", detail: "The Gottman Ratio · 5:1 균형", pct: 48 },
    { msg: "애착 유형 판별 중", detail: "Attachment Theory · Bowlby", pct: 72 },
    { msg: "6축 호감 레이더 산출 중", detail: "관심도 · 적극성 · 반응성 · 친밀감 · 일관성 · 미래지향", pct: 92 },
  ];
  const [i, setI] = useState(0);
  const [smoothPct, setSmoothPct] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 2300);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const target = steps[i].pct;
    const timer = setTimeout(() => setSmoothPct(target), 100);
    return () => clearTimeout(timer);
  }, [i]);

  return (
    <div className="text-center py-[50px] px-5 animate-fadeUp">
      <div className="w-[48px] h-[48px] mx-auto mb-4 rounded-full animate-spin"
        style={{ border: "3px solid #FFD6E0", borderTopColor: "#FF6B8A" }} />

      <div className="text-[10px] font-bold mb-2" style={{ color: "#E8456A", letterSpacing: 1.2 }}>
        🔬 AI언니 분석 중
      </div>
      <p className="text-[15px] text-[#2D2B3D] font-bold mb-1 leading-[1.4]">
        {steps[i].msg}...
      </p>
      <p className="text-[11px] text-[#8E8A9D] italic mb-5 px-2 leading-[1.5]">
        {steps[i].detail}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-[260px] mx-auto">
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "#FFE8EC" }}>
          <div className="h-full rounded-full" style={{
            width: `${smoothPct}%`,
            background: "linear-gradient(90deg, #FF8FA3, #FF6B8A, #E8456A)",
            transition: "width 1.8s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <p className="mt-2 text-[11px] font-bold tabular-nums" style={{ color: "#FF6B8A" }}>
          {smoothPct}%
        </p>
      </div>

      <p className="mt-4 text-[11px] font-bold leading-[1.5]" style={{ color: "#E8456A" }}>
        기분 말고 흐름으로 볼게
      </p>
      <p className="mt-0.5 text-[10px] text-[#A09CB0] leading-[1.5]">
        가트만 관계심리학 + 애착이론 기반
      </p>
    </div>
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
  const inputRef = useRef({ text: "", imageData: [] as any[] });

  // Check free usage + restore paid result on mount
  // ?reset=1 붙이면 전체 초기화 (테스트용)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("reset=1")) {
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
      setFreeResult(result);
      markFreeUsed();
      setFreeUsed(true);
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
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  return (
    <main className="min-h-screen px-4 pt-5 pb-10"
      style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #FFF5F7 30%, #FFFFFF 100%)" }}>
      <div className="max-w-[420px] mx-auto">
        {!result && (
          <div className="text-center mb-6 pt-4 animate-fadeUp">
            {/* 가트만 · 애착이론 배지 — AI언니 위 테두리 박스 */}
            <div className="inline-block mb-3 px-3 py-1.5 rounded-full border border-[#FF6B8A]/40 bg-white/70 backdrop-blur-sm shadow-sm">
              <span className="text-[11px] text-[#7B7FC4] font-bold tracking-wide">
                🔬 Gottman 관계심리학 · 애착이론 기반 분석
              </span>
            </div>
            <div className="text-[40px] mb-2 animate-float">👩‍❤️‍👨</div>
            <h1 className="text-[32px] font-extrabold text-[#2D2B3D] tracking-tight mb-1.5">
              AI<span className="text-[#FF6B8A]">언니</span>
            </h1>
            <p className="text-[13px] text-[#2D2B3D] font-bold leading-relaxed">
              대화 캡쳐 한 장이면 걔 속마음이 보여
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
        ) : loading ? (
          <LoadingState />
        ) : (
          <div className="animate-fadeUp flex flex-col gap-4">
            <TextInput value={text} onChange={setText} />
            <UploadZone images={images} onAdd={addImages} onRemove={removeImage} />

            {/* 캡처 업로드 시 개인정보 동의 — 제3자(상대방) 정보 포함되므로 명시 동의 필수 */}
            {images.length > 0 && (
              <label className="flex items-start gap-2.5 p-3.5 rounded-[14px] cursor-pointer select-none transition-colors"
                style={{
                  background: imageConsent ? "#FFF0F3" : "#FFF8FA",
                  border: `1.5px solid ${imageConsent ? "#FF6B8A" : "#FFD6E0"}`,
                }}>
                <input
                  type="checkbox"
                  checked={imageConsent}
                  onChange={(e) => setImageConsent(e.target.checked)}
                  className="mt-[3px] shrink-0 cursor-pointer"
                  style={{ accentColor: "#E8456A", width: 16, height: 16 }}
                />
                <div className="flex-1 text-[12.5px] text-[#2D2B3D] leading-[1.55]">
                  대화 내용 분석 동의 (필수) ·{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer"
                    className="underline font-semibold" style={{ color: "#E8456A" }}>
                    자세히
                  </a>
                </div>
              </label>
            )}

            {error && (
              <div className="py-3 px-4 rounded-[16px] text-[13px] text-center"
                style={{ background: "#FFF0F0", border: "1px solid #FFD6D6", color: "#E8456A" }}>
                {error}
              </div>
            )}

            {(freeUsed || forcePaid) ? (
              <>
                <div className="py-4 px-5 rounded-[20px] text-center"
                  style={{ background: "#FFF0F3", border: "1px solid #FFD6E0" }}>
                  <p className="text-[15px] text-[#2D2B3D] font-bold mb-1">
                    {freeUsed ? "오늘 무료 분석 완료 · 내일 다시 와줘 💕" : "🔓 심층 유료 분석 모드"}
                  </p>
                  <p className="text-[12px] text-[#8E8A9D] mb-2">지금 바로 보고 싶다면 ↓</p>
                  {/* 채팅 시뮬 번들 어필 (어필 5/5) */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full"
                    style={{ background: "#2D2B3D" }}>
                    <span className="text-[9px] font-extrabold tracking-[1.5px]"
                      style={{ color: "#FFB3C1" }}>
                      BONUS
                    </span>
                    <span className="text-[10.5px] font-bold text-white">
                      💬 결제하면 걔랑 대화 시뮬레이션까지 2턴 무료
                    </span>
                  </div>
                </div>
                <button onClick={analyzePaidDirect} disabled={!canAnalyze || redirecting || unlocking}
                  className="w-full py-4 rounded-[20px] border-none text-base font-bold transition-all active:scale-[0.97]"
                  style={{
                    background: canAnalyze ? "linear-gradient(135deg, #FF6B8A, #E8456A)" : "#FFF0F3",
                    color: canAnalyze ? "#fff" : "#C4C0D0",
                    cursor: canAnalyze ? "pointer" : "default",
                    boxShadow: canAnalyze ? "0 4px 20px rgba(255,107,138,0.2)" : "none",
                    opacity: (redirecting || unlocking) ? 0.7 : 1,
                  }}>
                  {redirecting
                    ? "결제창으로 이동 중..."
                    : !hasInput
                      ? "먼저 상황을 알려줘! 💬"
                      : !consentOk
                        ? "캡처 이용 동의에 체크해줘 ☝️"
                        : "🔓 바로 심층 분석 보기 · ₩2,900"}
                </button>
              </>
            ) : (
              <button onClick={analyze} disabled={!canAnalyze}
                className="w-full py-4 rounded-[20px] border-none text-base font-bold transition-all active:scale-[0.97]"
                style={{
                  background: canAnalyze ? "linear-gradient(135deg, #FF6B8A, #E8456A)" : "#FFF0F3",
                  color: canAnalyze ? "#fff" : "#C4C0D0",
                  cursor: canAnalyze ? "pointer" : "default",
                  boxShadow: canAnalyze ? "0 4px 20px rgba(255,107,138,0.2)" : "none",
                }}>
                {!hasInput
                  ? "먼저 상황을 알려줘! 💬"
                  : !consentOk
                    ? "캡처 이용 동의에 체크해줘 ☝️"
                    : "무료로 분석해보기 →"}
              </button>
            )}

            {/* 채팅 시뮬 티저 카드 (단가 없음 · 단순) */}
            <div
              className="rounded-[18px] px-4 py-3 border flex items-start gap-2.5"
              style={{
                background: "linear-gradient(135deg, #2D2B3D 0%, #3B3A52 100%)",
                borderColor: "#FF6B8A",
              }}>
              <div className="text-[20px] leading-none mt-[2px]">💬</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-extrabold tracking-[1.5px] px-1.5 py-[2px] rounded-full shrink-0"
                    style={{ background: "#FF6B8A", color: "#fff" }}>
                    NEW
                  </span>
                  <span className="text-[12.5px] font-extrabold text-white">
                    분석 후, 실시간 대화 시뮬레이션 가능
                  </span>
                </div>
                <div className="text-[10.5px] text-[#FFD6E0] mt-[3px] leading-[1.4]">
                  ※ 대화 시뮬레이션은 카톡·DM 캡처가 있어야 열려
                </div>
              </div>
            </div>

            <SamplePreview />
          </div>
        )}

        {/* 푸터 — 사업자 정보 + 법적 페이지 링크 (토스 심사 필수) */}
        <SiteFooter />
      </div>
    </main>
  );
}

// ─── Site Footer (사업자 정보 + 법적 페이지) ───
// ※ [대괄호] 플레이스홀더는 사업자등록 완료 후 실제 값으로 교체할 것.
function SiteFooter() {
  return (
    <footer
      className="mt-10 pt-5 pb-2 text-[11px] leading-[1.7] text-[#6E6A80]"
      style={{ borderTop: "1px solid #FFD6E0" }}>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5">
        <a href="/terms" className="font-semibold text-[#2D2B3D] hover:underline">이용약관</a>
        <span className="text-[#D8D4E0]">·</span>
        <a href="/privacy" className="font-semibold text-[#2D2B3D] hover:underline">개인정보처리방침</a>
        <span className="text-[#D8D4E0]">·</span>
        <a href="/refund" className="font-semibold text-[#2D2B3D] hover:underline">환불정책</a>
      </div>
      <div className="text-[10.5px] text-[#8E8A9D] leading-[1.75]">
        <div>상호: 주니랩스튜디오 | 대표자: 김경은</div>
        <div>사업자등록번호: 875-56-01088 | 통신판매업신고번호: [제0000-지역-0000호]</div>
        <div>주소: 서울특별시 서초구 바우뫼로7길 29</div>
        <div>고객센터: junilabstudio@gmail.com (평일 10:00~18:00)</div>
        <div className="mt-1.5 text-[#A09CB0]">
          © {new Date().getFullYear()} AI언니. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
