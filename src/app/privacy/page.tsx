import LegalLayout from "../_legal/LegalLayout";

export const metadata = {
  title: "개인정보처리방침 | AI언니",
  description: "AI언니 개인정보처리방침",
};

// ※ 아래 [대괄호] 플레이스홀더는 사업자등록 완료 후 실제 값으로 교체할 것.
export default function PrivacyPage() {
  return (
    <LegalLayout title="개인정보처리방침" updatedAt="2026-04-16">
      <section className="mb-6">
        <p>
          주니랩스튜디오(이하 “운영자”)은 이용자의 개인정보를 중요시하며,
          「개인정보 보호법」 및 관련 법령을 준수합니다. 본 개인정보처리방침은
          AI언니 서비스(이하 “서비스”)가 이용자의 개인정보를 어떻게 수집·이용·보관·파기하는지를
          안내합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">1. 수집하는 개인정보 항목</h2>
        <p className="mb-2">운영자는 서비스 제공을 위해 아래의 정보를 수집합니다.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FFF0F3]">
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">구분</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">항목</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">수집 시점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">이용 기록</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">브라우저 식별자(localStorage 토큰), 접속 IP, 접속 일시, 이용 페이지, User-Agent</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">서비스 접속 시 자동 수집</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">이용자 입력 콘텐츠</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">텍스트 상황 설명, 업로드한 대화 캡처 이미지(카톡·DM 등)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">분석 요청 시</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">결제 정보</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">주문 번호, 결제 금액, 결제 수단, 결제 일시 (카드번호 등 민감 정보는 토스페이먼츠가 직접 처리, 운영자 서버에는 저장되지 않음)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">유료 결제 시</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">선택 항목</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">이메일(결제/문의 응답용, 선택 입력 시)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">이용자가 직접 입력 시</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">2. 개인정보의 수집 및 이용 목적</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>AI 기반 관계 분석 리포트 및 대화 시뮬레이션 서비스 제공</li>
          <li>유료 결제의 처리, 결제 내역 확인, 환불 처리 및 민원 응대</li>
          <li>서비스 품질 개선, 부정 이용 방지 및 통계 분석</li>
          <li>법령상 의무 이행(전자상거래법상 거래 기록 보관 등)</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>이용자가 업로드한 텍스트·이미지 및 AI 분석 결과: 분석 완료 후
            <b> 30일 </b>까지 보관하며, 이후 자동 파기합니다.</li>
          <li>결제 및 거래 기록: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라
            <b> 5년간 </b>보관합니다.</li>
          <li>접속 기록(IP 등): 「통신비밀보호법」에 따라 <b>3개월간</b> 보관합니다.</li>
          <li>기타 법령에서 정한 보관 의무가 있는 경우 해당 기간 동안 보관됩니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">4. 개인정보의 제3자 제공 및 처리 위탁</h2>
        <p className="mb-2">
          운영자는 서비스 제공을 위하여 아래와 같이 외부 업체에 개인정보 처리를
          위탁합니다. 이용자의 개인정보는 해당 위탁 업무 수행 범위 내에서만 이용됩니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FFF0F3]">
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">수탁자</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">위탁 업무</th>
                <th className="border border-[#FFD6E0] px-2 py-1.5 text-left">제공 항목</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">Anthropic, PBC (미국)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">AI 분석 처리 (Claude API)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">이용자가 입력한 텍스트·이미지</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">(주)비바리퍼블리카 (토스페이먼츠)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">전자결제 처리</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">주문 번호, 결제 금액, 결제 수단</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">Supabase Inc. (미국)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">데이터베이스 호스팅</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">주문 정보, 분석 결과, 이용자 입력 콘텐츠</td>
              </tr>
              <tr>
                <td className="border border-[#FFD6E0] px-2 py-1.5">Vercel Inc. (미국)</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">웹 호스팅 및 트래픽 처리</td>
                <td className="border border-[#FFD6E0] px-2 py-1.5">접속 로그, 요청 데이터</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12.5px] text-[#6E6A80]">
          ※ 일부 수탁자는 해외에 소재하므로 개인정보가 국외로 이전될 수 있습니다.
          이용자가 서비스를 이용함으로써 국외 이전에 동의한 것으로 간주됩니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">5. 개인정보의 파기 절차 및 방법</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기됩니다.</li>
          <li>전자적 파일 형태의 정보는 복구가 불가능한 방법으로 영구 삭제되며,
            종이 문서는 분쇄 또는 소각을 통해 파기됩니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">6. 이용자의 권리 및 행사 방법</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>이용자는 언제든지 본인 개인정보의 열람·정정·삭제·처리정지를 요구할 수 있습니다.</li>
          <li>권리 행사는 운영자의 개인정보 보호책임자에게 서면, 이메일 등을
            통해 요청할 수 있으며, 운영자는 지체 없이 조치합니다.</li>
          <li>이용자는 브라우저의 localStorage 를 직접 삭제함으로써 본인 단말에
            저장된 식별 토큰을 즉시 파기할 수 있습니다.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">7. 쿠키 및 유사 기술의 이용</h2>
        <p>
          서비스는 이용자 식별 및 세션 유지를 위하여 localStorage 및 쿠키를
          사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나
          삭제할 수 있으나, 이 경우 일부 기능 이용이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">8. 개인정보 보호책임자</h2>
        <div className="rounded-[12px] bg-[#FFF8FA] border border-[#FFE8EC] p-4">
          <ul className="space-y-1">
            <li>성명: 김경은</li>
            <li>직책: 대표</li>
            <li>이메일: junilabstudio@gmail.com</li>
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">9. 권익침해 구제 방법</h2>
        <p>개인정보 침해에 대한 피해 구제, 상담 등은 아래 기관에 문의할 수 있습니다.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>개인정보분쟁조정위원회: <a className="underline" href="https://kopico.go.kr" target="_blank" rel="noopener noreferrer">kopico.go.kr</a> (국번없이 1833-6972)</li>
          <li>개인정보침해신고센터: <a className="underline" href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer">privacy.kisa.or.kr</a> (국번없이 118)</li>
          <li>대검찰청 사이버수사과: <a className="underline" href="https://www.spo.go.kr" target="_blank" rel="noopener noreferrer">spo.go.kr</a> (02-3480-3571)</li>
          <li>경찰청 사이버수사국: <a className="underline" href="https://ecrm.police.go.kr" target="_blank" rel="noopener noreferrer">ecrm.police.go.kr</a> (국번없이 182)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-bold mb-2">10. 고지의 의무</h2>
        <p>
          본 개인정보처리방침의 내용이 변경될 경우, 개정 최소 7일 전
          (이용자에게 불리한 변경의 경우 30일 전)에 서비스 내 공지사항을 통해
          사전 고지합니다.
        </p>
      </section>
    </LegalLayout>
  );
}
