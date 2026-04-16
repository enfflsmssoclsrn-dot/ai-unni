import { createClient } from "@supabase/supabase-js";

// ─── 클라이언트(브라우저/서버 공용 읽기) — anon 키 사용 ───
// NEXT_PUBLIC_ 접두사가 붙어서 브라우저에도 노출됨 (읽기 전용 RLS 정책용)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// ─── 서버 전용 admin 클라이언트 — service_role 키 사용 ───
// ⚠️ 절대 브라우저 코드에서 import 하지 말 것. Route Handler / Server Action 에서만 사용.
// RLS 우회 가능하므로 결제 확정 등 신뢰된 서버 로직에만 사용.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
