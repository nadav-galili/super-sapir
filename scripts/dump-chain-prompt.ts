// Dump the exact payload + prompts used for the chain (trade-manager) AI insight.
// Run: bun run scripts/dump-chain-prompt.ts
// Output: scripts/out/chain-prompt.json  (system + user + payload, ready to paste into Workbench)

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildChainInsight } from "../src/lib/ai/builders";

const { systemPrompt, userPrompt, payload, cacheKey } = buildChainInsight();

const outPath = resolve(import.meta.dir, "out/chain-prompt.json");
mkdirSync(dirname(outPath), { recursive: true });

writeFileSync(
  outPath,
  JSON.stringify({ cacheKey, systemPrompt, userPrompt, payload }, null, 2),
  "utf8"
);

// Also write separate files for easy copy-paste into the Workbench.
writeFileSync(
  resolve(dirname(outPath), "chain-system.txt"),
  systemPrompt,
  "utf8"
);
writeFileSync(resolve(dirname(outPath), "chain-user.txt"), userPrompt, "utf8");
writeFileSync(
  resolve(dirname(outPath), "chain-payload.json"),
  JSON.stringify(payload, null, 2),
  "utf8"
);

console.log(`Wrote:
  ${outPath}
  ${resolve(dirname(outPath), "chain-system.txt")}
  ${resolve(dirname(outPath), "chain-user.txt")}
  ${resolve(dirname(outPath), "chain-payload.json")}`);
