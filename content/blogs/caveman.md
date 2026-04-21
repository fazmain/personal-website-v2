---
title: "We Are Compressing Thoughts We Don't Fully Understand."
date: "2026-4-2"
category: "Opinion"
showInHome: true
description: "My take on CoT compresson and why we should be careful."
---

I spend most of my time thinking about what is happening inside language models. Not what they say, but what is actually going on underneath. And lately, some things I read made me think more about a specific thing and I wanted to try to write it down clearly.

The AI community has recently gotten very excited about compressing how models think. There are now clever systems for stripping unnecessary tokens from inputs, and even more sophisticated systems that teach models to compress their own chain of thought mid-generation. These are genuinely impressive pieces of work. But I think they are all, without quite saying so, making an assumption that nobody has verified. And that assumption is actually the central unsolved problem in AI safety.

---

## Two Recent Works

The first piece of work is [Caveman Compression](https://github.com/wilpel/caveman-compression). The idea is simple and elegant: LLMs are very good at predicting missing grammar, articles, and connectives. They can reconstruct "therefore," "however," and "in order to" without being told. So why include them? Talk like a caveman instead. Strip the predictable parts, keep the facts, save the tokens. "In order to optimize the database query, we should consider implementing an index on frequently accessed columns" becomes "Need fast queries. Check which columns used most. Add index." You lose nothing that matters and save anywhere from 20 to 58 percent of your token count.

In the days where each token matters in AI driven coding, this approach is a genius move. It is too simple to be true, yet people have had success trying to use this with Claude Code.

The second is [Memento](https://github.com/microsoft/memento/blob/main/docs/memento.pdf), a recent paper from Dimitris Papailiopoulos and colleagues at Microsoft Research. It does something considerably more ambitious. Instead of compressing what you send to the model, it teaches the model to compress its own chain of thought as it reasons. The model segments its thinking into blocks, writes a dense summary called a memento at each boundary, then masks the original block and reasons forward using only the memento. The result is roughly a sixfold compression of reasoning traces, a two-to-threefold reduction in KV cache usage, and nearly doubled serving throughput.

Both of these are smart engineering solutions to real problems. I have no complaint with the papers themselves. My issue is with the underlying assumption, and it is a safety critical issue.

## The Assumption

Both Caveman Compression and Memento treat the chain of thought as a faithful record of how the model arrived at its answer. Caveman assumes the text you feed into the model faithfully carries meaning. Memento assumes the reasoning trace faithfully represents the steps the model took to get where it got. Compress the record, and you have compressed the thinking.

But **there is now solid evidence that chains of thought in language models are often not faithful at all.** A [2023 paper by Turpin and colleagues](https://arxiv.org/abs/2305.04388) showed that model explanations are frequently post-hoc rationalizations. The model has already, in some sense, "decided" something through whatever computation actually happens in its weights, and the chain of thought is a plausible-sounding story constructed afterward. It correlates with correct answers enough to be useful, which is why we trust it. But correlation with usefulness is not the same as being a true record of the causal process.

If Turpin and colleagues are right (and I think they broadly are), then Memento is compressing a story about reasoning, not reasoning itself. The memento might be a perfectly accurate summary of the story the model told without being accurate to what the model was actually computing underneath. You are making a very efficient representation of something you have not confirmed is real.

Memento's own results hint at this in a way the paper does not fully emphasize. The authors found that when they masked reasoning blocks and removed their KV cache entries, accuracy dropped significantly, more than the memento alone could account for. Information was leaking forward through the KV cache representations even after the blocks were erased. The model was relying on a channel that was not in the explicit token stream at all. That is not a compression artifact. That is evidence that the visible text was never the whole story of what was happening computationally. Compressing the visible text and calling it efficient reasoning compression may be missing the point entirely.

## Why This Actually Matters

I want to be careful here, because the natural reaction is to say: so what? These systems work in practice. The token savings are real. The throughput improvements are real. Why should we care whether the chain of thought is philosophically "faithful" if the outputs are good?

The reason this matters is that we are using the same chain of thought for much more than efficiency. We are using it for oversight. When a model explains its reasoning, safety researchers treat that explanation as evidence about what the model is doing. Evaluators use it to look for misalignment. The entire practice of monitoring model behavior through its outputs rests on the assumption that the output is a window into the computation.

**If the chain of thought is a post-hoc story rather than a faithful trace, then we are, in many cases, asking a model to tell us whether it is safe, and then believing what it says.** That is not a good epistemological position to be in, especially as models get more capable. A more capable model will produce more convincing stories. Compressing those stories more efficiently does not change the underlying problem. It just changes the size of the file.

##  My Argument for Interpretability

This is where I think interpretability becomes not just interesting but necessary. Not as one research direction among many, but as the thing that could actually ground the assumption that everything else is built on.

The point of interpretability research is to look underneath the token stream. To ask the right questions about what was going on 'inside' the 'brain' of the model. There is discourse on the urgency of interpretability, but I am not sure if everyone cares equally. In the race to reach the top in AI capabilities, it is really hard to say how much effort frontier labs are putting on building not *just* capable but *interpretable* models from the ground up. 

If we succeed at creating fully interpretable models, we could compress reasoning in ways where the abstraction won't matter at all. AI systems can come up with their own efficient *language* and talk and think in that language. Faithfulness won't be hurt.

But I want to be clear about this, because I think the interpretability community sometimes overclaims in ways that undermine its own credibility. Understanding model internals is almost certainly a necessary condition for solving alignment. I do not think it is sufficient on its own, at least not in its current form. Currently, The gap between "we identified this circuit" and "we can certify this model is aligned" is large, and we should be honest that we do not yet know how to close it completely.

We should be building on this foundations. Efficient compression is an engineering problem, and everyone should surely put work on making it better. But as we work more on the foundations, with enough effort, hopefully, at a point we won't have to worry about models hiding it's thoughts from us at all.

That's the dream!

---

*The papers I reference here are [Caveman Compression](https://github.com/wilpel/caveman-compression), [Memento](https://github.com/microsoft/memento/blob/main/docs/memento.pdf), and [Turpin et al. on chain-of-thought faithfulness](https://arxiv.org/abs/2305.04388). Anthropic's work on [attribution graphs and circuits](https://transformer-circuits.pub/) is the best entry point into the interpretability research I find most compelling. Dario Amodei's recent post on [the urgency of interpretability](https://darioamodei.com/post/the-urgency-of-interpretability) covers the broader landscape better than I can.*