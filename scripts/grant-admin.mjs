/**
 * One-time admin setup script.
 * Usage:
 *   $env:SERVICE_ROLE_KEY="your-service-role-key"; node scripts/grant-admin.mjs
 *
 * Finds your Supabase users, lists them, and grants admin to the chosen email.
 */

import { createClient } from "@supabase/supabase-js";
import readline from "readline";

const SUPABASE_URL = "https://arwgbowbhgjqnkfwqbvf.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("\n❌  Missing SERVICE_ROLE_KEY env variable.");
  console.error(
    "    Set it first:\n" +
    "    PowerShell:  $env:SERVICE_ROLE_KEY=\"your-key\"\n" +
    "    Then run:    node scripts/grant-admin.mjs\n\n" +
    "    Get your key from: Supabase Dashboard → Settings → API → service_role (secret)\n"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n🔑  Connecting to Supabase...\n");

  // List all users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("❌  Failed to list users:", listErr.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error("❌  No users found. Sign up in the app first.");
    process.exit(1);
  }

  console.log("📋  Registered users:");
  users.forEach((u, i) => console.log(`    [${i + 1}] ${u.email}  (${u.id})`));

  const input = await ask("\nEnter the number or email of the user to make admin: ");
  rl.close();

  let target;
  const num = parseInt(input, 10);
  if (!isNaN(num) && num >= 1 && num <= users.length) {
    target = users[num - 1];
  } else {
    target = users.find((u) => u.email?.toLowerCase() === input.trim().toLowerCase());
  }

  if (!target) {
    console.error("❌  User not found.");
    process.exit(1);
  }

  console.log(`\n⚙️   Granting admin role to ${target.email}...`);

  const { error: insertErr } = await supabase
    .from("user_roles")
    .insert({ user_id: target.id, role: "admin" })
    .select();

  if (insertErr) {
    if (insertErr.code === "23505") {
      console.log("✅  User is already an admin!");
    } else {
      console.error("❌  Failed:", insertErr.message);
      process.exit(1);
    }
  } else {
    console.log(`\n✅  Done! ${target.email} is now an admin.`);
    console.log("    Refresh the app and log in — you'll see the Admin Panel in the sidebar.\n");
  }
}

main();
