import LegalLayout from "../_legal/LegalLayout";

export const metadata = {
  title: "이용약관 | AI언니",
  description: "AI언니 서비스 이용약관",
};

// ※ 아래 [대괄호] 플레이스홀더는 사업자등록 완료 후 실제 값으로 교체할 것.
export default function TermsPage() {
  return (
    <LegalLayout title="이용약관" updatedAt="2026-04-16">
      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제1조 (목적)</h2>
        <p>
          본 약관은 AI언니(이하 “서비스”)를 운영하는 주니랩스튜디오(이하 “운영자”)이
          제공하는 모든 서비스의 이용과 관련하여, 운영자와 이용자 간의 권리·의무
          및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제2조 (정의)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>“서비스”란 운영자가 AI 기반으로 제공하는 연애·관계 분석 리포트,
            대화 시뮬레이션 등 일체의 디지털 콘텐츠를 말합니다.</li>
          <li>“이용자”란 본 약관에 따라 서비스를 이용하는 모든 방문자를 말합니다.</li>
          <li>“유료 서비스”란 이용자가 결제를 통해 이용 가능한 서비스를 말하며,
            심층 분석 리포트(₩2,900) 및 대화 시뮬레이션 턴 추가(₩990 / 15턴) 등을
            포함합니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제3조 (약관의 게시 및 개정)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>운영자는 본 약관의 내용을 이용자가 쉽게 확인할 수 있도록 서비스
            초기화면에 게시합니다.</li>
          <li>운영자는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수
            있으며, 개정 시 적용일자 및 개정사유를 명시하여 최소 7일 전
            (이용자에게 불리한 변경의 경우 30일 전)에 공지합니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제4조 (회원가입·비회원 이용)</h2>
        <p>
          본 서비스는 별도의 회원가입 절차 없이 비회원으로 이용이 가능합니다.
          다만, 유료 서비스 이용 시 결제 수단 제공 등 필요한 범위 내에서
          이용자의 정보가 수집될 수 있으며, 해당 사항은
          「개인정보처리방침」에 따릅니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제5조 (서비스의 제공)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>운영자는 이용자가 입력한 텍스트 및 업로드한 이미지(카톡·DM 대화
            캡처 등)를 기반으로 AI 분석 결과를 제공합니다.</li>
          <li>분석 결과는 AI 알고리즘에 의한 추정적·참고적 정보이며, 실제 관계에
            대한 의학적·심리학적·법적 진단을 구성하지 않습니다.</li>
          <li>운영자는 서비스의 일부 또는 전부를 시스템 정기 점검, 서버 장애,
            그 밖의 부득이한 사유로 일시 중단할 수 있으며, 이 경우 사전
            공지하되 긴급한 경우 사후에 공지할 수 있습니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제6조 (결제 및 환불)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>유료 서비스의 결제는 운영자가 지정한 PG(토스페이먼츠)를 통해
            이루어집니다.</li>
          <li>결제 및 환불의 구체적 기준은 별도의
            「환불정책」(/refund)에 따르며, 본 약관과 같은 효력을 가집니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제7조 (이용자의 금지 행위)</h2>
        <p>이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>타인의 개인정보·대화 내용을 본인의 동의 없이 업로드·무단 분석하는 행위</li>
          <li>서비스의 운영을 방해하거나 AI 모델에 대해 비정상적인 접근·역공학을 시도하는 행위</li>
          <li>서비스를 통해 제공되는 결과물을 무단 복제·배포·상업적으로 전용하는 행위</li>
          <li>관련 법령 또는 공서양속에 반하는 목적으로 서비스를 이용하는 행위</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제8조 (서비스 이용의 제한)</h2>
        <p>
          운영자는 이용자가 제7조 각 호에 해당하거나 관련 법령을 위반한 경우,
          사전 통지 없이 서비스 이용을 제한하거나 향후 이용을 거부할 수
          있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제9조 (책임 제한)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>본 서비스가 제공하는 AI 분석 결과는 참고용이며, 운영자는 분석
            결과의 정확성·완전성을 보증하지 않습니다.</li>
          <li>이용자가 분석 결과를 바탕으로 수행한 의사결정·행위에 대한 책임은
            이용자 본인에게 있습니다.</li>
          <li>운영자는 천재지변, 전시, 사변, 정전, 제3자 서비스(AI 모델 제공자,
            결제대행사, 클라우드 제공자 등)의 장애 등 불가항력적 사유로 인한
            서비스 중단에 대하여 책임을 지지 않습니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제10조 (개인정보의 보호)</h2>
        <p>
          운영자는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기
          위하여 노력하며, 개인정보의 처리에 관한 구체적 사항은 별도의
          「개인정보처리방침」(/privacy)에 따릅니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">제11조 (준거법 및 분쟁 해결)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>본 약관의 해석 및 운영자와 이용자 간의 분쟁에 대해서는 대한민국
            법령을 적용합니다.</li>
          <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 운영자와 이용자는
            상호 성실히 협의하여 해결하며, 협의가 이루어지지 않을 경우 민사소송법
            상의 관할법원을 제1심 관할법원으로 합니다.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-[16px] font-bold mb-2">부칙</h2>
        <p>본 약관은 2026년 4월 16일부터 시행됩니다.</p>
      </section>
    </LegalLayout>
  );
}
