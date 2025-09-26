import { exec as _exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const exec = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    const child = _exec(cmd, { env: process.env }, (err) => {
      if (err) reject(err);
      else resolve();
    });
    child?.stdout?.pipe(process.stdout);
    child?.stderr?.pipe(process.stderr);
  });

async function brandProfileMissing() {
  const p = path.join(process.cwd(), "workspace", "brand", "brand_profile.json");
  try { await fs.access(p); return false; } catch { return true; }
}

async function main() {
  console.log("▶️  Lesson pipeline start");

  if (await brandProfileMissing()) {
    console.log("ℹ️  No brand profile found. Running brand:learn once.");
    await exec("npm run brand:learn");
  } else {
    console.log("✔️  Brand profile found. Skipping brand:learn.");
  }

  console.log("▶️  Build draft");
  await exec("npm run course:build");

  console.log("▶️  Revise and fact check");
  await exec("npm run course:revise");

  console.log("▶️  Create marketing assets");
  await exec("npm run marketing:run");

  console.log("▶️  Run quick evaluation");
  await exec("npm run eval:run");

  console.log("\n✅ Done. Open `workspace/approved/` for the lesson.");
  console.log("   Marketing assets in `workspace/marketing/`.\n   Eval in `workspace/eval/`.\n");
}

main().catch((e) => {
  console.error("❌ Pipeline failed:", e?.message || e);
  process.exit(1);
});