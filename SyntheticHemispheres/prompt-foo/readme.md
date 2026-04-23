# Rush Trivia — promptfoo Evaluation Guide

This directory contains the [promptfoo](https://www.promptfoo.dev/) evaluation
suite for the Rush rock-trivia project. It compares multiple LLM providers
on factual accuracy using a curated set of 44 trivia questions.

---

## Prerequisites

| Requirement | Details |
| :--- | :--- |
| **Node.js** | `v20.20.0+` or `v22.22.0+` |
| **API keys** | `OPENAI_API_KEY` and `GOOGLE_API_KEY` set in the project root `.env` file |

Install promptfoo globally (recommended):

```bash
# Global install
npm install -g promptfoo

# Verify installation
promptfoo --version
```

---

## Quick Start

```bash
# 1. Navigate to this directory
cd "<repo_root>/SyntheticHemispheres/prompt-foo"

# 2. Run the evaluation (using root .env)
promptfoo eval --env-file "<path-to-root-of-repo>/.env"

# 3. View results in the browser UI
promptfoo view
```

That's it — promptfoo reads `promptfooconfig.yaml` automatically and runs every
test in `rush_full_eval.jsonl` against the configured providers.

---

## CLI Command Reference

### `promptfoo init`

Scaffold a new `promptfooconfig.yaml` in the current directory. Useful if you're
starting a fresh eval from scratch.

```bash
promptfoo init
```

### `promptfoo eval`

Run the evaluation defined in `promptfooconfig.yaml`. This is the primary
command you'll use.

```bash
# Basic run (reads promptfooconfig.yaml in cwd)
promptfoo eval

# Use a specific config file
promptfoo eval --config path/to/config.yaml

# Save results to a file (JSON, CSV, YAML, or HTML)
promptfoo eval --output results.json

# Increase verbosity for debugging
promptfoo eval --verbose
```

> **Tip:** Our config already sets `outputPath: gemini-2.5-flash_gpt-4.1-mini.json`,
> so results are saved automatically on every run.

### `promptfoo view`

Launch the local web UI to explore, compare, and drill into evaluation results.

```bash
promptfoo view
```

### `promptfoo validate`

Check your `promptfooconfig.yaml` for schema or structural errors *before*
spending tokens on an eval run.

```bash
promptfoo validate
```

### `promptfoo cache clear`

Clear the local response cache. Useful when you want to force fresh API calls
(e.g., after changing a provider's system prompt).

```bash
promptfoo cache clear
```

### `promptfoo list`

List previously saved evaluations, prompts, or datasets.

```bash
promptfoo list evals
promptfoo list prompts
promptfoo list datasets
```

### `promptfoo show <id>`

Display the details of a specific evaluation by its ID (get IDs from
`promptfoo list evals`).

```bash
promptfoo show <eval-id>
```

### `promptfoo share`

Upload the latest evaluation to promptfoo's cloud and get a shareable URL.

```bash
promptfoo share
```

### `promptfoo export`

Export evaluation records or logs to a file.

```bash
promptfoo export --output export.json
```

---

## Project Files

| File | Purpose |
| :--- | :--- |
| `promptfooconfig.yaml` | Main config — defines the prompt template, providers, assertion type, and test source |
| `rush_full_eval.jsonl` | 44 test cases (JSONL) with `question`, `context`, and `ground_truth` fields |
| `model_and_eval_recommendations.md` | Cost analysis and model-selection rationale |
| `rush_eval_rationale.md` | Rationale behind the evaluation dataset additions |

---

## Configuration Overview

The current `promptfooconfig.yaml` is set up as follows:

```yaml
# Providers under test
providers:
  - id: google:gemini-2.5-flash
  - id: openai:gpt-4.1-mini

# Assertion strategy
defaultTest:
  assert:
    - type: factuality
      value: "{{ground_truth}}"

# Test data source
tests:
  - rush_full_eval.jsonl
```

Each test case in the JSONL file supplies three variables to the prompt:

- **`context`** — the reference passage the model should use
- **`question`** — the trivia question
- **`ground_truth`** — the expected answer (used by the `factuality` assertion)

---

## Common Workflows

### Run a quick sanity check

```bash
promptfoo validate && promptfoo eval
```

### Compare results across models side-by-side

```bash
promptfoo eval --output results.json
promptfoo view
```

### Re-run without cache (fresh API calls)

```bash
promptfoo cache clear
promptfoo eval
```

### Output results as CSV for spreadsheet analysis

```bash
promptfoo eval --output results.csv
```

---

## Environment Variables

promptfoo reads API keys from standard environment variables:

| Variable | Used by |
| :--- | :--- |
| `OPENAI_API_KEY` | GPT-4.1-mini (and GPT-4.1-nano if added) |
| `GOOGLE_API_KEY` | Gemini 2.5 Flash (and Flash Lite if added) |

Set them in your shell, or add them to the project's `.env` file in the repo
root.

---

## Further Reading

- [promptfoo Documentation](https://www.promptfoo.dev/docs/intro)
- [Configuration Reference](https://www.promptfoo.dev/docs/configuration/reference)
- [Assertion Types](https://www.promptfoo.dev/docs/configuration/expected-outputs)
- [CLI Reference](https://www.promptfoo.dev/docs/usage/command-line)
