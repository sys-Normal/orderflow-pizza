import type { PrismaClient } from "@/generated/prisma/client";

// Distinct from the "@orderflow.pizza" domain used by real login accounts
// (see prisma/seed.ts SEED_ACCOUNTS) so a display-only contact email can
// never be confused with — or collide with — an actual login credential.
const CONTACT_EMAIL_DOMAIN = "store.orderflow.pizza";

const CONTACT_EMAIL_NOUNS = [
  "tiger", "panda", "eagle", "otter", "falcon", "comet", "maple", "cedar",
  "harbor", "meadow", "summit", "willow", "canyon", "atlas", "ember",
  "quartz", "raven", "juniper", "delta", "orbit",
];

function randomContactEmail(): string {
  const noun =
    CONTACT_EMAIL_NOUNS[Math.floor(Math.random() * CONTACT_EMAIL_NOUNS.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return `${noun}${number}@${CONTACT_EMAIL_DOMAIN}`;
}

// Random noun+number local part, retried against Store.contactEmail's
// unique constraint until a free one turns up. Takes the Prisma client as a
// parameter (rather than importing the shared "@/lib/db" instance) so the
// standalone prisma/seed.ts script — which opens its own client/adapter —
// can reuse this without a second, redundant DB connection.
export async function generateUniqueContactEmail(
  prisma: Pick<PrismaClient, "store">
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomContactEmail();
    const existing = await prisma.store.findUnique({
      where: { contactEmail: candidate },
    });
    if (!existing) return candidate;
  }
  throw new Error("고유한 담당자 이메일을 생성하지 못했습니다.");
}
