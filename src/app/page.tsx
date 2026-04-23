import Link from "next/link";
import { Masthead } from "@/components/layout/Masthead";
import { BtnPrimary } from "@/components/ui/BtnPrimary";
import { NyangHead, NyangEyes } from "@/components/nyang-icons";

export default function Home() {
  return (
    <>
      <Masthead />
      <main className="min-h-screen bg-bg text-ink">
        <div className="mx-auto max-w-[420px]">
          <HeroSection />
          <DashedDivider />
          <HowItWorksSection />
          <DashedDivider />
          <SampleReportSection />
          <TestimonialsSection />
          <FaqSection />
          <FinalCTASection />
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function DashedDivider() {
  return <div className="mx-[22px] h-px bg-ink opacity-[0.28]" />;
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

// ─── Sections ────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative px-[22px] pt-[26px] pb-[10px]">
      <div className="mb-3 flex items-center gap-[10px]">
        <span className="text-[10px] font-bold tracking-[2.5px] text-primary-deep">
          — COVER STORY
        </span>
        <span className="font-script text-[18px] leading-none text-sub">
          no.026
        </span>
      </div>
      <h1 className="relative m-0 font-serif text-[46px] font-light leading-[1.0] tracking-[-1.7px] text-ink">
        대화 캡쳐
        <br />
        한 장이면
        <br />
        <em className="font-medium not-italic">걔 속마음</em>이
        <br />
        보인다냥.
        <span className="absolute -top-2 right-[6px] rotate-[12deg]">
          <NyangHead size={46} />
        </span>
      </h1>
      <div className="mt-5 inline-flex items-center gap-[10px] rounded-full bg-bg-alt py-[10px] pl-[10px] pr-[14px]">
        <NyangHead size={28} />
        <span className="font-script text-[18px] leading-none text-ink">
          by 연애박사 냥이
        </span>
      </div>
      <p className="mx-0 mb-[10px] mt-5 max-w-[320px] text-[14px] leading-[1.7] text-sub">
        길게 설명 안 해도 돼. 카톡·인스타 DM·문자 어디서든 캡처만 올리면, 말투와
        텀, 애매한 표현, 거리감까지 — 냥이가 대신 읽어줄게.
      </p>
      <div className="pb-6 pt-4">
        <Link href="/analyze" className="block">
          <BtnPrimary size="lg" className="w-full justify-center">
            지금 분석 시작하기 →
          </BtnPrimary>
        </Link>
        <div className="mt-3 text-center font-mono text-[9px] tracking-[2px] text-sub">
          GOTTMAN · ATTACHMENT · AI
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: "01", t: "캡처 업로드", d: "카톡·DM·문자 — 형식 상관없어" },
    { n: "02", t: "말투와 텀 분석", d: "답장 속도, 단답·장문, 이모지, 회피 표현" },
    { n: "03", t: "호감도 + 애착 유형", d: "Gottman 4대 위험 신호 · 애착 이론 기반" },
    { n: "04", t: "이런 멘트 보내봐", d: "상황 맞춤 답장 멘트까지 골라줘" },
  ];
  return (
    <section className="relative">
      <div className="relative px-[22px] pt-6 pb-3">
        <SectionHeader num="01" label="작동 방식" title="이렇게 분석한다냥" />
        <div className="absolute right-5 top-12 rotate-[8deg]">
          <NyangEyes size={30} color="var(--color-primary)" />
        </div>
      </div>
      <div className="px-[22px] pb-[18px]">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`flex gap-[14px] py-[14px] ${i < 3 ? "border-b border-line" : ""}`}
          >
            <div className="w-7 shrink-0 pt-1 font-mono text-[11px] tracking-[1px] text-primary-deep">
              {s.n}
            </div>
            <div className="flex-1">
              <div className="mb-1 text-[15px] font-semibold tracking-[-0.3px] text-ink">
                {s.t}
              </div>
              <div className="text-[13px] leading-[1.5] text-sub">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SampleReportSection() {
  const horsemen = [
    { k: "비난", v: 10, s: "안전" },
    { k: "방어", v: 15, s: "안전" },
    { k: "경멸", v: 5, s: "안전" },
    { k: "담쌓기", v: 30, s: "양호" },
  ];
  const attach = ["회피형", "혼합형", "안정형", "불안형"];
  const radar = [85, 60, 40, 55, 75, 30];
  return (
    <section className="relative px-[22px] pt-6 pb-4">
      <div className="mb-3">
        <SectionHeader num="02" label="샘플 리포트" title="이렇게 나온다냥" />
      </div>
      <div className="relative overflow-hidden rounded-[14px] border border-line bg-bg-alt p-5 shadow-[0_4px_24px_rgba(26,23,20,0.06)]">
        {/* Score hero */}
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[10px] tracking-[2px] text-sub">
            호감도 점수
          </div>
          <div className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.5px] text-primary-deep">
            SAMPLE
          </div>
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <div className="font-serif text-[80px] font-light leading-none tracking-[-3px] text-ink">
            58
          </div>
          <div className="font-mono text-[11px] tracking-[1.5px] text-sub">
            / 100
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-bg">
            ✨ 호감
          </span>
          <span className="rounded-full border border-ink px-3 py-1 text-[11px] font-bold text-ink">
            🌤 미지근
          </span>
        </div>

        <div className="mt-3 font-serif text-[17px] italic leading-[1.35] text-ink">
          &ldquo;걔 발만 살짝 걸쳐놨다냥.&rdquo;
        </div>

        <div className="my-5 h-px bg-ink/15" />

        <div className="mb-2 font-mono text-[10px] font-bold tracking-[2px] text-sub">
          관계 위험 신호 · Gottman 4
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {horsemen.map((h) => (
            <div
              key={h.k}
              className="rounded-md border border-line bg-bg px-3 py-2.5"
            >
              <div className="text-[10px] font-semibold tracking-[0.5px] text-sub">
                {h.s}
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-serif text-[22px] font-medium tracking-[-0.5px] text-ink">
                  {h.v}
                </span>
                <span className="text-[12px] font-semibold text-ink">
                  {h.k}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-ink/15" />

        <div className="mb-2 font-mono text-[10px] font-bold tracking-[2px] text-sub">
          상대방 애착 유형
        </div>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {attach.map((n, i) => (
            <span
              key={n}
              className={
                i === 3
                  ? "rounded-full bg-ink px-3 py-0.5 text-[11px] font-semibold text-bg"
                  : "rounded-full border border-line px-3 py-0.5 text-[11px] font-semibold text-sub"
              }
            >
              {n}
            </span>
          ))}
        </div>
        <div className="font-serif text-[24px] font-medium leading-tight tracking-[-0.5px] text-ink">
          불안형{" "}
          <span className="font-mono text-[11px] font-bold tracking-[1px] text-primary-deep">
            회피 ↑
          </span>
        </div>

        {/* Premium teaser — 실제 결과 프리뷰 */}
        <div className="relative mt-5 overflow-hidden rounded-[12px] bg-ink p-5 text-bg">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-mono text-[9px] font-bold tracking-[2px] text-bg/70">
              🔒 프리미엄에서 풀려
            </div>
            <div className="font-mono text-[9px] font-bold tracking-[1.5px] text-primary">
              PREMIUM
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
              <g transform="translate(64 64)">
                {[0.25, 0.5, 0.75, 1].map((r) => {
                  const pts = Array.from({ length: 6 })
                    .map((_, i) => {
                      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                      return `${Math.cos(a) * 44 * r},${Math.sin(a) * 44 * r}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={r}
                      points={pts}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.18"
                      strokeWidth="0.75"
                    />
                  );
                })}
                {Array.from({ length: 6 }).map((_, i) => {
                  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1="0"
                      x2={Math.cos(a) * 44}
                      y2={Math.sin(a) * 44}
                      stroke="currentColor"
                      strokeOpacity="0.15"
                      strokeWidth="0.5"
                    />
                  );
                })}
                <polygon
                  points={radar
                    .map((v, i) => {
                      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                      const r = (v / 100) * 44;
                      return `${Math.cos(a) * r},${Math.sin(a) * r}`;
                    })
                    .join(" ")}
                  fill="var(--color-primary)"
                  fillOpacity="0.35"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {radar.map((v, i) => {
                  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  const r = (v / 100) * 44;
                  return (
                    <circle
                      key={i}
                      cx={Math.cos(a) * r}
                      cy={Math.sin(a) * r}
                      r="2"
                      fill="var(--color-primary)"
                    />
                  );
                })}
              </g>
            </svg>
            <div className="flex-1 text-[11px] leading-[1.55]">
              <div className="mb-1 font-mono text-[10px] font-bold tracking-[1.5px] text-bg">
                6축 호감도 레이더
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-bg/80">
                <span>관심 85</span>
                <span>반응 60</span>
                <span>적극 40</span>
                <span>일관 55</span>
                <span>친밀 75</span>
                <span>미래 30</span>
              </div>
            </div>
          </div>

          <div className="my-3 h-px bg-bg/15" />

          <div className="mb-3">
            <div className="mb-1.5 font-mono text-[10px] font-bold tracking-[1.5px] text-bg/70">
              💭 걔 속마음 번역
            </div>
            <div className="space-y-1 text-[12px] leading-[1.55]">
              <div className="font-serif italic text-bg">
                &ldquo;읽씹 늘면 관심 빠지는 중이야.&rdquo;
              </div>
              <div className="select-none font-serif italic text-bg/80 blur-[3px]">
                &ldquo;약속 미루기는 회피 신호다냥…&rdquo;
              </div>
            </div>
          </div>

          <div className="my-3 h-px bg-bg/15" />

          <div>
            <div className="mb-2 font-mono text-[10px] font-bold tracking-[1.5px] text-bg/70">
              💬 이런 멘트 보내봐
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-bg/40 px-2.5 py-0.5 text-[11px] font-medium text-bg">
                ㅋㅋ 담주 편해?
              </span>
              <span className="select-none rounded-full border border-bg/40 px-2.5 py-0.5 text-[11px] font-medium text-bg/80 blur-[3px]">
                편할 때 알려줘
              </span>
              <span className="select-none rounded-full border border-bg/40 px-2.5 py-0.5 text-[11px] font-medium text-bg/80 blur-[3px]">
                그래, 무리 말고
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-2 -top-2 rotate-[18deg] opacity-90">
            <NyangHead size={40} eyeColor="var(--color-primary)" />
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-3 -right-3 rotate-[14deg]">
          <NyangHead size={48} />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const items = [
    { q: "카톡만 봐도 상대가 어떤 사람인지 감이 와서 진짜 신기했음…", a: "수지, 27" },
    { q: "혼자 검열하다 지쳤는데 냥이가 짚어주니까 정리됨.", a: "현우, 31" },
    { q: "멘트 추천 그대로 썼는데 답장 퀄이 달라졌다;", a: "나연, 24" },
  ];
  return (
    <section className="px-[22px] pt-6 pb-3">
      <div className="mb-3">
        <SectionHeader num="03" label="먼저 써본 사람들" title="써본 사람들 한마디" />
      </div>
      {items.map((r, i) => (
        <div key={i} className="border-t border-line py-[16px]">
          <div className="mb-1.5 font-serif text-[16px] italic leading-[1.5] text-ink">
            &ldquo;{r.q}&rdquo;
          </div>
          <div className="font-mono text-[11px] tracking-[1px] text-sub">
            — {r.a}
          </div>
        </div>
      ))}
    </section>
  );
}

function FaqSection() {
  const items = [
    { q: "내 대화가 저장돼?", a: "무료 분석은 DB에 저장 안 해. 유료는 결제·분석 기록만 30일 보관하고 자동 파기된다냥." },
    { q: "결과 정확해?", a: "애착이론 + Gottman + AI. 단, 참고용이야." },
    { q: "꼭 카톡이어야 해?", a: "DM · 문자 · 노션 메모 다 된다냥." },
  ];
  return (
    <section className="mt-2 border-t border-line px-[22px] pt-6 pb-3">
      <div className="mb-3">
        <SectionHeader num="04" label="FAQ" title="자주 묻는 질문" />
      </div>
      {items.map((f, i) => (
        <details key={i} className="border-b border-line py-[14px]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold tracking-[-0.3px] text-ink">
            <span>{f.q}</span>
            <span className="text-sub">+</span>
          </summary>
          <div className="mt-2 text-[13px] leading-[1.6] text-sub">{f.a}</div>
        </details>
      ))}
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="relative px-[22px] pt-6 pb-6">
      <div className="relative overflow-hidden rounded-md bg-ink p-[22px] text-bg">
        <div className="mb-2 font-mono text-[10px] tracking-[2px] opacity-60">
          — READY?
        </div>
        <div className="mb-4 max-w-[260px] font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.6px]">
          혼자 고민하지 말라냥.
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 rounded-full bg-bg px-5 py-3 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          지금 분석 시작하기 →
        </Link>
        <div className="absolute -top-1.5 -right-1.5 rotate-[18deg]">
          <NyangHead size={54} eyeColor="var(--color-primary)" />
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line">
      <div className="mx-auto max-w-[420px] px-[22px] py-8 text-[11px] leading-[1.7] text-sub">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/terms" className="font-semibold text-ink hover:underline">
            이용약관
          </Link>
          <span className="text-sub/40">·</span>
          <Link href="/privacy" className="font-semibold text-ink hover:underline">
            개인정보처리방침
          </Link>
          <span className="text-sub/40">·</span>
          <Link href="/refund" className="font-semibold text-ink hover:underline">
            환불정책
          </Link>
        </div>
        <div className="text-[10.5px] leading-[1.75] text-sub/80">
          <div>상호: 주니랩스튜디오 | 대표자: 김경은</div>
          <div>
            사업자등록번호: 875-56-01088 | 통신판매업신고번호:
            [제0000-지역-0000호]
          </div>
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
