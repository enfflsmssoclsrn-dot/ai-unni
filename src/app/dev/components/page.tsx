import { BtnPrimary } from "@/components/ui/BtnPrimary";
import { BtnGhost } from "@/components/ui/BtnGhost";
import { PastelBG } from "@/components/ui/PastelBG";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Masthead } from "@/components/layout/Masthead";
import { NyangMascot } from "@/components/NyangMascot";

export default function DevComponentsPage() {
  const poses = [
    "happy",
    "waving",
    "thinking",
    "sleeping",
    "shocked",
    "peek",
  ] as const;

  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="mb-10">
          <Eyebrow>DEV · PREVIEW</Eyebrow>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-[-0.02em]">
            Component Library
          </h1>
          <p className="mt-2 text-sub">
            리디자인 컴포넌트 시각 확인용. 머지 전 참고용 페이지.
          </p>
        </div>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <BtnPrimary size="md">분석 시작</BtnPrimary>
            <BtnPrimary size="lg">카톡 분석 시작 →</BtnPrimary>
            <BtnGhost size="md">샘플 보기</BtnGhost>
            <BtnGhost size="lg">샘플 결과 보기</BtnGhost>
            <BtnPrimary disabled>Disabled</BtnPrimary>
          </div>
        </Section>

        <Section title="Eyebrow">
          <div className="flex flex-wrap gap-3">
            <Eyebrow>ISSUE · 026</Eyebrow>
            <Eyebrow>HOGAM SCORE</Eyebrow>
            <Eyebrow>COMING SOON</Eyebrow>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h3 className="font-serif text-xl font-bold">Plain Card</h3>
              <p className="mt-2 text-sm text-sub">
                기본 흰 배경 카드. 본문·결과 섹션에서 주로 사용.
              </p>
            </Card>
            <Card variant="alt">
              <h3 className="font-serif text-xl font-bold">Alt Card</h3>
              <p className="mt-2 text-sm text-sub">
                크림 알트 배경. 서브 섹션·툴팁 박스 등에 사용.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-3">
            <p className="font-serif text-5xl font-bold tracking-[-0.02em]">
              Fraunces Serif 64
            </p>
            <p className="font-serif text-4xl font-semibold italic text-primary">
              진짜로 좋아할까?
            </p>
            <p className="text-lg text-ink">
              Pretendard Sans — 본문 16px 기본. 가볍고 다정한 친구처럼.
            </p>
            <p className="text-sm text-sub">
              보조 텍스트 14px — sub 컬러.
            </p>
            <p className="font-script text-3xl text-primary">
              a little nudge — Caveat script
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              mono · caption · 12px
            </p>
          </div>
        </Section>

        <Section title="Nyang Mascot — 6 Poses">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {poses.map((pose) => (
              <div
                key={pose}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-line bg-bg-alt p-4"
              >
                <NyangMascot
                  pose={pose}
                  size={96}
                  loop={pose === "thinking"}
                />
                <span className="font-mono text-[11px] uppercase tracking-widest text-sub">
                  {pose}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="PastelBG">
          <div className="relative h-[320px] overflow-hidden rounded-[var(--radius-lg)] border border-line">
            <PastelBG />
            <div className="relative flex h-full items-center justify-center">
              <p className="font-serif text-3xl font-bold">
                Pastel gradient background
              </p>
            </div>
          </div>
        </Section>

        <Section title="Masthead (상단 고정됨 — 이 페이지 맨 위 확인)">
          <p className="text-sm text-sub">
            페이지 상단에 이미 렌더링되어 있음. 스크롤해도 sticky + backdrop
            blur 동작하는지 확인.
          </p>
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-serif text-2xl font-bold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}
