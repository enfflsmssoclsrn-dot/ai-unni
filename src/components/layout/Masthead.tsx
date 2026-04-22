import Link from "next/link";
import type { ReactNode } from "react";

export interface MastheadProps {
  nav?: ReactNode;
}

export function Masthead({ nav }: MastheadProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
        <Link
          href="/"
          className="font-serif text-[22px] font-bold leading-none tracking-tight"
        >
          AI <span className="text-primary">냥이</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink/80">
          {nav ?? <DefaultNav />}
        </nav>
      </div>
    </header>
  );
}

function DefaultNav() {
  return (
    <Link href="/#pricing" className="hover:text-ink">
      프리미엄
    </Link>
  );
}
