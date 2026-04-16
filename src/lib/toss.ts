// ─── 토스페이먼츠 서버 유틸 ───
// 결제 확정(Confirm) API 호출. 시크릿 키는 서버에서만 사용.
// 문서: https://docs.tosspayments.com/reference#payment-승인

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export type TossConfirmSuccess = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string; // DONE / CANCELED / PARTIAL_CANCELED / ABORTED / EXPIRED
  totalAmount: number;
  method: string; // 카드 / 가상계좌 / ...
  approvedAt: string;
  [k: string]: unknown;
};

export type TossConfirmError = {
  code: string;
  message: string;
};

/**
 * 토스페이먼츠 결제 확정 호출.
 * 성공 시 토스가 반환한 결제 정보 객체를 그대로 돌려준다.
 * 실패 시 에러를 throw.
 */
export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmSuccess> {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY is not set");

  // Basic 인증: "{secretKey}:" 를 Base64 인코딩
  const auth = Buffer.from(secret + ":").toString("base64");

  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const body = (await res.json()) as TossConfirmSuccess | TossConfirmError;

  if (!res.ok) {
    const err = body as TossConfirmError;
    throw new Error(
      `Toss confirm failed [${res.status}]: ${err.code || "UNKNOWN"} - ${err.message || "no message"}`
    );
  }

  return body as TossConfirmSuccess;
}
