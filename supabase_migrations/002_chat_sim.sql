-- ─────────────────────────────────────────────────────────────
-- 002_chat_sim.sql
-- 답장 시뮬레이터를 "채팅형 대화 시뮬레이션"으로 리빌드.
-- 기존 단건 예측형 simulations 테이블은 폐기.
--
-- 구조 요약:
-- - sim_sessions : 시뮬 세션 1건 (= parent_order 당 1개 자연스러움)
--                  페르소나(상대방 말투·성향) 캐시 + 턴 할당량 관리
-- - sim_messages : 세션의 실시간 대화 메시지 (role: user | partner)
-- - sim_unlocks  : +15턴 결제 주문 기록 (토스 결제 단위)
--
-- 비즈니스 규칙:
-- - 무료 체험: turns_allowed = 2 로 시작
-- - 결제(₩2,900) 1회당 turns_granted = 15 → turns_allowed += 15
-- - turns_used 는 "사용자 메시지 송신" 기준 카운트 (상대 답장은 무료)
-- - 리셋은 sim_messages 만 삭제, sim_sessions 의 turns_used/turns_allowed 유지
-- ─────────────────────────────────────────────────────────────

-- 1) 기존 단건 시뮬 테이블 폐기
drop table if exists public.simulations cascade;

-- 2) 시뮬 세션
create table if not exists public.sim_sessions (
  id                bigserial primary key,
  session_id        text unique not null,                              -- aiunsession_{ts}_{rand}
  parent_order_id   text not null references public.orders(order_id) on delete cascade,
  persona           jsonb,                                             -- 페르소나 JSON (최초 1회 추출 후 캐시)
  turns_allowed     int  not null default 2,                           -- 현재 보낼 수 있는 총 턴 수
  turns_used        int  not null default 0,                           -- 지금까지 소진한 사용자 메시지 수
  client_token      text,                                              -- 디바이스 식별
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_sim_sessions_parent  on public.sim_sessions(parent_order_id);
create index if not exists idx_sim_sessions_client  on public.sim_sessions(client_token);
create index if not exists idx_sim_sessions_created on public.sim_sessions(created_at desc);

alter table public.sim_sessions enable row level security;
comment on table public.sim_sessions is '답장 시뮬레이터 채팅 세션 (페르소나 + 턴 할당량)';
comment on column public.sim_sessions.persona       is '상대방 페르소나 JSON (tone, vocabulary_samples, attachment_style, do_not, common_patterns 등)';
comment on column public.sim_sessions.turns_allowed is '현재 보낼 수 있는 총 사용자 메시지 수 (무료 2 + 결제당 +15)';
comment on column public.sim_sessions.turns_used    is '실제로 소진한 사용자 메시지 수';

-- 3) 시뮬 메시지 (채팅 히스토리)
create table if not exists public.sim_messages (
  id          bigserial primary key,
  session_id  text not null references public.sim_sessions(session_id) on delete cascade,
  role        text not null check (role in ('user','partner')),        -- user: 본인, partner: AI가 흉내낸 상대방
  content     text not null,
  turn_index  int  not null,                                           -- 같은 세션 내 순서 (0부터 시작)
  created_at  timestamptz not null default now()
);

create index if not exists idx_sim_messages_session on public.sim_messages(session_id, turn_index);

alter table public.sim_messages enable row level security;
comment on table public.sim_messages is '시뮬 세션의 채팅 메시지 기록';
comment on column public.sim_messages.role is 'user: 사용자, partner: AI가 흉내낸 상대방';

-- 4) 턴 언락 결제 주문 (+15턴 결제 단위)
create table if not exists public.sim_unlocks (
  id                bigserial primary key,
  unlock_order_id   text unique not null,                              -- aiununlock_{ts}_{rand}
  session_id        text not null references public.sim_sessions(session_id) on delete cascade,
  amount            int  not null default 2900,
  turns_granted     int  not null default 15,                          -- 결제 1회로 추가되는 턴 수
  status            text not null default 'pending',                   -- pending / paid
  payment_key       text,                                              -- 토스 paymentKey
  paid_at           timestamptz,
  client_token      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_sim_unlocks_session on public.sim_unlocks(session_id);
create index if not exists idx_sim_unlocks_status  on public.sim_unlocks(status);

alter table public.sim_unlocks enable row level security;
comment on table public.sim_unlocks is '시뮬 턴 언락 결제 주문 (₩2,900 = +15턴)';

-- 5) 편의: updated_at 자동 갱신 (선택)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sim_sessions_updated on public.sim_sessions;
create trigger trg_sim_sessions_updated
  before update on public.sim_sessions
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_sim_unlocks_updated on public.sim_unlocks;
create trigger trg_sim_unlocks_updated
  before update on public.sim_unlocks
  for each row execute function public.touch_updated_at();
