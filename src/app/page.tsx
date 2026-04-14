"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ─── Situation Chips ───
const CHIPS = [
  { emoji: "💘", label: "썸 타는 중", prompt: "지금 썸 타는 사람이 있는데, " },
  { emoji: "💑", label: "사귀는 중인데 불안해", prompt: "사귀고 있는데 요즘 좀 불안해. " },
  { emoji: "💔", label: "재회하고 싶어", prompt: "헤어진 사람이 있는데 다시 만나고 싶어. " },
  { emoji: "🤔", label: "이게 호감인지 모르겠어", prompt: "이 사람이 나한테 호감인 건지 잘 모르겠어. " },
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
      <text x="70" y="64" textAnchor="middle" fill="#2D2B3D"
        style={{ fontSize: 32, fontWeight: 800 }}>{n}</text>
      <text x="70" y="86" textAnchor="middle" fill="#8E8A9D"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1 }}>호감도</text>
    </svg>
  );
}

// ─── Badges ───
function StageBadge({ stage }: { stage: string }) {
  const m: Record<string, { e: string; bg: string; c: string }> = {
    "관심없음": { e: "😐", bg: "#F0F0F0", c: "#8E8A9D" },
    "예의": { e: "🙂", bg: "#EEF0FF", c: "#7B7FC4" },
    "호감": { e: "✨", bg: "#FFF4E6", c: "#E8956A" },
    "썸": { e: "💕", bg: "#FFF0F3", c: "#FF6B8A" },
    "연애직전": { e: "🔥", bg: "#FFE8EC", c: "#E8456A" },
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
      <div className="text-xs font-bold mb-3 tracking-wide" style={{ color: accent || "#8E8A9D" }}>{icon} {title}</div>
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

function BlurredSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] border border-[rgba(255,143,171,0.15)] shadow-[0_2px_20px_rgba(255,143,171,0.08)] p-5 mb-3 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold tracking-wide text-[#8E8A9D]">{icon} {title}</div>
      </div>
      <div className="relative">
        <div className="blur-[5px] pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(255,245,247,0.4)]">
          <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF6B8A] to-[#E8456A] text-white text-xs font-bold shadow-[0_4px_16px_rgba(255,107,138,0.2)]">
            🔓 잠금 해제
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Result Card ───
function ResultCard({ result, isPaid, onReset, onUnlock, unlocking }: any) {
  return (
    <div className="w-full max-w-[400px] mx-auto animate-fadeUp">
      {/* Score Header */}
      <div className="text-center mb-5 py-7 px-5 rounded-[24px] border border-[rgba(255,143,171,0.15)] shadow-[0_2px_20px_rgba(255,143,171,0.08)]"
        style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #fff 100%)" }}>
        <ScoreGauge score={result.score} />
        <div className="mt-2.5 flex justify-center gap-2 flex-wrap">
          {result.stage && <StageBadge stage={result.stage} />}
          <TempBadge temperature={result.temperature} />
        </div>
        <div className="mt-3.5 text-[15px] text-[#2D2B3D] font-bold leading-relaxed">
          &quot;{result.summary}&quot;
        </div>
      </div>

      {/* 진단 */}
      <SectionCard title="지금 너네 관계는" icon="🔍">
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
            <div className="text-xs font-bold mb-3.5 text-[#FF6B8A]">🎯 언니 말 들어, 이렇게 해봐</div>
            {result.actions?.map((a: string, i: number) => (
              <div key={i} className="flex gap-2.5 mb-2.5 items-start">
                <div className="w-[22px] h-[22px] rounded-full shrink-0 bg-[#FF6B8A] flex items-center justify-center text-[11px] font-bold text-white">
                  {i + 1}
                </div>
                <div className="text-sm text-[#2D2B3D] leading-[1.7]">{a}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <BlurredSection title="이 점수가 나온 이유" icon="💡">
            {["걔가 너한테 먼저 연락하는 날이 있다는 건 확실히 신경 쓰는 거거든?", "이모티콘을 이 정도로 쓴다는 건 대화가 편하다는 신호야", "네 일상에 관심 갖는 질문을 한다는 게 꽤 중요한 포인트야"].map((t, i) =>
              <BulletItem key={i} text={t} color="#FF6B8A" />)}
          </BlurredSection>

          <BlurredSection title="솔직히 좀 걸리는 부분" icon="⚠️">
            {["근데 만나자는 얘기를 네가 항상 먼저 한다는 게 좀 걸려...", "답장은 빠른데 대화를 길게 이어가려는 노력은 별로 없는 거 같아"].map((t, i) =>
              <BulletItem key={i} text={t} color="#FFB347" />)}
          </BlurredSection>

          <BlurredSection title="걔는 지금 이런 마음이야" icon="🧠">
            <div className="text-sm text-[#2D2B3D] leading-[1.8]">
              솔직히 걔는 너한테 호감은 있는데 아직 확신이 없는 상태인 거 같아. 부담스럽지 않은 선에서 탐색하고 있는 건데...
            </div>
          </BlurredSection>

          <BlurredSection title="언니 말 들어, 이렇게 해봐" icon="🎯">
            {["한 이틀 정도 먼저 연락하지 말고 기다려봐", "다음에 만날 때 가볍게 취향 맞는 장소를 제안해봐", "너무 밀당하지 말고, 네 관심을 자연스럽게 보여줘"].map((t, i) =>
              <div key={i} className="flex gap-2.5 mb-2.5 items-start">
                <div className="w-[22px] h-[22px] rounded-full shrink-0 bg-[#FF6B8A] flex items-center justify-center text-[11px] font-bold text-white">{i + 1}</div>
                <div className="text-sm text-[#2D2B3D] leading-[1.7]">{t}</div>
              </div>
            )}
          </BlurredSection>

          <button onClick={onUnlock} disabled={unlocking}
            className="w-full py-4 rounded-[20px] border-none text-white text-base font-bold mb-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #FF6B8A, #E8456A)",
              boxShadow: "0 4px 20px rgba(255,107,138,0.2)",
              opacity: unlocking ? 0.7 : 1,
              cursor: unlocking ? "wait" : "pointer",
            }}>
            {unlocking ? "분석하는 중... 💭" : "걔 속마음 & 행동 전략 보기 · ₩3,900"}
          </button>
          <p className="text-center text-[11px] text-[#C4C0D0] mb-2">⚡ 30초면 나와요</p>
        </>
      )}

      {/* Watermark */}
      <p className="text-center text-[11px] text-[#C4C0D0] mt-2 mb-3.5 tracking-wider font-semibold">
        AI언니 · 연애 분석
      </p>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button onClick={onReset}
          className="flex-1 py-3.5 rounded-[16px] text-sm font-semibold cursor-pointer transition-all"
          style={{ background: "#FFF0F3", border: "1px solid #FFD6E0", color: "#FF6B8A" }}>
          다시 분석하기
        </button>
      </div>

      {/* Email Capture */}
      <EmailCapture />
    </div>
  );
}

// ─── Email Capture ───
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.includes("@")) return;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-4 py-4 px-5 rounded-[20px] text-center"
        style={{ background: "#FFF0F3", border: "1px solid #FFD6E0" }}>
        <p className="text-sm text-[#2D2B3D] font-semibold">✅ 전송 완료! 메일함을 확인해봐</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-5 rounded-[20px] bg-white border border-[rgba(255,143,171,0.15)] shadow-[0_2px_20px_rgba(255,143,171,0.08)]">
      <p className="text-[13px] text-[#8E8A9D] font-semibold mb-2.5">📩 리포트를 이메일로도 받아볼래?</p>
      <div className="flex gap-2">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          className="flex-1 py-2.5 px-3.5 rounded-[14px] text-sm outline-none transition-colors"
          style={{ border: "1.5px solid #FFD6E0", color: "#2D2B3D" }} />
        <button onClick={handleSend} disabled={!email.includes("@")}
          className="py-2.5 px-4.5 rounded-[14px] border-none text-white text-[13px] font-bold transition-all whitespace-nowrap"
          style={{
            background: email.includes("@") ? "#FF6B8A" : "#FFD6E0",
            cursor: email.includes("@") ? "pointer" : "default",
          }}>보내기</button>
      </div>
    </div>
  );
}

// ─── Upload Zone ───
function UploadZone({ images, onAdd, onRemove }: any) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-[13px] text-[#8E8A9D] font-semibold mb-2">
        📱 카톡 캡쳐 <span className="font-normal text-[#C4C0D0]">(선택이야 · 있으면 더 정확해!)</span>
      </p>
      <div onClick={() => ref.current?.click()}
        className="rounded-[16px] text-center cursor-pointer transition-all hover:border-[#FF6B8A]"
        style={{
          padding: images.length > 0 ? "14px" : "28px 20px",
          border: "1.5px dashed #FFADC4",
          background: "#FFF0F3",
        }}>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { onAdd(Array.from(e.target.files || [])); e.target.value = ""; }} />
        {images.length === 0 ? (
          <>
            <div className="text-[28px] mb-1.5">📎</div>
            <div className="text-[13px] text-[#8E8A9D]">여기 눌러서 캡쳐 추가</div>
          </>
        ) : (
          <>
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)` }}>
              {images.map((img: any, i: number) => (
                <div key={i} className="relative rounded-[10px] overflow-hidden">
                  <img src={img.preview} alt="" className="w-full h-[100px] object-cover block" />
                  <button onClick={e => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 border-none text-white text-xs cursor-pointer flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#C4C0D0]">+ 더 추가하기 ({images.length}장)</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Text Input ───
function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleChip = (prompt: string) => {
    if (!value.includes(prompt)) onChange(prompt + value);
  };

  return (
    <div>
      <p className="text-[13px] text-[#8E8A9D] font-semibold mb-2.5">✏️ 너의 상황을 알려줘</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {CHIPS.map((chip, i) => {
          const isActive = value.includes(chip.prompt);
          return (
            <button key={i} onClick={() => handleChip(chip.prompt)}
              className="inline-flex items-center gap-1 px-3.5 py-[7px] rounded-full border-none text-[13px] font-semibold cursor-pointer transition-all"
              style={{
                background: isActive ? "#FF6B8A" : "#FFF0F3",
                color: isActive ? "#fff" : "#2D2B3D",
                boxShadow: isActive ? "0 2px 12px rgba(255,107,138,0.2)" : "none",
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

// ─── Loading ───
function LoadingState() {
  const m = ["카톡을 읽고 있어... 👀", "걔 심리를 파악하는 중... 🧠", "호감 시그널 찾는 중... 💕", "리포트 쓰는 중... ✍️"];
  const [i, setI] = useState(0);
  useEffect(() => { const iv = setInterval(() => setI(p => (p + 1) % m.length), 2200); return () => clearInterval(iv); }, []);
  return (
    <div className="text-center py-[60px] px-5 animate-fadeUp">
      <div className="w-[52px] h-[52px] mx-auto mb-5 rounded-full animate-spin"
        style={{ border: "3px solid #FFD6E0", borderTopColor: "#FF6B8A" }} />
      <p className="text-[15px] text-[#2D2B3D] font-semibold">{m[i]}</p>
    </div>
  );
}

// ─── Main Page ───
export default function Home() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [freeResult, setFreeResult] = useState<any>(null);
  const [paidResult, setPaidResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef({ text: "", imageData: [] as any[] });

  const hasInput = text.trim().length > 0 || images.length > 0;
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
    setLoading(true);
    setError(null);

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        images.slice(0, 1).map(img => fileToBase64(img.file))
      );
      inputRef.current = { text, imageData };

      const result = await analyzeAPI(text, imageData, "free");
      setFreeResult(result);
    } catch (err: any) {
      setError("앗, 오류가 났어! 다시 한번 해볼래? 🥲");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    setError(null);
    try {
      // Re-convert all images for paid tier
      const allImageData = await Promise.all(
        images.map(img => fileToBase64(img.file))
      );
      const result = await analyzeAPI(inputRef.current.text, allImageData, "paid");
      setPaidResult({ ...freeResult, ...result });
    } catch (err: any) {
      setError("앗, 오류가 났어. 다시 시도해봐! 🥲");
    } finally {
      setUnlocking(false);
    }
  };

  const reset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setText("");
    setFreeResult(null);
    setPaidResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen px-4 pt-5 pb-10"
      style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #FFF5F7 30%, #FFFFFF 100%)" }}>
      <div className="max-w-[420px] mx-auto">
        {!result && (
          <div className="text-center mb-7 pt-4 animate-fadeUp">
            <div className="text-[40px] mb-2 animate-float">👩‍❤️‍👨</div>
            <h1 className="text-[32px] font-extrabold text-[#2D2B3D] tracking-tight mb-1.5">
              AI<span className="text-[#FF6B8A]">언니</span>
            </h1>
            <p className="text-[13px] text-[#8E8A9D] font-medium leading-relaxed">
              썸, 연애, 재회까지 대신 봐주는 연애 조언 AI 💌
            </p>
          </div>
        )}

        {result ? (
          <ResultCard result={result} isPaid={isPaid} onReset={reset} onUnlock={handleUnlock} unlocking={unlocking} />
        ) : loading ? (
          <LoadingState />
        ) : (
          <div className="animate-fadeUp flex flex-col gap-4">
            <TextInput value={text} onChange={setText} />
            <UploadZone images={images} onAdd={addImages} onRemove={removeImage} />

            {error && (
              <div className="py-3 px-4 rounded-[16px] text-[13px] text-center"
                style={{ background: "#FFF0F0", border: "1px solid #FFD6D6", color: "#E8456A" }}>
                {error}
              </div>
            )}

            <button onClick={analyze} disabled={!hasInput}
              className="w-full py-4 rounded-[20px] border-none text-base font-bold transition-all active:scale-[0.97]"
              style={{
                background: hasInput ? "linear-gradient(135deg, #FF6B8A, #E8456A)" : "#FFF0F3",
                color: hasInput ? "#fff" : "#C4C0D0",
                cursor: hasInput ? "pointer" : "default",
                boxShadow: hasInput ? "0 4px 20px rgba(255,107,138,0.2)" : "none",
              }}>
              {hasInput ? "무료로 분석해보기 →" : "먼저 상황을 알려줘! 💬"}
            </button>

            <div className="flex justify-center gap-3.5 text-[11px] text-[#C4C0D0] font-medium">
              <span>🔒 캡쳐 저장 안 함</span>
              <span>⚡ 10초면 끝</span>
              <span>💗 AI 분석</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
