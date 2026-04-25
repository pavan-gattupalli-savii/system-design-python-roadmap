// ── Admin bootstrap script ────────────────────────────────────────────────────
// Promotes a registered user to `role = 'admin'` so they can access /app/admin.
// Usage:
//   npm run promote-admin -- you@example.com
//
// Looks up the user by email in our own `users` table — they must have signed
// in via OTP at least once before this script can find them.

import { sql } from "../src/db/client.js";

interface UserRow { id: string; email: string; display_name: string | null }

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run promote-admin -- <email>");
    process.exit(1);
  }

  const rows = await sql`
    UPDATE users
    SET role = 'admin'
    WHERE email = ${email}
    RETURNING id, email, display_name
  ` as UserRow[];

  if (!rows.length) {
    console.error(`No user found for ${email}. Make sure they've completed an OTP sign-in at least once.`);
    process.exit(2);
  }

  const user = rows[0];
  console.log(`✅ Promoted ${user.email} (${user.id}) to admin`);
}

main().catch((err) => {
  console.error("❌ promote-admin failed:", err);
  process.exit(1);
});
