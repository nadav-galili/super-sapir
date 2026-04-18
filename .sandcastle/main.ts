import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

await run({
  agent: claudeCode("claude-opus-4-7"),
  sandbox: docker(),
  promptFile: "./.sandcastle/prompt.md",
  hooks: {
    onSandboxReady: [{ command: "bun install" }],
  },
  maxIterations: 10,
  idleTimeoutSeconds: 900,
});
