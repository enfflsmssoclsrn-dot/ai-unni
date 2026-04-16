import LegalLayout from "../_legal/LegalLayout";

export const metadata = {
  title: "환불정책 | AI언니",
  description: "AI언니 결제 및 환불 정책",
};

// ※ 아래 [대괄호] 플레이스홀더는 사업자등록 완료 후 실제 값으로 교체할 것.
export default function RefundPage() {
  return (
    <LegalLayout title="환불정책" updatedAt="2026-04-16">
      <section className="mb-6">
        <p>
          본 환불정책은 AI언니 서비스(이하 “서비스”)의 유료 상품에 대한 결제
          및 환불 기준을 정합니다. 본 정책은 「전자상거래 등에서의 소비자보호에
          관한 법률」(이하 “전상법”) 및 관련 법령에 따라 작성되었습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">1. 유료 상품 개요</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FFF0F3]">
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">상품</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">금액</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">심층 분석 리포트</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">₩2,900 / 1회</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">AI가 생성한 호감 근거, 주의 포인트, 상대방 심리 해석, 행동 전략 등 확장 분석 결과 제공</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">대화 시뮬레이션 턴 추가</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">₩990 / 15턴</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">AI가 상대방 말투를 학습하여 진행하는 대화 시뮬레이션의 추가 이용권</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">2. 청약철회 및 환불 기준</h2>

        <h3 className="font-bold mt-4 mb-1">(1) 서비스 제공 전 (결제 직후, 콘텐츠 미확인 상태)</h3>
        <p>
          결제 완료 후 유료 콘텐츠(분석 결과·시뮬레이션 턴)를 <b>한 번도 사용하지
          않은 경우</b>, 결제일로부터 <b>7일 이내 </b>청약철회 및 전액 환불이
          가능합니다.
        </p>

        <h3 className="font-bold mt-4 mb-1">(2) 서비스 제공 후 (콘텐츠 확인·사용 후)</h3>
        <p>
          전상법 제17조 제2항 제5호에 따라 <b>디지털 콘텐츠의 제공이 개시된
          경우 청약철회가 제한</b>됩니다. 본 서비스의 유료 콘텐츠는 결제 직후
          분석 결과가 화면에 표시되거나 턴이 적립됨으로써 즉시 제공되므로,
          해당 시점 이후에는 원칙적으로 환불이 불가합니다.
        </p>

        <h3 className="font-bold mt-4 mb-1">(3) 서비스 하자로 인한 환불</h3>
        <p>다음의 경우에는 사용 여부와 관계없이 전액 환불이 가능합니다.</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>결제는 완료되었으나 서비스 오류로 분석 결과가 정상적으로 제공되지
            않은 경우</li>
          <li>시뮬레이션 턴이 결제 금액만큼 정상적으로 적립되지 않은 경우</li>
          <li>AI 서버 장애·네트워크 장애 등 운영자의 귀책사유로 서비스를 이용할
            수 없는 경우</li>
          <li>그 밖에 관련 법령에서 환불을 인정하는 경우</li>
        </ol>

        <h3 className="font-bold mt-4 mb-1">(4) 부분 환불</h3>
        <p>
          시뮬레이션 턴 상품(15턴 단위)은 디지털 콘텐츠 특성상 <b>부분 사용 후
          잔여 턴에 대한 환불은 제공되지 않습니다</b>. 단, 제(3)항의 서비스 하자
          사유에 해당하는 경우에는 이에 따릅니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">3. 환불 요청 방법</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>환불을 원하는 이용자는 아래 고객센터 이메일로 <b>주문번호, 결제
            일시, 결제 금액, 환불 사유</b>를 기재하여 요청하시기 바랍니다.</li>
          <li>운영자는 환불 요청 수령일로부터 영업일 기준 <b>3일 이내</b>에 환불
            가능 여부를 안내하며, 환불이 승인될 경우 결제 수단의 승인 취소
            또는 계좌 환급을 통해 처리합니다.</li>
          <li>카드 결제의 경우 카드사 정책에 따라 실제 환급까지 3~7영업일이
            소요될 수 있습니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">4. 고객센터</h2>
        <div className="rounded-[12px] bg-[#FFF8FA] border border-[#FFE8EC] p-4">
          <ul className="space-y-1">
            <li>이메일: junilabstudio@gmail.com</li>
            <li>운영 시간: 평일 10:00 ~ 18:00 (주말·공휴일 제외)</li>
            <li>응답은 영업일 기준 1~2일 이내 안내드립니다.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold mb-2">5. 기타</h2>
        <p>
          본 환불정책에 명시되지 않은 사항은 운영자의
          「이용약관」(/terms) 및 관련 법령(전자상거래법, 소비자분쟁해결기준
          등)에 따릅니다.
        </p>
      </section>
    </LegalLayout>
  );
}
