// DEPRECATED (2026-04)
// 단건 예측형 시뮬레이션 결제 확정 엔드포인트는 폐기됨.
// 실시간 채팅형 시뮬 언락 결제(/api/sim/unlock/confirm) 로 이전.
export async function POST() {
  return Response.json(
    {
      error:
        "이 엔드포인트는 폐기되었어요. 새 언락 결제를 사용해줘. (/api/sim/unlock/confirm)",
      deprecated: true,
    },
    { status: 410 }
  );
}
