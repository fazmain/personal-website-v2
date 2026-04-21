---
title: "Just saying it twice makes LLMs better."
date: "2026-3-25"
category: "Research"
showInHome: true
description: "Blog on Google's prompt repetition paper."
---

There is a certain kind of research paper that makes you feel slightly embarrassed for not having thought of it yourself. *Prompt Repetition Improves Non-Reasoning LLMs* by Leviathan, Kalman, and Matias at Google Research is one of those papers. The idea fits in a single sentence: send your prompt to the model twice, back to back, and it will answer better. No extra output tokens. No slower responses. Just better answers.

I read it in one sitting. Then I immediately wanted to try it myself.

---

## What They Did

LLMs are trained to process tokens causally. Each token can only look backward at what came before it. This is fine for generating text. But it creates a subtle problem when your prompt has multiple parts.

Imagine your prompt is structured as `<OPTIONS> <QUESTION>`. By the time the model reads the question, it has already processed the answer choices without knowing what the question was. The early tokens are flying blind. This ordering can quietly hurt performance.

The fix they propose is simple. Instead of sending `<QUERY>`, send `<QUERY><QUERY>`. The same prompt, twice in a row. On the second pass, every token can now attend to every other token. The answer choices know about the question. The question knows about the choices. The attention graph fills in.

The efficiency argument is clean too. This repetition happens during the prefill stage, which is the part of inference that processes your input. Prefill is highly parallelizable. It does not add to the latency a user perceives, because the bottleneck is almost always the sequential token generation that comes afterward.

---

## What They Found

They tested across seven models: Gemini 2.0 Flash and Flash Lite, GPT-4o and GPT-4o-mini, Claude 3 Haiku and Claude 3.7 Sonnet, and DeepSeek V3. Across seven benchmarks, prompt repetition won 47 out of 70 model-benchmark combinations with zero losses.

The biggest gains were on their two custom benchmarks. **NameIndex** asks the model to retrieve a specific name by position from a list of 50 names. **MiddleMatch** asks it to find the element sitting between two given elements in a shuffled list. These tasks require precise localization in the middle of a long context, exactly where causal masking is most restrictive. Gemini Flash-Lite jumped from 21% to 97% accuracy on NameIndex. That is not noise.

They also ran a control: padding the prompt with periods to the same length as the repeated version. Padding changed nothing. The benefit is from the repetition itself, not the extra tokens.

One important nuance: when models are already using chain-of-thought reasoning, prompt repetition is mostly neutral. The authors think this is because reasoning models already re-read and re-state the problem during their thinking process. The repetition becomes redundant.

---

## A Lightweight Replication

I do not have a large compute budget. Running thousands of API calls across seven models is not realistic. But I think the core claims of this paper are testable with this lean setup.

**Pick one open model.** Something like Gemma-2-9B or Llama-3.1-8B, run locally, or Google Colab via `transformers`. The paper's findings were consistent across model families, so there is no strong reason to expect a small open model to behave differently in principle.

**Focus on the striking benchmarks.** NameIndex and MiddleMatch are where the gains were largest. They are also easy to generate programmatically. A short Python script can create lists of random names, pick a target index, and query the model. Running 100 to 200 samples in baseline and repeated-prompt conditions is enough for a McNemar test to say something meaningful.

```python
def make_name_index_prompt(names: list[str], target_index: int) -> str:
    listing = ", ".join(names)
    return f"Here's a list of names:\n{listing}\n\nWhat's the {target_index}th name?"

def repeat_prompt(prompt: str) -> str:
    return prompt + "\n\n" + prompt
```

**Add one multiple-choice benchmark.** Take a subset of ARC or MMLU-Pro, maybe 200 questions, and run them in two orderings: question-first and options-first. Then run both with and without prompt repetition. This gives a 2x2 design that checks whether the benefit of repetition is larger when the ordering is adversarial. The paper predicts it should be.

**What success looks like.** We do not need to reproduce every number. A clean replication establishes three things: baseline accuracy on NameIndex-style tasks is poor, repeated prompts improve it substantially, and length-matched padding does not. If those three hold on one model and one task, the core mechanism is supported. Failure would be interesting too. If the effect does not replicate on smaller open models, that is a real finding.

---

## Building a Mechanistic Study on Top

This is where I am the most interested in extending this research. What can we learn from this behavior from an interpretability point of view?

Here is how I think about it.

The standard story is that prompt repetition helps because the second copy of each token now has access to the full context when building its representation. But I want to know if that story is actually true at the activation level. Does the second occurrence of a word have a measurably different, richer representation than the first occurrence of the same word?

This is a testable question with an open model. Here is an example setup:

**Step one: extract residual stream activations.** For a given prompt, record the hidden states at each layer for each token in the first copy and the corresponding token in the second copy. Then compute the cosine similarity between them. If the hypothesis is right, the second copy should diverge from the first in a systematic way. The representations should not be identical, they should be enriched.

**Step two: look at where the divergence is largest.** My intuition is that tokens in the middle of the sequence will show the biggest shift. These are the tokens most constrained by causal masking in the original prompt. The first token and the last token in a sequence already have roughly the information they need. The middle tokens are the ones flying blind. Repetition should help them most.

This connects directly to the paper's empirical finding. NameIndex and MiddleMatch are hard precisely because the target information sits in the middle of a long list. If middle-sequence tokens show the largest representation shift between the two copies, that would be a mechanistic explanation for why those benchmarks benefit most.

**Step three: ask which attention heads are doing the work.** Not all heads are doing the same thing. Some heads specialize in copying or retrieval. In the repeated prompt setting, which heads are attending from the second copy back to the first? Are there specific heads that light up on the cross-repetition attention? This kind of analysis is tractable with `transformer_lens` or a simple attention hook in Hugging Face.

**Step four: connect to task performance.** The cleanest version of this study would show that the tokens whose representations change most between repetitions are exactly the tokens that determine the correct answer. On NameIndex, that is the target name. You would want to show that the target name's representation in the second copy is more accurately positioned in some relevant feature space. That would close the loop between the mechanistic observation and the behavioral gain.

I am aware this is ambitious for a replication. But I think even step one and step two would be genuinely novel. The paper does not look inside the model at all. It observes behavior and gives a plausible architectural story. Confirming or complicating that story with actual activation analysis would be a real contribution.

There is also a connection here to work on the "lost in the middle" phenomenon, the well-documented finding that LLMs struggle to retrieve information from the middle of long contexts. Prompt repetition might be a lightweight patch for exactly this failure mode. If the mechanistic story holds, it would suggest that the failure is partly about incomplete attention during the prefill pass, not just about memory or positional encoding limits. That reframing would be worth having.

---

## A Closing Thought

What I appreciate most about this paper is how seriously it takes a simple idea. It would have been easy to run two or three experiments, see a small gain, and call it a blog post. Instead, the authors tested across seven models and seven benchmarks, ran ablations, controlled for length, and measured latency empirically. That rigor is what moves something from an interesting observation to a credible result.

The technique is also useful right now, today, with no research context needed. If you are calling an LLM API and your prompt structures options before questions, or asks the model to retrieve something from a long list, copy your prompt and paste it again. See what happens.

I am planning to run a version of this replication and post the results here. I am most curious about the representation-level story. The behavioral results are convincing. But I want to see what the model is actually doing differently when it reads the same words twice.