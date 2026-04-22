'use client';

import * as React from 'react';

// =============================================================
// NyangMascot — AI 냥이 브랜드 마스코트
// =============================================================
// 사용 예:
//   <NyangMascot pose="waving" size={180} />
//   <NyangMascot pose="thinking" loop />
//
// pose 종류:
//   - 'happy'    : 기본 웃는 얼굴
//   - 'waving'   : 손 흔드는 랜딩용
//   - 'thinking' : 분석중 (loop=true면 회전 애니메이션)
//   - 'sleeping' : 빈 상태 / 준비중
//   - 'shocked'  : 레드플래그 강조
//   - 'peek'     : 구석에서 빼꼼
// =============================================================

export type NyangPose = 'happy' | 'waving' | 'thinking' | 'sleeping' | 'shocked' | 'peek';

export interface NyangMascotProps {
  pose?: NyangPose;
  size?: number;
  className?: string;
  loop?: boolean; // thinking pose에 회전 애니메이션
}

export function NyangMascot({
  pose = 'happy',
  size = 120,
  className,
  loop = false,
}: NyangMascotProps) {
  const rotating = loop && pose === 'thinking';

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        animation: rotating ? 'nyang-spin 3s linear infinite' : undefined,
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label={`냥이 ${pose}`}>
        <defs>
          <radialGradient id="nyang-body" cx="0.35" cy="0.35">
            <stop offset="0%" stopColor="#3A342E" />
            <stop offset="100%" stopColor="#1A1714" />
          </radialGradient>
        </defs>

        {/* Body */}
        <ellipse cx="100" cy="120" rx="68" ry="62" fill="url(#nyang-body)" />

        {/* Ears */}
        <path d="M42 70 L52 30 L78 62 Z" fill="#1A1714" />
        <path d="M158 70 L148 30 L122 62 Z" fill="#1A1714" />
        <path d="M50 62 L56 44 L68 58 Z" fill="#D97557" opacity="0.85" />
        <path d="M150 62 L144 44 L132 58 Z" fill="#D97557" opacity="0.85" />

        {/* Face per pose */}
        {renderFace(pose)}

        {/* Accent — waving paw */}
        {pose === 'waving' && (
          <g>
            <ellipse cx="168" cy="100" rx="14" ry="18" fill="#1A1714" transform="rotate(-20 168 100)">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-30 168 100; 0 168 100; -30 168 100"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        )}
      </svg>

      <style>{`
        @keyframes nyang-spin {
          from { transform: rotate(-6deg); }
          50%  { transform: rotate(6deg); }
          to   { transform: rotate(-6deg); }
        }
      `}</style>
    </div>
  );
}

function renderFace(pose: NyangPose) {
  switch (pose) {
    case 'happy':
    case 'waving':
    case 'peek':
      return (
        <g fill="#F4EFE6">
          <circle cx="78" cy="108" r="5" />
          <circle cx="122" cy="108" r="5" />
          <path d="M88 130 Q100 138 112 130" stroke="#F4EFE6" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* blush */}
          <circle cx="68" cy="124" r="6" fill="#D97557" opacity="0.5" />
          <circle cx="132" cy="124" r="6" fill="#D97557" opacity="0.5" />
        </g>
      );
    case 'thinking':
      return (
        <g fill="#F4EFE6">
          <ellipse cx="78" cy="108" rx="5" ry="3" />
          <ellipse cx="122" cy="108" rx="5" ry="3" />
          <path d="M90 132 L110 132" stroke="#F4EFE6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="150" cy="70" r="6" fill="#F4EFE6" opacity="0.9" />
          <circle cx="162" cy="56" r="4" fill="#F4EFE6" opacity="0.7" />
          <circle cx="172" cy="46" r="3" fill="#F4EFE6" opacity="0.5" />
        </g>
      );
    case 'sleeping':
      return (
        <g fill="#F4EFE6">
          <path d="M72 108 Q78 104 84 108" stroke="#F4EFE6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M116 108 Q122 104 128 108" stroke="#F4EFE6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M90 132 Q100 136 110 132" stroke="#F4EFE6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <text x="140" y="72" fontSize="18" fill="#F4EFE6" fontFamily="serif" fontStyle="italic">z</text>
          <text x="154" y="58" fontSize="14" fill="#F4EFE6" fontFamily="serif" fontStyle="italic" opacity="0.7">z</text>
        </g>
      );
    case 'shocked':
      return (
        <g fill="#F4EFE6">
          <circle cx="78" cy="108" r="6" />
          <circle cx="122" cy="108" r="6" />
          <circle cx="78" cy="108" r="2.5" fill="#1A1714" />
          <circle cx="122" cy="108" r="2.5" fill="#1A1714" />
          <ellipse cx="100" cy="138" rx="6" ry="8" fill="#1A1714" stroke="#F4EFE6" strokeWidth="2.5" />
        </g>
      );
  }
}

export default NyangMascot;
