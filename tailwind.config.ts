import type { Config } from "tailwindcss";

// UPDATE-typography.md §4 — 냥이체 4종 Tailwind 연동
// Tailwind v4 기준 프로젝트라 globals.css @theme 블록이 주 설정이지만,
// 동일 매핑을 JS 컨피그에도 명시해 다른 툴/IDE의 자동완성·타입 추론에 활용.
// @config 디렉티브로 globals.css에서 참조함.
export default {
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
        script: ["var(--font-script)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
} satisfies Config;
