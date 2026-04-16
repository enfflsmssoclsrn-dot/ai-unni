import { getSupabaseAdmin } from "@/lib/supabase";

// ─── 30일 자동 파기 크론 ───
// 개인정보처리방침 제3조 1호:
//   "이용자가 업로드한 텍스트·이미지 및 AI 분석 결과: 분석 완료 후 30일까지 보관하며, 이후 자동 파기."
//
// 처리 방식:
// 1) orders — 결제·거래 기록은 전자상거래법상 5년 보관 의무.
//    → 행 자체는 남기되, 민감 필드(input_text, input_images, analysis_result) 만 NULL 로 scrub.
// 2) sim_sessions — 페르소나(말풍선 원문 발췌 포함)만 scrub. 세션 메타는 유지.
// 3) sim_messages — 대화 내용은 완전 삭제.
//
// 호출: Vercel Cron (vercel.json) 이 매일 1회 호출.
// 인증: CRON_SECRET 환경변수로 Authorization: Bearer ... 검증.
//      (Vercel Cron 이 자동으로 이 헤더 붙여서 호출함)

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CUTOFF_DAYS = 30;

function cutoffIsoDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - CUTOFF_DAYS);
  return d.toISOString();
}

export async function GET(req: Request) {
  // 인증: Vercel Cron 이 보낸 요청인지 확인
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const cutoff = cutoffIsoDate();

  const result: Record<string, any> = {
    cutoff_iso: cutoff,
    cutoff_days: CUTOFF_DAYS,
    started_at: new Date().toISOString(),
  };

  try {
    // 1) orders scrub — 민감 필드만 NULL 처리 (거래 기록은 5년 보관)
    // 이미 scrub된 건은 건너뛰기 위해 input_text/input_images/analysis_result 중 하나라도 남아있는 것만
    const { data: ordersToScrub, error: oSelErr } = await supabase
      .from("orders")
      .select("order_id")
      .lt("created_at", cutoff)
      .or(
        "input_text.not.is.null,input_images.not.is.null,analysis_result.not.is.null"
      );

    if (oSelErr) throw new Error(`orders select: ${oSelErr.message}`);

    const orderIds = (ordersToScrub || []).map((o: any) => o.order_id);
    if (orderIds.length > 0) {
      const { error: oUpdErr } = await supabase
        .from("orders")
        .update({
          input_text: null,
          input_images: null,
          analysis_result: null,
        })
        .in("order_id", orderIds);

      if (oUpdErr) throw new Error(`orders update: ${oUpdErr.message}`);
    }
    result.orders_scrubbed = orderIds.length;

    // 2) sim_sessions.persona scrub — 말풍선 원문 발췌 제거
    const { data: sessToScrub, error: sSelErr } = await supabase
      .from("sim_sessions")
      .select("session_id")
      .lt("created_at", cutoff)
      .not("persona", "is", null);

    if (sSelErr) throw new Error(`sim_sessions select: ${sSelErr.message}`);

    const sessionIds = (sessToScrub || []).map((s: any) => s.session_id);
    if (sessionIds.length > 0) {
      const { error: sUpdErr } = await supabase
        .from("sim_sessions")
        .update({ persona: null })
        .in("session_id", sessionIds);

      if (sUpdErr) throw new Error(`sim_sessions update: ${sUpdErr.message}`);
    }
    result.sim_sessions_scrubbed = sessionIds.length;

    // 3) sim_messages — 30일 지난 대화 내용 완전 삭제
    const { error: mDelErr, count: deletedCount } = await supabase
      .from("sim_messages")
      .delete({ count: "exact" })
      .lt("created_at", cutoff);

    if (mDelErr) throw new Error(`sim_messages delete: ${mDelErr.message}`);
    result.sim_messages_deleted = deletedCount ?? 0;

    result.status = "ok";
    result.finished_at = new Date().toISOString();
    console.log("[cron/cleanup] success:", result);
    return Response.json(result);
  } catch (e: any) {
    console.error("[cron/cleanup] error:", e);
    return Response.json(
      {
        ...result,
        status: "error",
        error: e?.message || String(e),
        finished_at: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
