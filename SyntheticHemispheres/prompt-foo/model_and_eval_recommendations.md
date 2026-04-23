# Model & Eval Recommendations for Rush Trivia

## 1. Model Recommendations

Your current config uses **Gemini 2.5 Flash** and **GPT-5 Mini**. Here's the
landscape of cost-effective "mini" models worth testing:

### Pricing Comparison (per 1M tokens)

| Model | Provider ID | Input | Output | Best For |
| :--- | :--- | ---: | ---: | :--- |
| **GPT-4.1-mini** | `openai:gpt-4.1-mini` | $0.40 | $1.60 | Best OpenAI mini — strong reasoning at low cost |
| **GPT-4.1-nano** | `openai:gpt-4.1-nano` | $0.10 | $0.40 | Ultra-cheap — great for cost baseline |
| **Gemini 2.5 Flash** | `google:gemini-2.5-flash` | $0.30 | $2.50 | Already in your config — strong reasoning |
| **Gemini 2.5 Flash Lite** | `google:gemini-2.5-flash-lite` | $0.10 | $0.40 | Ultra-cheap Google option — speed king |

### My Recommendations

> **Tip:** **Drop GPT-5 Mini** and replace it with
> **GPT-4.1-mini** -- it's newer, cheaper, and benchmarks
> better on factual Q&A. Add **GPT-4.1-nano** and
> **Gemini 2.5 Flash Lite** as ultra-budget contenders.

**Proposed 4-model eval:**

| Model | Why Include |
| :--- | :--- |
| **Gemini 2.5 Flash** (keep) | Your current strong performer — acts as the quality baseline |
| **GPT-4.1-mini** (new) | Best-in-class mini from OpenAI — likely your quality winner |
| **GPT-4.1-nano** (new) | 4× cheaper than GPT-4.1-mini — test if quality holds for factual Q&A |
| **Gemini 2.5 Flash Lite** (new) | Same price tier as nano — head-to-head ultra-budget comparison |

> **Important:** If you want to keep costs **minimal**,
> you could run just **GPT-4.1-mini** +
> **Gemini 2.5 Flash Lite** (2 models). This gives you
> one quality model and one budget model from each
> provider.

---

## 2. Cost Projections

### Estimated tokens per eval run

- ~44 test cases (39 existing + 5 new Anika Nilles)
- ~300 input tokens per test (context + question + system prompt)
- ~150 output tokens per answer
- **Total per model:** ~13,200 input tokens + ~6,600 output tokens

### Cost per full eval run

| Model | Input Cost | Output Cost | **Total** |
|:---|---:|---:|---:|
| Gemini 2.5 Flash | $0.004 | $0.017 | **$0.021** |
| GPT-4.1-mini | $0.005 | $0.011 | **$0.016** |
| GPT-4.1-nano | $0.001 | $0.003 | **$0.004** |
| Gemini 2.5 Flash Lite | $0.001 | $0.003 | **$0.004** |
| | | **4-model total:** | **~$0.045** |

> **Note:** A full 4-model eval costs roughly
> **4-5 cents**. Even running it 10 times for iteration
> would be under **$0.50**. Cost is negligible here --
> the factuality grading model (used by promptfoo's
> `factuality` assert) will be the bigger expense.

---

## 3. New Anika Nilles Eval Questions

Five questions covering **basic, well-established facts** — not esoteric trivia:

| # | Topic | Why It Matters |
|:---|:---|:---|
| 1 | Where is Anika Nilles from? | Basic bio — tests nationality/hometown |
| 2 | What is her educational background? | Popakademie degree — distinctive fact |
| 3 | Name her solo albums | Discography knowledge |
| 4 | How did she gain fame? | YouTube viral drumming videos |
| 5 | Who did she tour with before Rush? | Jeff Beck connection — establishes credibility |

---

## 4. Summary of Changes

### Files to modify

- **`promptfooconfig.yaml`** — Update providers list, description
- **`rush_full_eval.jsonl`** — Append 5 new Anika Nilles test entries

### API keys needed

- `OPENAI_API_KEY` — for GPT-4.1-mini and GPT-4.1-nano
- `GOOGLE_API_KEY` — for Gemini 2.5 Flash and Flash Lite (via AI Studio)
