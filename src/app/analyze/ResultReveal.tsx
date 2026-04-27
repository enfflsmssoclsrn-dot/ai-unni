"use client";

// Gacha Tier Reveal — based on /Downloads/design_handoff_gacha_reveal/
// score → tier 매핑: <60 normal · <80 rare · ≥80 legendary
// charge → base → (promote1 → midTier → (promote2 → finalTier)) → hold (대기) → fade

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Tier palette (메이플 큐브 스타일: WHITE → GOLD → PINK) ───
type TierColors = {
  color: string;
  colorHi: string;
  glowA: string;
  glowB: string;
  textColor: string;
  haloSize: number;
  glowStrength: number;
};

const C_GRAY: TierColors = {
  color: "#B8C0CC",
  colorHi: "#E8EEF5",
  glowA: "#A8B0BC",
  glowB: "#D0D6DE",
  textColor: "#FFFFFF",
  haloSize: 1.0,
  glowStrength: 0.35,
};
const C_YELLOW: TierColors = {
  color: "#FFB635",
  colorHi: "#FFE56B",
  glowA: "#FFD447",
  glowB: "#FF9020",
  textColor: "#FFE89A",
  haloSize: 1.4,
  glowStrength: 0.7,
};
const C_RED: TierColors = {
  color: "#FF3B7E",
  colorHi: "#FFA8C8",
  glowA: "#FF5E94",
  glowB: "#FFB8D4",
  textColor: "#FFF0F4",
  haloSize: 1.9,
  glowStrength: 1.0,
};

type TierKey = "normal" | "rare" | "legendary";
type TierStep = {
  toColors: TierColors;
  sub: string;
  beamCount: number;
  beamWidth: number;
  beamLen: number;
  beamIntensity: number;
  particleCount: number;
  shake: number;
  flashAlpha: number;
  shards: boolean;
};
type TierConfig = {
  sub: string;
  name: string;
  message: string;
  colors: TierColors;
  baseScore: number;
  promoteSteps: TierStep[];
};

const TIERS: Record<TierKey, TierConfig> = {
  normal: {
    sub: "NORMAL",
    name: "애매한 사이",
    message: "애매하게 걸쳐있어",
    colors: C_GRAY,
    baseScore: 0,
    promoteSteps: [],
  },
  rare: {
    sub: "RARE",
    name: "호감있음",
    message: "조금만 더 다가가봐",
    colors: C_YELLOW,
    baseScore: 52,
    promoteSteps: [
      {
        toColors: C_YELLOW,
        sub: "RARE",
        beamCount: 6,
        beamWidth: 10,
        beamLen: 200,
        beamIntensity: 0.42,
        particleCount: 18,
        shake: 1.5,
        flashAlpha: 0.75,
        shards: false,
      },
    ],
  },
  legendary: {
    sub: "LEGENDARY",
    name: "운명의 상대",
    message: "이건 운명이야",
    colors: C_RED,
    baseScore: 56,
    promoteSteps: [
      {
        toColors: C_YELLOW,
        sub: "RARE",
        beamCount: 6,
        beamWidth: 10,
        beamLen: 200,
        beamIntensity: 0.42,
        particleCount: 18,
        shake: 1.5,
        flashAlpha: 0.75,
        shards: false,
      },
      {
        toColors: C_RED,
        sub: "LEGENDARY",
        beamCount: 9,
        beamWidth: 16,
        beamLen: 290,
        beamIntensity: 0.6,
        particleCount: 40,
        shake: 4,
        flashAlpha: 0.9,
        shards: true,
      },
    ],
  },
};

const HEART_PATH =
  "M 60 100 C 60 100, 10 68, 10 40 C 10 22, 24 10, 40 10 C 50 10, 58 16, 60 24 C 62 16, 70 10, 80 10 C 96 10, 110 22, 110 40 C 110 68, 60 100, 60 100 Z";

// ─── helpers ───
function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let H = 0;
  let S = 0;
  const L = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    S = L > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        H = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        H = (b - r) / d + 2;
        break;
      default:
        H = (r - g) / d + 4;
    }
    H *= 60;
  }
  return { h: H, s: S * 100, l: L * 100 };
}
function hsla(h: number, s: number, l: number, a: number) {
  return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${a})`;
}
function alphaHex(a: number) {
  const v = Math.max(0, Math.min(255, Math.round(a * 255)));
  return v.toString(16).padStart(2, "0");
}
function darkenHex(hex: string, factor: number) {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor));
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function scoreToTier(score: number): TierKey {
  if (score >= 80) return "legendary";
  if (score >= 60) return "rare";
  return "normal";
}

// ─── Visuals ───
function Starfield({
  beat,
  seed,
  intensity = 1,
}: {
  beat: number;
  seed: number;
  intensity?: number;
}) {
  const stars = useMemo(() => {
    const rnd = mulberry32(seed + 4242);
    return Array.from({ length: 36 }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      size: 1 + rnd() * 2,
      tone: rnd() > 0.7 ? "#FFE8B4" : "#FFFFFF",
      phase: rnd() * Math.PI * 2,
      speed: 0.4 + rnd() * 1.4,
      baseOpacity: 0.3 + rnd() * 0.4,
    }));
  }, [seed]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {stars.map((s, i) => {
        const tw =
          0.5 + 0.5 * Math.sin((beat / 350) * s.speed + s.phase);
        const op = s.baseOpacity + tw * 0.55;
        const sc = 1 + tw * 0.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.tone,
              transform: `translate(-50%,-50%) scale(${sc})`,
              opacity: op * intensity,
              boxShadow: `0 0 ${s.size * 2}px ${s.tone}`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}

function BokehBackground({
  beat,
  colors,
  intensity = 1,
  seed,
}: {
  beat: number;
  colors: TierColors;
  intensity?: number;
  seed: number;
}) {
  const dots = useMemo(() => {
    const rnd = mulberry32(seed + 9999);
    return Array.from({ length: 8 }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      size: 30 + rnd() * 70,
      phase: rnd() * Math.PI * 2,
      driftX: (rnd() - 0.5) * 60,
      driftY: (rnd() - 0.5) * 60,
      speed: 0.3 + rnd() * 0.7,
      tint: rnd(),
    }));
  }, [seed]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {dots.map((d, i) => {
        const t = beat * 0.001 * d.speed;
        const dx = Math.sin(t + d.phase) * d.driftX;
        const dy = Math.cos(t * 0.7 + d.phase) * d.driftY;
        const breath =
          0.4 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.phase));
        const tint =
          d.tint > 0.6
            ? colors.glowA
            : d.tint > 0.3
            ? colors.colorHi
            : "#FFD8B5";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${tint}b0 0%, ${tint}40 45%, transparent 75%)`,
              transform: `translate3d(calc(-50% + ${dx}px), calc(-50% + ${dy}px), 0)`,
              opacity: breath * intensity,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}

function ChargeParticles({ t, beat }: { t: number; beat: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * Math.PI * 2 + (i % 3) * 0.3,
        dist: 140 + (i % 5) * 22,
        delay: ((i % 8) / 8) * 0.3,
        size: 2 + (i % 3),
        spin: (i % 2 === 0 ? 1 : -1) * (0.6 + (i % 4) * 0.15),
      })),
    []
  );
  return (
    <div
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {particles.map((p, i) => {
        const lt = Math.max(
          0,
          Math.min(1, (t - p.delay) / (1 - p.delay))
        );
        const eased = 1 - Math.pow(1 - lt, 3);
        const r = p.dist * (1 - eased);
        const orbit = beat * 0.0014 * p.spin * (1 + eased * 1.5);
        const ang = p.angle + orbit;
        const opacity =
          lt < 0.1
            ? lt * 10
            : Math.max(0, 1 - (lt - 0.7) / 0.3);
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#FFFFFF",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity,
              boxShadow: `0 0 ${10 + p.size * 3}px #FFD8B5, 0 0 ${
                4 + p.size
              }px #FFFFFF`,
            }}
          />
        );
      })}
    </div>
  );
}

function ChargeCore({ t }: { t: number }) {
  const size = 4 + t * t * 40;
  const pulse = t > 0.5 ? 1 + Math.sin(t * 40) * 0.1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C_GRAY.colorHi} 0%, ${C_GRAY.color} 60%, transparent 100%)`,
        transform: `translate(-50%,-50%) scale(${pulse})`,
        boxShadow: `0 0 ${size * 2}px ${C_GRAY.glowA}, 0 0 ${
          size * 4
        }px ${C_GRAY.glowB}`,
        opacity: 0.3 + t * 0.7,
      }}
    />
  );
}

function PromoteFlash({
  t,
  colors,
  alpha,
}: {
  t: number;
  colors: TierColors;
  alpha: number;
}) {
  const a = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 0.85);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 50%, #FFFFFF 0%, ${colors.colorHi} 35%, transparent 70%)`,
        opacity: a * alpha,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}

function PromoteRings({
  t,
  colors,
  strength = 1,
}: {
  t: number;
  colors: TierColors;
  strength?: number;
}) {
  const rings = [0, 0.18, 0.35];
  return (
    <div
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {rings.map((delay, i) => {
        const lt = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
        if (lt <= 0) return null;
        const eased = 1 - Math.pow(1 - lt, 2);
        const size = 20 + eased * 520 * strength;
        const op = 1 - lt;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${3 - i}px solid ${colors.colorHi}`,
              transform: "translate(-50%,-50%)",
              opacity: op * 0.9,
              boxShadow: `0 0 30px ${colors.glowA}`,
            }}
          />
        );
      })}
    </div>
  );
}

function TierBeams({
  t,
  colors,
  count,
  beat,
  widthPx = 14,
  lenPx = 320,
  intensity = 0.65,
  blur = 1,
}: {
  t: number;
  colors: TierColors;
  count: number;
  beat: number;
  widthPx?: number;
  lenPx?: number;
  intensity?: number;
  blur?: number;
}) {
  if (!count) return null;
  const beams = Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * 360,
    idx: i,
  }));
  const entryT = Math.min(1, t / 0.25);
  const eased = 1 - Math.pow(1 - entryT, 3);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        transform: `translate(-50%,-50%) rotate(${beat / 80}deg)`,
        pointerEvents: "none",
      }}
    >
      {beams.map((b) => {
        const pulse = 0.7 + Math.sin(beat / 200 + b.idx) * 0.3;
        const length = lenPx * eased * pulse;
        const w = widthPx * (b.idx % 2 === 0 ? 1 : 0.55);
        return (
          <div
            key={b.idx}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: length,
              height: w,
              background: `linear-gradient(90deg, #FFFFFF 0%, ${colors.colorHi} 15%, ${colors.color} 45%, ${colors.color}77 75%, transparent 100%)`,
              transform: `translate(0, -50%) rotate(${b.angle}deg)`,
              transformOrigin: "0 50%",
              opacity: intensity * eased,
              filter: `blur(${blur}px)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </div>
  );
}

function SparkleParticles({
  t,
  colors,
  count,
  beat,
  seed,
}: {
  t: number;
  colors: TierColors;
  count: number;
  beat: number;
  seed: number;
}) {
  const particles = useMemo(() => {
    const rnd = mulberry32(seed + 1234);
    return Array.from({ length: count }, () => ({
      angle: rnd() * Math.PI * 2,
      dist: 60 + rnd() * 140,
      delay: rnd() * 0.4,
      size: 2 + rnd() * 4,
      phase: rnd() * Math.PI * 2,
    }));
  }, [count, seed]);
  return (
    <div
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {particles.map((p, i) => {
        const lt = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
        if (lt <= 0) return null;
        const eased = 1 - Math.pow(1 - Math.min(lt * 2, 1), 2);
        const drift = Math.sin(beat / 400 + p.phase) * 8;
        const x = Math.cos(p.angle) * p.dist * eased + drift;
        const y = Math.sin(p.angle) * p.dist * eased - lt * 20;
        const twinkle = 0.5 + Math.sin(beat / 150 + p.phase * 3) * 0.5;
        const opacity =
          Math.min(1, lt * 3) *
          (1 - Math.max(0, (lt - 0.6) / 0.4)) *
          twinkle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: colors.colorHi,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${colors.glowA}`,
            }}
          />
        );
      })}
    </div>
  );
}

function StarburstSparkles({
  t,
  colors,
  count,
  seed,
}: {
  t: number;
  colors: TierColors;
  count: number;
  seed: number;
}) {
  const sparks = useMemo(() => {
    const rnd = mulberry32(seed + 8888);
    return Array.from({ length: count }, () => {
      const r = Math.sqrt(rnd()) * 200;
      const theta = rnd() * Math.PI * 2;
      return {
        dx: Math.cos(theta) * r,
        dy: Math.sin(theta) * r,
        delay: rnd() * 0.3,
        size: 9 + rnd() * 8,
        rot: rnd() * 90,
      };
    });
  }, [count, seed]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 18,
      }}
    >
      {sparks.map((s, i) => {
        const lt = Math.max(0, Math.min(1, (t - s.delay) / (1 - s.delay)));
        if (lt <= 0) return null;
        const sc = lt < 0.4 ? lt / 0.4 : 1 - (lt - 0.4) / 0.6;
        const op = sc;
        return (
          <svg
            key={i}
            viewBox="-15 -15 30 30"
            width={s.size * 2}
            height={s.size * 2}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(${sc}) rotate(${s.rot}deg)`,
              opacity: op,
              filter: `drop-shadow(0 0 4px ${colors.color})`,
              overflow: "visible",
            }}
          >
            <line
              x1="0"
              y1="-12"
              x2="0"
              y2="12"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="-12"
              y1="0"
              x2="12"
              y2="0"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
          </svg>
        );
      })}
    </div>
  );
}

function HaloBackdrop({
  strength = 1,
  beat = 0,
  accentColor = "#FFFFFF",
  tone = 0,
  seed = 0,
}: {
  strength?: number;
  beat?: number;
  accentColor?: string;
  tone?: number;
  seed?: number;
}) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("halo-keyframes")) return;
    const s = document.createElement("style");
    s.id = "halo-keyframes";
    s.textContent =
      "@keyframes haloFogRot { from { transform: translateY(-8%) rotate(0deg); } to { transform: translateY(-8%) rotate(360deg); } } @keyframes godRayRot { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }";
    document.head.appendChild(s);
  }, []);

  const accentHsl = useMemo(() => hexToHsl(accentColor), [accentColor]);
  const beams = useMemo(() => {
    const rnd = mulberry32(seed + 9090);
    const angles: number[] = [];
    let acc = rnd() * 360;
    const pairChance = 0.4;
    while (angles.length < 12) {
      angles.push(acc);
      if (rnd() < pairChance && angles.length < 12) {
        angles.push(acc + 8 + rnd() * 6);
        acc += 35 + rnd() * 30;
      } else {
        acc += 18 + rnd() * 35;
      }
    }
    return angles.slice(0, 12).map((angle, i) => ({
      angle: angle % 360,
      lenJitter: 0.85 + rnd() * 0.3,
      widthJitter: 0.55 + rnd() * 0.9,
      flickerPeriod: 3 + rnd() * 4,
      flickerOffset: rnd() * Math.PI * 2,
      thick: rnd() < 0.35,
      _i: i,
    }));
  }, [seed]);

  if (strength <= 0) return null;

  const haloH = accentHsl.h;
  const haloS = accentHsl.s * (0.4 + 0.6 * tone);
  const haloL = 60 + 25 * (1 - tone);
  const t = beat / 60;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 70% at 50% 50%,
            ${hsla(haloH, haloS, haloL + 15, 0.55 * strength)} 0%,
            ${hsla(haloH, haloS, haloL + 5, 0.38 * strength)} 22%,
            ${hsla(haloH, haloS, haloL - 5, 0.22 * strength)} 45%,
            ${hsla(haloH, haloS * 0.6, haloL - 15, 0.1 * strength)} 70%,
            transparent 100%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background: `conic-gradient(from ${(t * 6) % 360}deg at 50% 50%,
            ${hsla(haloH, haloS, haloL + 10, 0.18 * strength)} 0deg,
            ${hsla((haloH + 30) % 360, haloS * 0.8, haloL + 5, 0.1 * strength)} 60deg,
            ${hsla(haloH, haloS * 0.6, haloL, 0.06 * strength)} 120deg,
            ${hsla((haloH + 60) % 360, haloS * 0.7, haloL + 8, 0.14 * strength)} 180deg,
            ${hsla(haloH, haloS * 0.9, haloL + 12, 0.1 * strength)} 240deg,
            ${hsla((haloH - 20 + 360) % 360, haloS * 0.7, haloL + 4, 0.08 * strength)} 300deg,
            ${hsla(haloH, haloS, haloL + 10, 0.18 * strength)} 360deg)`,
          filter: "blur(40px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          transform: "translateY(-8%)",
          animation: "haloFogRot 60s linear infinite",
          zIndex: 1,
        }}
      />
      <svg
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1,
          height: 1,
          overflow: "visible",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          opacity: Math.min(0.5, 0.5 * strength),
          zIndex: 2,
          animation: "godRayRot 90s linear infinite",
        }}
      >
        <defs>
          <filter
            id={`rayBlur-${seed}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <linearGradient
            id={`rayGrad-${seed}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop
              offset="8%"
              stopColor={hsla(haloH, haloS * 0.4, 96, 0.85)}
            />
            <stop
              offset="15%"
              stopColor={hsla(haloH, haloS * 0.5, 92, 0.95)}
            />
            <stop
              offset="35%"
              stopColor={hsla(
                haloH,
                haloS * 0.85,
                Math.min(80, haloL + 15),
                0.75
              )}
            />
            <stop
              offset="50%"
              stopColor={hsla(haloH, haloS, haloL + 8, 0.6)}
            />
            <stop
              offset="75%"
              stopColor={hsla(haloH, haloS * 0.9, haloL, 0.25)}
            />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <g filter={`url(#rayBlur-${seed})`}>
          {beams.map((b) => {
            const phase =
              (t / b.flickerPeriod) * Math.PI * 2 + b.flickerOffset;
            const flick = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(phase));
            const len = 820 * b.lenJitter * flick;
            const w = (b.thick ? 42 : 26) * b.widthJitter;
            return (
              <g key={b._i} transform={`rotate(${b.angle})`}>
                <ellipse
                  cx={0}
                  cy={-len * 0.5}
                  rx={w}
                  ry={len * 0.5}
                  fill={`url(#rayGrad-${seed})`}
                  opacity={flick}
                />
              </g>
            );
          })}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 520 * strength,
          height: 520 * strength,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle,
            rgba(255,255,255,${0.95 * strength}) 0%,
            rgba(255,255,255,${0.85 * strength}) 8%,
            ${hsla(haloH, haloS * 0.5, 92, 0.55 * strength)} 22%,
            ${hsla(haloH, haloS * 0.7, 80, 0.32 * strength)} 42%,
            ${hsla(haloH, haloS, haloL + 5, 0.14 * strength)} 65%,
            transparent 90%)`,
          filter: "blur(6px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 140 * (0.85 + 0.15 * strength),
          height: 140 * (0.85 + 0.15 * strength),
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255,255,255,0.98)",
          filter: `blur(8px) drop-shadow(0 0 30px rgba(255,255,255,${
            0.9 * strength
          }))`,
          mixBlendMode: "screen",
          opacity: strength,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
    </>
  );
}

function CoreHeart({
  scale,
  colors,
  subId,
}: {
  scale: number;
  colors: TierColors;
  subId: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%,-50%) scale(${scale})`,
        transformOrigin: "50% 50%",
        width: 180,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 14,
      }}
    >
      <svg
        viewBox="0 0 180 165"
        width="220"
        height="200"
        style={{
          overflow: "visible",
          position: "relative",
          zIndex: 2,
          color: colors.color,
          filter:
            colors.haloSize > 1.3
              ? `drop-shadow(0 0 4px ${colors.colorHi}) drop-shadow(0 0 12px ${colors.color}) drop-shadow(0 0 32px ${colors.color}99) drop-shadow(0 0 64px ${colors.glowA}55) drop-shadow(0 2px 4px rgba(0,0,0,0.4))`
              : `drop-shadow(0 0 4px ${colors.colorHi}cc) drop-shadow(0 0 12px ${colors.color}aa) drop-shadow(0 0 32px ${colors.color}55) drop-shadow(0 0 64px ${colors.glowA}33) drop-shadow(0 2px 4px rgba(0,0,0,0.35))`,
          transition: "filter 1000ms ease",
        }}
      >
        <defs>
          <radialGradient
            id={`cgrad-${subId}`}
            cx="42%"
            cy="38%"
            r="65%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="22%" stopColor={colors.colorHi} />
            <stop offset="55%" stopColor={colors.color} />
            <stop offset="82%" stopColor={colors.glowB} />
            <stop offset="100%" stopColor={darkenHex(colors.glowB, 0.35)} />
          </radialGradient>
          <filter
            id={`softGlow-${subId}`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3"
              result="blur3"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="8"
              result="blur8"
            />
            <feMerge>
              <feMergeNode in="blur8" />
              <feMergeNode in="blur3" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(30, 32)">
          <path
            d={HEART_PATH}
            fill={`url(#cgrad-${subId})`}
            filter={`url(#softGlow-${subId})`}
          />
          <path
            d={HEART_PATH}
            fill={colors.colorHi}
            opacity={colors.haloSize > 1.3 ? 0.6 : 0.45}
            style={{ filter: "blur(8px)", mixBlendMode: "screen" }}
          />
          <path
            d={HEART_PATH}
            fill="none"
            stroke={colors.colorHi}
            strokeWidth="2.5"
            opacity={0.7}
            style={{
              filter: `blur(4px) drop-shadow(0 0 12px ${colors.colorHi})`,
            }}
          />
          <ellipse
            cx="48.75"
            cy="33.75"
            rx="14"
            ry="7"
            fill="rgba(255,255,255,0.95)"
            transform="rotate(-25 48.75 33.75)"
            style={{ filter: `blur(2.5px)`, opacity: 0.92 }}
          />
          <ellipse
            cx="93.75"
            cy="31.5"
            rx="7.5"
            ry="3.8"
            fill="rgba(255,255,255,0.85)"
            transform="rotate(-20 93.75 31.5)"
            style={{ filter: `blur(2px)`, opacity: 0.85 }}
          />
        </g>
      </svg>
    </div>
  );
}

function ScoreDisplay({
  value,
  colors,
  opacity = 1,
  isLegendary,
}: {
  value: number;
  colors: TierColors;
  opacity?: number;
  isLegendary: boolean;
}) {
  const g = colors.glowStrength || 1;
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("rainbow-text-kf")) return;
    const s = document.createElement("style");
    s.id = "rainbow-text-kf";
    s.textContent = `
      .gacha-rainbow-text {
        background: linear-gradient(90deg, #ff0080, #ff8c00, #ffd700, #00ff88, #00bfff, #8a2be2, #ff0080);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        -webkit-text-stroke: 2px white;
        font-weight: 900;
        letter-spacing: -5px;
        animation: gacha-rainbow-shift 2.5s linear infinite;
      }
      @keyframes gacha-rainbow-shift { to { background-position: 200% 0; } }
    `;
    document.head.appendChild(s);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(50% - 200px)",
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        pointerEvents: "none",
        transition: "opacity 180ms ease",
      }}
    >
      {isLegendary ? (
        <div
          style={{
            fontFamily: "var(--font-serif), 'Fraunces', serif",
            fontSize: 78,
            lineHeight: 1,
            filter: `drop-shadow(0 0 12px rgba(255,255,255,0.6)) drop-shadow(0 0 24px ${colors.color}) drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
          }}
        >
          <span className="gacha-rainbow-text">{Math.round(value)}</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "#FFFFFF",
              opacity: 0.85,
              marginLeft: 6,
              letterSpacing: 0,
              WebkitTextStroke: 0,
              textShadow: `0 0 10px ${colors.glowA}`,
            }}
          >
            점
          </span>
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--font-serif), 'Fraunces', serif",
            fontSize: 68,
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow:
              g < 0.5
                ? `0 2px 6px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.3)`
                : `0 0 ${10 + g * 8}px #FFFFFF, 0 0 ${
                    20 + g * 16
                  }px ${colors.glowA}, 0 0 ${36 + g * 24}px ${
                    colors.color
                  }, 0 2px 6px rgba(0,0,0,0.5)`,
          }}
        >
          {Math.round(value)}
          <span
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "#FFFFFF",
              opacity: 0.75,
              marginLeft: 4,
              letterSpacing: 0,
            }}
          >
            점
          </span>
        </div>
      )}
    </div>
  );
}

function TierName({
  show,
  colors,
  name,
  message,
}: {
  show: boolean;
  colors: TierColors;
  name: string;
  message: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 96,
        left: 0,
        right: 0,
        transform: `translateY(${show ? 0 : 16}px)`,
        opacity: show ? 1 : 0,
        textAlign: "center",
        pointerEvents: "none",
        transition:
          "opacity 300ms ease, transform 300ms ease, color 300ms ease",
      }}
    >
      <div
        style={{
          fontFamily:
            "var(--font-serif), 'Fraunces', 'Noto Serif KR', serif",
          fontSize: 32,
          fontWeight: 500,
          color: "#FFFFFF",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: 10,
          textShadow: `0 0 16px ${colors.glowA}aa, 0 2px 8px rgba(0,0,0,0.55)`,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 14,
          color: "#E8E4DD",
          fontStyle: "italic",
          opacity: 0.9,
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        &quot;{message}&quot;
      </div>
    </div>
  );
}

// ─── Main ───
interface ResultRevealProps {
  score: number;
  onDone?: () => void;
}

export function ResultReveal({ score, onDone }: ResultRevealProps) {
  const tierKey = scoreToTier(score);
  const tier = TIERS[tierKey];
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const seed = useMemo(
    () => (tierKey.charCodeAt(0) * 31 + finalScore * 13) | 0,
    [tierKey, finalScore]
  );

  const steps = tier.promoteSteps;
  const hasStep1 = steps.length >= 1;
  const hasStep2 = steps.length >= 2;

  const CHARGE = 900;
  const BASE = 1100;
  const PROMOTE1 = 500;
  const MID_TIER = hasStep2 ? 1800 : 2500;
  const PROMOTE2 = hasStep2 ? 600 : 0;
  const FINAL_TIER = hasStep2 ? 2100 : 0;
  const FADE = 600;

  const B1 = CHARGE;
  const B2 = B1 + BASE;
  const B3 = B2 + (hasStep1 ? PROMOTE1 : 0);
  const B4 = B3 + (hasStep1 ? MID_TIER : 0);
  const B5 = B4 + (hasStep2 ? PROMOTE2 : 0);
  const B6 = B5 + (hasStep2 ? FINAL_TIER : 0);
  const HOLD_START = B6;

  const [time, setTime] = useState(0);
  const [closing, setClosing] = useState(false);
  const closeStartRef = useRef<number | null>(null);

  useEffect(() => {
    const startTs = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - startTs;
      // hold 시작에 도달하면 거기서 멈춤 — 사용자 클릭 대기
      setTime(Math.min(elapsed, HOLD_START));
    }, 33);
    return () => clearInterval(id);
  }, [HOLD_START]);

  // close 트리거: 클릭 후 FADE ms 동안 페이드 → onDone
  const [fadeT, setFadeT] = useState(0);
  useEffect(() => {
    if (!closing) return;
    closeStartRef.current = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - (closeStartRef.current ?? 0);
      const t = Math.min(1, elapsed / FADE);
      setFadeT(t);
      if (t >= 1) {
        clearInterval(id);
        onDone?.();
      }
    }, 33);
    return () => clearInterval(id);
  }, [closing, FADE, onDone]);

  // ─── phase 결정 ───
  let phase:
    | "charge"
    | "base"
    | "promote1"
    | "midTier"
    | "promote2"
    | "finalTier"
    | "hold";
  let phaseT: number;
  if (time < B1) {
    phase = "charge";
    phaseT = time / CHARGE;
  } else if (time < B2) {
    phase = "base";
    phaseT = (time - B1) / BASE;
  } else if (time < B3) {
    phase = "promote1";
    phaseT = (time - B2) / PROMOTE1;
  } else if (time < B4) {
    phase = "midTier";
    phaseT = (time - B3) / MID_TIER;
  } else if (time < B5) {
    phase = "promote2";
    phaseT = (time - B4) / PROMOTE2;
  } else if (time < B6) {
    phase = "finalTier";
    phaseT = (time - B5) / FINAL_TIER;
  } else {
    phase = "hold";
    phaseT = 0;
  }

  // 색상/효과
  let curColors = C_GRAY;
  let curSub = "NORMAL";
  let fxStep: TierStep | null = null;

  if (phase === "charge" || phase === "base") {
    curColors = C_GRAY;
    curSub = "NORMAL";
  } else if (phase === "promote1") {
    curColors = steps[0]?.toColors ?? C_GRAY;
    curSub = steps[0]?.sub ?? "NORMAL";
    fxStep = steps[0] ?? null;
  } else if (phase === "midTier") {
    curColors = steps[0]!.toColors;
    curSub = steps[0]!.sub;
    fxStep = steps[0]!;
  } else if (phase === "promote2") {
    curColors = steps[1]!.toColors;
    curSub = steps[1]!.sub;
    fxStep = phaseT > 0.3 ? steps[1]! : steps[0]!;
  } else if (phase === "finalTier" || phase === "hold") {
    const last = steps[steps.length - 1];
    if (last) {
      curColors = last.toColors;
      curSub = last.sub;
      fxStep = last;
    }
  }

  // 카메라 쉐이크 (sin 기반)
  let shakeX = 0;
  let shakeY = 0;
  const applyShake = (amt: number) => {
    shakeX = Math.sin(time / 22) * amt;
    shakeY = Math.cos(time / 27) * amt * 0.7;
  };
  if (phase === "promote1") {
    const s = steps[0]?.shake ?? 0;
    const amt = s * (phaseT < 0.3 ? phaseT / 0.3 : 1 - (phaseT - 0.3) / 0.7);
    applyShake(amt);
  } else if (phase === "promote2") {
    const s = steps[1]?.shake ?? 0;
    const amt = s * (phaseT < 0.3 ? phaseT / 0.3 : 1 - (phaseT - 0.3) / 0.7);
    applyShake(amt);
  } else if (phase === "midTier" && hasStep2 && phaseT > 0.75) {
    applyShake(((phaseT - 0.75) / 0.25) * 1.5);
  }

  // 하트 스케일
  let heartScale = 0;
  let heartShow = false;
  const beat = time;
  let beatScale = 1;
  if (phase === "base") {
    heartShow = true;
    const eT = Math.min(1, phaseT / 0.45);
    heartScale =
      eT < 0.7
        ? Math.pow(eT / 0.7, 2) * 1.15
        : 1.15 - Math.sin(((eT - 0.7) / 0.3) * Math.PI) * 0.15;
    beatScale = 1 + Math.sin(beat / 260) * 0.025;
  } else if (phase === "promote1" || phase === "promote2") {
    heartShow = true;
    if (phaseT < 0.3) heartScale = 1 + (phaseT / 0.3) * 0.55;
    else heartScale = 1.55 - ((phaseT - 0.3) / 0.7) * 0.4;
    beatScale = 1 + Math.sin(beat / 150) * 0.04;
  } else if (phase === "midTier") {
    heartShow = true;
    if (phaseT < 0.1) heartScale = 1.15 - (phaseT / 0.1) * 0.15;
    else if (hasStep2 && phaseT > 0.8)
      heartScale = 1 - ((phaseT - 0.8) / 0.2) * 0.08;
    else heartScale = 1;
    beatScale = 1 + Math.sin(beat / 220) * 0.04;
  } else if (phase === "finalTier" || phase === "hold") {
    heartShow = true;
    if (phase === "finalTier" && phaseT < 0.1) {
      heartScale = 1.15 - (phaseT / 0.1) * 0.15;
    } else {
      heartScale = 1;
    }
    beatScale = 1 + Math.sin(beat / 220) * 0.04;
  }

  // 점수 보간 (S자 누적)
  const scoreAnimEnd = HOLD_START;
  const scoreAnimStart = B1;
  const globalT = Math.max(
    0,
    Math.min(1, (time - scoreAnimStart) / (scoreAnimEnd - scoreAnimStart))
  );
  const easedG = 1 - Math.pow(1 - globalT, 3);
  function burstEase(t: number, pivots: number[]) {
    let v = 0;
    for (const p of pivots) {
      const k = 10;
      v += 1 / (1 + Math.exp(-k * (t - p)));
    }
    return v / pivots.length;
  }
  const pivots = !hasStep2 ? [0.55] : [0.35, 0.72];
  const burstT =
    tierKey === "normal" ? easedG : burstEase(globalT, pivots);
  const scoreValue = tier.baseScore + (finalScore - tier.baseScore) * burstT;

  let scoreOpacity = 0;
  if (phase === "charge") scoreOpacity = 0;
  else if (phase === "base") scoreOpacity = Math.min(1, (phaseT - 0.3) / 0.3);
  else scoreOpacity = 1;

  // INSTANT TIER SWAP
  let preFlashBoost = 0;
  let whiteFlashOpacity = 0;
  if (tierKey !== "normal") {
    if (hasStep1 && phase === "base" && phaseT > 0.91) {
      preFlashBoost = (phaseT - 0.91) / 0.09;
    }
    if (hasStep2 && phase === "midTier" && phaseT > 0.94) {
      preFlashBoost = (phaseT - 0.94) / 0.06;
    }
    if (phase === "promote1") {
      const elapsedMs = phaseT * PROMOTE1;
      whiteFlashOpacity =
        elapsedMs < 80
          ? elapsedMs / 80
          : Math.max(0, 1 - (elapsedMs - 80) / 620);
    } else if (phase === "promote2") {
      const elapsedMs = phaseT * PROMOTE2;
      whiteFlashOpacity =
        elapsedMs < 60
          ? elapsedMs / 60
          : Math.max(0, 1 - (elapsedMs - 60) / 840);
    }
  }

  // 글로벌 페이드 (close 트리거 시)
  let globalOpacity = 1;
  if (closing) globalOpacity = 1 - fadeT;
  else if (phase === "charge") globalOpacity = Math.min(1, phaseT * 2);

  // ray/glow strength
  let rayStrength = 0;
  let glowStrength = 0;
  let rayTone = 0;
  if (heartShow) {
    if (tierKey === "normal") {
      const eT = phase === "base" ? Math.min(1, phaseT * 1.4) : 1;
      rayStrength = 0.22 * eT;
      glowStrength = 0.45 * eT;
      rayTone = 0;
    } else if (tierKey === "rare") {
      if (curSub === "NORMAL") {
        rayStrength = 0.22;
        glowStrength = 0.45;
        rayTone = 0;
      } else {
        rayStrength = 0.75;
        glowStrength = 0.9;
        rayTone = 1.0;
      }
      if (phase === "promote1")
        rayStrength *= 1 + Math.sin(phaseT * Math.PI) * 0.4;
    } else {
      if (curSub === "NORMAL") {
        rayStrength = 0.22;
        glowStrength = 0.45;
        rayTone = 0;
      } else if (curSub === "RARE") {
        rayStrength = 0.85;
        glowStrength = 1.05;
        rayTone = 0.55;
      } else {
        rayStrength = 1.35;
        glowStrength = 1.3;
        rayTone = 1.0;
      }
      if (phase === "promote1" || phase === "promote2") {
        rayStrength *= 1 + Math.sin(phaseT * Math.PI) * 0.5;
      }
      if (phase === "finalTier" && phaseT < 0.3) {
        rayStrength *= 1 + (1 - phaseT / 0.3) * 0.4;
      }
    }
  }
  // GLOBAL DIM ×0.6 (handoff: 광량 -40% 톤다운)
  rayStrength *= 0.6;
  glowStrength *= 0.6;

  // bloom filter
  let bloomFilter = "none";
  if (heartShow) {
    let bright = 1.04;
    let cont = 1.04;
    let sat = 1.0;
    if (curSub === "RARE") {
      bright = 1.15;
      cont = 1.1;
      sat = 1.15;
    } else if (curSub === "LEGENDARY") {
      bright = 1.25;
      cont = 1.15;
      sat = 1.3;
    }
    bright += 0.2 * preFlashBoost;
    bloomFilter = `brightness(${bright.toFixed(3)}) contrast(${cont.toFixed(
      3
    )}) saturate(${sat.toFixed(3)})`;
  }

  // 라벨 노출 조건
  const showName =
    (phase === "base" && tierKey === "normal" && phaseT > 0.6) ||
    (phase === "midTier" && !hasStep2 && phaseT > 0.2) ||
    phase === "finalTier" ||
    phase === "hold";

  // bg 비네트
  let bgOpacity = 0;
  if (phase === "charge") bgOpacity = 0.08 + phaseT * 0.15;
  else if (phase === "base") bgOpacity = 0.2 - phaseT * 0.1;
  else if (phase === "promote1") bgOpacity = 0.15 - phaseT * 0.15;
  else if (phase === "midTier") {
    if (hasStep2)
      bgOpacity = phaseT < 0.6 ? 0 : ((phaseT - 0.6) / 0.4) * 0.2;
    else bgOpacity = 0;
  } else if (phase === "promote2") bgOpacity = 0.2 - phaseT * 0.2;

  // cream intro/outro (앞뒤 화면이랑 자연스럽게 잇기)
  let creamOpacity = 0;
  if (phase === "charge") {
    creamOpacity = Math.max(0, 1 - phaseT / 0.45);
  }
  // closing 시작되면 다시 크림으로 페이드 인
  if (closing) {
    creamOpacity = Math.max(creamOpacity, fadeT);
  }

  return (
    <div
      onClick={() => {
        if (phase === "hold" && !closing) setClosing(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (
          phase === "hold" &&
          !closing &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          setClosing(true);
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#000000",
        overflow: "hidden",
        cursor: phase === "hold" && !closing ? "pointer" : "default",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          opacity: globalOpacity,
          filter: bloomFilter,
          transition: "filter 1000ms ease",
        }}
      >
        <Starfield beat={beat} seed={seed} />
        {tierKey !== "normal" && phase !== "charge" && (
          <BokehBackground
            beat={beat}
            colors={curColors}
            intensity={phase === "base" ? phaseT : 1}
            seed={seed}
          />
        )}

        {phase === "promote2" && hasStep2 && phaseT < 0.18 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 50%), rgba(20,16,12,0.35)",
              backdropFilter: "blur(2px)",
              opacity: phaseT < 0.12 ? 1 : 1 - (phaseT - 0.12) / 0.06,
              zIndex: 50,
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)`,
            opacity: bgOpacity,
            pointerEvents: "none",
            transition: "opacity 80ms linear",
          }}
        />

        {phase === "charge" && (
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "'Noto Serif KR', serif",
              fontSize: 13,
              color: "#E8E4DD",
              letterSpacing: "0.2em",
              opacity: 0.7 + Math.sin(time / 180) * 0.3,
              pointerEvents: "none",
            }}
          >
            마음 측정 중
            <span style={{ opacity: phaseT > 0.33 ? 1 : 0 }}>.</span>
            <span style={{ opacity: phaseT > 0.66 ? 1 : 0 }}>.</span>
            <span style={{ opacity: phaseT > 0.9 ? 1 : 0 }}>.</span>
          </div>
        )}

        {phase === "charge" && (
          <>
            <ChargeParticles t={phaseT} beat={beat} />
            <ChargeCore t={phaseT} />
          </>
        )}

        {phase === "promote1" && hasStep1 && (
          <>
            <PromoteRings
              t={phaseT}
              colors={steps[0]!.toColors}
              strength={1}
            />
            <PromoteFlash
              t={phaseT}
              colors={steps[0]!.toColors}
              alpha={steps[0]!.flashAlpha * 0.7}
            />
          </>
        )}

        {phase === "promote2" && hasStep2 && (
          <>
            <PromoteRings
              t={phaseT}
              colors={steps[1]!.toColors}
              strength={1.25}
            />
            <PromoteFlash
              t={phaseT}
              colors={steps[1]!.toColors}
              alpha={steps[1]!.flashAlpha * 0.75}
            />
          </>
        )}

        {fxStep && (
          <>
            <TierBeams
              t={
                phase === "midTier"
                  ? Math.min(1, phaseT * 1.5)
                  : phase === "finalTier"
                  ? Math.min(1, phaseT * 2)
                  : 1
              }
              colors={curColors}
              count={fxStep.beamCount}
              beat={beat}
              widthPx={fxStep.beamWidth}
              lenPx={fxStep.beamLen}
              intensity={fxStep.beamIntensity * 0.6}
            />
            <SparkleParticles
              t={
                phase === "midTier"
                  ? Math.min(1, phaseT * 1.3)
                  : phase === "finalTier"
                  ? Math.min(1, phaseT * 1.8)
                  : 1
              }
              colors={curColors}
              count={fxStep.particleCount}
              beat={beat}
              seed={seed + (phase === "finalTier" ? 99 : 0)}
            />
          </>
        )}

        {heartShow && (
          <>
            <HaloBackdrop
              strength={glowStrength}
              beat={beat}
              accentColor={curColors.color}
              tone={rayTone}
              seed={seed}
            />
            <CoreHeart
              scale={heartScale * beatScale}
              colors={curColors}
              subId={`${tierKey}-${curSub}-${seed}`}
            />
          </>
        )}

        {(phase === "promote1" || phase === "promote2") && (
          <StarburstSparkles
            t={phaseT}
            colors={curColors}
            count={phase === "promote2" ? 6 : 4}
            seed={seed + (phase === "promote2" ? 333 : 111)}
          />
        )}

        {scoreOpacity > 0 && (
          <ScoreDisplay
            value={scoreValue}
            colors={curColors}
            opacity={scoreOpacity}
            isLegendary={curSub === "LEGENDARY"}
          />
        )}

        <TierName
          show={showName}
          colors={curColors}
          name={tier.name}
          message={tier.message}
        />

        {phase === "hold" && !closing && (
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 11,
              color: "#C4BFB4",
              letterSpacing: "0.15em",
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 50,
              animation: "gachaHintPulse 2s ease-in-out infinite",
            }}
          >
            터치하면 결과 자세히 보기
          </div>
        )}

        {whiteFlashOpacity > 0.001 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#FFFFFF",
              opacity: whiteFlashOpacity,
              mixBlendMode: "screen",
              pointerEvents: "none",
              zIndex: 90,
            }}
          />
        )}
      </div>

      {creamOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#F4EFE6",
            opacity: creamOpacity,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gachaHintPulse {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 0.85; }
            }
          `,
        }}
      />
    </div>
  );
}
