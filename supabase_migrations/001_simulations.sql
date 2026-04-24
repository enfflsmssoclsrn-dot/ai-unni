-- ─────────────────────────────────────────────────────────────
-- simulations 테이블: 답장 시뮬레이터 단건 결제
-- ─────────────────────────────────────────────────────────────
-- 각 행 = 시뮬 1회 결제 주문
-- parent_order_id: 기존 orders 테이블의 심층분석 주문을 참조 (대화 맥락 상속)
-- 같은 parent_order_id 로 여러 시뮬 주문 가능 (재구매 지원)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.simulations (
  id                bigserial primary key,
  sim_order_id      text unique not null,               -- aiunnisim_{ts}_{rand}
  parent_order_id   text not null references public.orders(order_id) on delete cascade,
  draft_reply       text not null,                      -- 사용자가 쓴 답장 초안
  amount            int  not null default 2900,
  status            text not null default 'pending',    -- pending / paid / completed
  payment_key       text,                               -- 토스 paymentKey
  paid_at           timestamptz,
  result            jsonb,                              -- Claude 시뮬 결과 JSON
  client_token      text,                               -- 디바이스 식별 (orders와 동일 체계)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_simulations_parent    on public.simulations(parent_order_id);
create index if not exists idx_simulations_status    on public.simulations(status);
create index if not exists idx_simulations_client    on public.simulations(client_token);
create index if not exists idx_simulations_created   on public.simulations(created_at desc);

-- RLS: service_role 만 접근 (서버 라우트 핸들러에서만 읽기/쓰기)
alter table public.simulations enable row level security;

-- 기본적으로 anon 은 접근 불가 (정책 없음 = 차단)
-- service_role 은 bypassrls 속성으로 자동 허용됨

comment on table public.simulations is 'AI언니 답장 시뮬레이터 결제·결과 저장';
comment on column public.simulations.parent_order_id is '원 심층분석 주문 ID (대화 맥락 상속)';
comment on column public.simulations.draft_reply     is '사용자가 시뮬 대상으로 입력한 답장 초안';
comment on column public.simulations.result          is 'Claude 시뮬 결과 JSON (predicted_reaction, emotional_shift, risk_level, why, better_version, one_liner)';
