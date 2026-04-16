// DEPRECATED (2026-04)
// 단건 예측형 시뮬레이션 엔드포인트는 폐기됨.
// 실시간 채팅형 시뮬레이터(/api/sim/*) 로 이전.
// 이 파일은 빌드 타임 존재 유지용 스텁.
export async function POST() {
  return Response.json(
    {
      error:
        "이 엔드포인트는 폐기되었어요. 새 채팅형 시뮬레이션을 사용해줘. (/api/sim/session/start)",
      deprecated: true,
    },
    { status: 410 }
  );
}
