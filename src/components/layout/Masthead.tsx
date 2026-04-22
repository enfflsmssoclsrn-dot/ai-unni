import Link from "next/link";
import { NyangHead } from "@/components/nyang-icons";

export function Masthead() {
  return (
    <header className="bg-bg">
      <div className="mx-auto flex max-w-[420px] items-center justify-between px-[22px] pt-14 pb-3">
        <Link href="/" className="flex items-center gap-[7px]">
          <NyangHead size={22} />
          <span
            className="whitespace-nowrap text-[17px] font-medium leading-none tracking-[-0.3px]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            AI 냥이
          </span>
        </Link>
        <span className="font-mono text-[9px] tracking-[1.5px] text-sub">
          ISSUE · 026
        </span>
      </div>
      <div className="mx-[22px] h-px bg-ink/50" />
    </header>
  );
}
