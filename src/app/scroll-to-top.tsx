"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// 모든 페이지 전환(라우트 변경) 시 스크롤을 최상단으로 즉시 이동.
// layout.tsx 에서 <ScrollToTop /> 으로 삽입.
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
