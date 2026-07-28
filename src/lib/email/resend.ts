import { Resend } from "resend";

// Sender not on a verified domain yet (Resend account is still in sandbox —
// see docs/backlog.md), so this can only actually deliver to the Resend
// account's own verified email until a real domain is added.
const FROM_ADDRESS = "OrderFlow Pizza <onboarding@resend.dev>";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY 환경변수가 설정되어 있지 않습니다.");
    }
    client = new Resend(apiKey);
  }
  return client;
}

export async function sendEmail(to: string, subject: string, html: string) {
  await getClient().emails.send({ from: FROM_ADDRESS, to, subject, html });
}
