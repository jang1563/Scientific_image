import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
execFileSync("tsc", ["-p", "tsconfig.npm.json"], { stdio: "inherit" });
