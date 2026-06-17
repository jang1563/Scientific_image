import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });

const tsc = spawnSync("tsc", ["-p", "tsconfig.npm.json"], { stdio: "inherit" });
if (tsc.error) {
  console.error(JSON.stringify({
    ok: false,
    command: "tsc -p tsconfig.npm.json",
    error: tsc.error.message,
    nextAction: "Install npm package tooling, then rerun `node scripts/build-npm-package.ts`. The no-install reviewer path remains `node scripts/reviewer-status.ts`."
  }, null, 2));
  process.exitCode = 1;
} else if (typeof tsc.status === "number" && tsc.status !== 0) {
  process.exitCode = tsc.status;
}
