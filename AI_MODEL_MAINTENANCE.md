# AI Model Maintenance and Deprecation Tracker

This document tracks AI model deprecation dates, lifecycle milestones,
and required updates for the Rush Rock Trivia and Tour Concierge service.

---

## 1. Pending Model Retirements

### OpenAI `gpt-5.4-nano` Deprecation Notice

- **Config Location**: `functions/constants.ts` (`OPENAI_MODEL`)
- **Status**: Deprecated by OpenAI
- **Official API Shutdown Date**: **April 1, 2027**
- **Action Required Before April 2027**:
  1. Review OpenAI's active model catalog for the recommended
     lightweight/sub-agent successor (e.g., newer nano/mini generation).
  2. Test candidate replacement models using promptfoo
     (`promptfooconfig.yaml`). Ensure the model strictly supports
     structured JSON outputs (`strict: true`).
  3. Update `OPENAI_MODEL` in `functions/constants.ts`.
  4. Verify latency and JSON output fidelity against `/api/trivia`
     and `/api/chat`.

---

## 2. Model Reference Table

| Provider | Model Identifier | Role | Lifecycle / Retirement |
| --- | --- | --- | --- |
| Google | `gemini-3.7-flash` | Active Live Provider (`USE_OPENAI = "false"`) | Current active release |
| OpenAI | `gpt-5.4-nano` | Secondary / Fallback Provider | **Retires April 1, 2027** (Action required) |
| OpenAI | `gpt-4.1-mini` | Legacy benchmark reference | Retires April 14, 2027 |

---

## 3. Maintenance Procedure

When updating the OpenAI model:

1. Update the constant in `functions/constants.ts`:

   ```typescript
   export const OPENAI_MODEL = '<new-model-id>';
   ```

2. Run local tests and build verification:

   ```bash
   npm run build
   ```

3. Commit and deploy:

   ```bash
   git commit -m ":wrench: config: update OPENAI_MODEL to <new-model-id>"
   git push origin main
   npm run pages:deploy
   ```
