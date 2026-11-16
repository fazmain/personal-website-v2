---
title: "AI Safety Field-Building Is Flying Blind"
date: "2026-11-16"
category: "Opinion"
showInHome: true
description: "The field spends hundreds of millions a year on talent programs with almost no comparison-group evidence. A proposal for an independent organization to measure what works."
---

AI safety now spends hundreds of millions of dollars a year bringing new people into the field. Almost none of that spending has been evaluated against a comparison group, so we don't know which programs work, for whom, or why.

I think the field needs an independent organization whose job is to find out. I want to start it. This post lays out the gap, what the organization would do, and how I'd begin.

**Epistemic status.** I'm confident the field lacks independent, cross-program outcome data, and moderately confident this is costing real decisions, especially in grantmaking. I'm least sure whether I'm the right person to fix it, which is why I'm asking for critique before starting. The core diagnosis isn't mine: Laura Thomas-Walters' audit of 17 talent programmes ([EA Forum, Sept 2026](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)) made it first, and this post builds on it. What I add is an argument for who should do the work, and a plan.

## The money is scaling. The evidence isn't.

AI safety is spending more on talent than ever, and fast:

- **Funders.** Coefficient Giving says it committed $351M across technical AI safety, security and fieldbuilding in 2025, and expects to move around $1B in AI grantmaking in 2026. Longview directed over $60M in 2025; SFF's 2026 main round recommended about $63M. ([Manifund AI Safety Funder Bulletin](https://manifund.org/ais-funder-bulletin), as of Nov 2026)
- **Talent programs specifically.** At least $70M has gone into AI safety talent programmes, a figure built from just four organizations' accounts and likely a large underestimate ([Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)). Kairos, home of SPAR, raised $50M from Coefficient Giving for two years ([Kairos](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for)). BlueDot has raised $71M in total and had made about $9.15M in grants across 1,276 grants by November 2026 ([Manifund bulletin](https://manifund.org/ais-funder-bulletin)).
- **Demand from applicants.** SPAR received 6,000 applications this round, up from 2,400 six months earlier, and expects to accept over 500 mentees ([Kairos](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for)). MATS received 2,210 completed applications for its Summer 2026 cohort, up from 1,296 the cohort before ([MATS selection analysis](https://mats-selection-analysis.pages.dev/part_c/C7/report.html)), and now runs three cohorts a year.

We have surprisingly little idea which parts of this work, for whom, and why.

That isn't because program staff don't care. Many publish thoughtful retrospectives. It's because the questions that matter most can't be answered from inside any single program. They're about how people move between programs, and about the people who don't make it into any of them.

## Questions nobody can currently answer

Here are some questions I think the field should be able to answer, and as far as I can tell, can't:

- **What happens to people who are rejected from every major fellowship?** Do they keep going independently, find another route, or leave?
- **Where do people most often stall?** After a course, after a first project, after a fellowship ends?
- **Which sequences of programs actually lead to sustained research careers?** Is BlueDot, then a hackathon, then SPAR, then MATS a ladder, or just a common path?
- **Do people who do several fellowships progress, or circle?**
- **What predicts success among people below the selection bar?** Fellowships know a lot about who does well among the people they admit. Almost nobody knows anything about the people they didn't.
- **Which inputs matter most at which stage?** Funding, mentorship, collaborators, visibility, or taste?

Every one of these has a real decision riding on it. Which program should a funder expand? Should a fellowship take 70 people instead of 60? Should someone rejected twice keep applying or try something else? These questions have been asked publicly before. Chris Clay, who built the largest alumni dataset in the field, asked in January 2024 what proportion of people would have entered AI safety without a given fellowship. As far as Thomas-Walters could tell, nobody has studied it since ([Clay](https://www.lesswrong.com/posts/8p2vmQWQbt55qwq98/where-do-ai-safety-fellows-go-analyzing-a-dataset-of-600); [Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)).

## What we have, and why it isn't enough

There's real work here, and I want to be fair to it. Here is roughly what's public:

| Source | What it reports | Main limitation |
| --- | --- | --- |
| [MATS alumni survey](https://www.lesswrong.com/posts/jeBkx6agMuBCQW94C/mats-alumni-impact-analysis) | 80% of pre-2025 alumni work in AI safety; 10% founded orgs or teams. 78% said their publication "possibly" or "probably" wouldn't have happened without MATS | 46% response rate; no comparison group |
| [MATS selection analysis](https://mats-selection-analysis.pages.dev/) | Summer 2026: 2,203 applications, 126 offers (5.7%). Application features explain at most \~25% of the variance in mentor evaluations | Internal to one program |
| [ML4Good impact assessment](https://forum.effectivealtruism.org/posts/t8tZMxQonL4Q2zh3W/ml4good-impact-assessment) | 180+ alumni in AI safety (\~135 FTE), about half counterfactual, \~£9.3k per counterfactual FTE; 66% response rate | Self-reported counterfactuals; comparison group promised for next cohort |
| [Arb's AI Safety Camp assessment](https://www.longtermwiki.com/resources/9de14d6a0b6b0ea6) | 5–10% of participants plausibly became researchers because of AISC, at $12–30K each | Commissioned by the program; survey-based |
| [Clay's alumni dataset](https://www.lesswrong.com/posts/8p2vmQWQbt55qwq98/where-do-ai-safety-fellows-go-analyzing-a-dataset-of-600) | 600+ alumni of 9 late-stage fellowships; >10% did another fellowship afterward; \~80% still in AI safety | Alumni only; counterfactual left open |
| [Kairos retrospective](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for) | \~80 people in full-time core AI safety roles after Kairos programs | Self-described "shallow"; no comparison |
| BlueDot | "25% of our graduates land impactful roles within six months" | No definition, denominator or method published ([per Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)) |

The most systematic look across all of this is Thomas-Walters' audit of 17 programmes, including MATS, ARENA, SPAR, BlueDot, Apart, AI Safety Camp and Anthropic Fellows. Of the 17:

- **0** have published any comparison group, rejected-applicant follow-up, matched control or randomisation
- **0** pre-specified outcome metrics before a cohort ran
- **2** publish a response rate for the survey behind their outcome claims
- **1** publishes a fully loaded cost per outcome

One detail in the MATS survey shows why this matters: 30% of alumni said they would have done the program with no stipend at all. As Thomas-Walters puts it, people that motivated are the people most likely to have found their way into the field anyway. Without a comparison group, a program can end up reporting its selection as if it were its effect.

Almost everything we know comes from the people who got in. The people who could tell us most about where the pipeline leaks are the ones nobody follows up with. Every one of these programs rejects most applicants, scores them, and keeps their contact details. That's a ready-made comparison group nobody has used.

## Why the existing efforts don't close the gap

This isn't a gap programs can close by trying harder. It's structural, and several people already working on it have said as much.

**No program can see across programs.** MATS can see MATS. SPAR can see SPAR. Nobody can see the person who took a BlueDot course, did two Apart hackathons, was rejected from MATS twice, did a SPAR project, then took a software job. Cross-program questions need cross-program data, and pooling also solves a statistical problem: most cohorts are too small for a near-miss comparison on their own, which is why Thomas-Walters recommends a joined-up approach across programmes.

**Programs evaluating themselves have a conflict of interest.** MATS is hiring a [program impact analyst](https://www.matsprogram.org/careers/program-impact-analyst), which is good. But its co-executive director, Ryan Kidd, wrote under Thomas-Walters' post that he would fund a "GiveWell for AI safety" himself if not for the obvious conflict of interest ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=dRrDKzSQYoNdLuLHT)).

**Funder evaluations stay private.** Kidd also noted that Coefficient Giving has run detailed internal investigations of MATS's impact that were never published ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=xoMBCgznK2EJrB7nE)). That helps one funder. It doesn't help other funders, programs trying to improve, or applicants deciding where to spend their time.

**The closest infrastructure is built for routing, not measurement.** Kairos is building Talent Commons, a consent-first database of program participants and job applicants, currently piloted with US fieldbuilding orgs. Its main goal is helping organizations find and refer talent; impact tracking is listed as a possible future use ([Kairos](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for)). That's valuable, and an outcome study could use it. But it's operated by the organization that also runs SPAR, one of the larger programs being evaluated.

**People with money have said they want this and can't find the people to do it.** Manifund's Austin Chen said he'd like to do or fund a "GiveWell for AI safety" but that the talent is scarce ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=S7DFJyBoxfwYR8EQJ)). Coefficient Giving has said it's considering an internal project to set and share clearer outcome standards (quoted by [Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)).

So the demand is stated, the study design exists, and the data sits in program spreadsheets. What's missing is a neutral organization whose only job is to run it.

## The proposal

An independent organization that measures what works in AI safety talent development, starting with the stage nobody measures: early-career people, including those who don't get in.

Not another program. A measurement layer for all of them.

Concretely, it would do five things:

1. **Run the near-miss study.** Thomas-Walters proposed a regression discontinuity design: compare applicants just above and just below each program's acceptance cutoff. Selection near the line is noisy, so those two groups are close to comparable. Pooled across consenting programs, with outcomes defined in advance and coded blind, this is the cheapest credible estimate of what programs actually add.
2. **Follow up with non-admits.** The people rejected from everything are the natural comparison group, and the people most likely to show where the pipeline leaks.
3. **Ask employers, not just participants.** A placement is only new capacity if the person wouldn't have got there anyway *and* the employer couldn't have hired someone equally good. Thomas-Walters notes that no audited programme has published anything on that second question. Asking hiring managers at the point of hire who else was in their final set is close to a one-question survey.
4. **Offer a shared outcome framework.** A common set of definitions any program can adopt, so results are comparable instead of every program inventing its own "working in AI safety."
5. **Answer specific decisions.** Analyses aimed at choices people actually face, such as whether to expand a cohort, which stage a marginal grant should fund, or what predicts success among near-miss applicants.

## Theory of change

The chain is short, and every link depends on an assumption that could fail.

![Theory of change: Collect, then Analyze, then Uptake, then Impact. Collect assumes people and programs will share data. Analyze assumes signal survives small, biased samples. Uptake, the weakest link, assumes decision-makers act on the evidence. Impact assumes constraints are partly informational.](/images/flying-blind-theory-of-change.svg)

The link I'm least sure of is uptake. Collecting data and analyzing it are mostly a matter of doing the work carefully. Getting programs and funders to change what they do because of it is a different problem, and it's where a lot of evaluation work quietly dies. Most of the design choices in the next section are about protecting that link.

## Why this makes grantmaking easier

The best argument for this organization might be that it helps the field's scarcest resource: grantmakers.

Coefficient Giving's Luke Muehlhauser wrote in May that philanthropists hope to deploy tens of billions of dollars in AI safety and governance over the next several years, but that most of this capital is bottlenecked on a tiny number of people who can vet funding opportunities. He adds that hiring one fewer grantmaker usually means millions sit in an account for another year ([lukeprog](https://forum.effectivealtruism.org/posts/B6d8Wzk4gNzHsXvdi/ai-safety-is-extremely-bottlenecked-on-grantmakers)). One commenter on that post estimated roughly 50 full-time AI safety grantmakers worldwide.

Right now, each of those grantmakers evaluates talent programs mostly from self-reported surveys, one program at a time. Shared outcome data acts as a multiplier on their time. It makes each decision faster and better, and it lets smaller funders without in-house evaluation capacity fund talent work with some confidence. Thomas-Walters makes the related point that a near-miss comparison gives exactly the number a funder needs at the margin, such as whether a program should take 70 people instead of 60.

The spending side is already becoming visible: Manifund's [Trace](https://trace.manifund.org) tracks about $3.5B of AI safety funding across 4,900+ grants. What's missing is the outcomes side.

## The hard problems

An organization that tracks people's careers could go badly wrong. Here's what I think the hard problems are, and how I'd try to handle them.

**Access.** Programs have good reasons not to hand over applicant data: privacy law (GDPR for European applicants), applicants who never consented to it, and the risk that their numbers look bad. I don't expect access on day one. It has to be earned with a track record, which is why the plan below starts with data that needs nobody's permission.

**Privacy and consent.** Everything individual would be opt-in. Individual records stay private. What gets published is aggregate. And it should never become a service for looking people up before hiring them.

**Giving something back.** People shouldn't feel surveilled. If you share your path, you should get something for it: a picture of how your route compares to others', what tended to help people at your stage, and, if you want, more visibility to programs and employers.

**Who pays.** Programs are usually too stretched to pay for evaluation, so funders are the likely source. That creates the auditor problem from earlier. My answer is a clear public policy: no program is ranked publicly without its consent, findings go to programs before they go anywhere else, and the organization's goal is to help programs improve, not to grade them.

**Uptake.** Plenty of evaluation work produces good reports nobody acts on. The defense is to start from decisions, not data: ask a program or funder what they're trying to decide, then go find out.

**Assessments that follow people around.** A commenter on the Kairos announcement raised a risk I take seriously: once assessments from SPAR, MATS or hiring rounds become reusable across organizations, one noisy judgement of a 20-year-old can follow them through the whole ecosystem ([comment](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for?commentId=sSQCgoFq9Bdh2LXKK)). Early ratings really are noisy: in one retrospective of 60 junior AI safety researchers, the two strongest performers had initially been rated "somewhat above average" and "below average" ([LawrenceC](https://www.lesswrong.com/posts/HACcn8roty9KBAWzZ/evaluations-of-new-ai-safety-researchers-can-be-noisy)). That's an argument for keeping outcome research separate from any database used to screen people. This organization would study cohorts and publish aggregates. It would never share individual scores.

**Small samples.** Cohorts are small, and a study powered to detect only large effects risks concluding that a program doesn't work when it does. Commenters on Thomas-Walters' post raised exactly this ([Rory Fenton](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=gbzD2A5MhqTFJ4pA5)). The answers are pooling across programs, running power calculations before collecting data, and pre-registering an equivalence test rather than treating a non-significant result as "no effect."

**Long tails.** Much of a program's impact may come from its top few participants, and a near-miss design only measures the effect at the margin. Thomas-Walters' reply is that the most impressive applicants are also the most likely to have made it anyway, so the margin may be where the causal effect is largest. Either way, the study should say clearly what it measures.

## How I'd start

I don't think this should start as an organization. It should start as a few pieces of work that show whether it deserves to be one.

1. **Partner, don't duplicate.** I'd start by asking Thomas-Walters, who offered publicly to help design a study, and the Talent Commons team how this fits with what they're doing. If there's an existing home for this work, I'd rather join it.
2. **A pooled near-miss study.** Recruit two or three programs willing to share application scores and decisions under a documented consent or legitimate-interests basis. Pre-register outcomes, for example full-time AI safety work 18 months after the decision. Code outcomes blind to admission status. Thomas-Walters suggests outcomes like these are largely observable from public sources.
3. **A survey of people who didn't get in.** Opt-in, anonymous where people want it, open to anyone rejected from an AI safety program. Plus a set of interviews about what happened next. This needs no program's permission, and it's the data nobody has.
4. **Extend the public data.** Add publication outcomes to Clay's alumni dataset using an arXiv pipeline I've already built for mapping AI safety research.
5. **Then decide.** If this work changes someone's decision, that's the case for an organization. If it doesn't, that's worth knowing too.

## Objections

**"Kairos's Talent Commons already does this."** Talent Commons is built to route people to roles and programs, and it's run by an organization that also runs a major program. An outcome study could draw on it, and I'd want to work with them. But measuring whether programs work is a different job, and it needs a party with no stake in the answer.

**"Coefficient Giving already evaluates this internally."** Probably true, and Kidd says it has. But those analyses aren't public, so they can't help other funders, programs or applicants, and they can't be checked. Coefficient has also said it's considering a project to set shared outcome standards. I'd much rather it fund an independent group to do that than build it in-house, and I'd like to hear its view.

**"This needs deep AI safety strategy expertise, not just data analysis."** This is Kidd's strongest point: much of the impact of AI safety work is hard to observe in the near term, and near-term proxies can mislead ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=dRrDKzSQYoNdLuLHT)). I agree, which is why I'd start with modest, observable outcomes like career moves, time to first role and publications, and leave judgments about research value to an advisory group with that expertise.

**"Funders don't need more junior talent anyway."** Some reviews argue that talent needs are shifting toward seniority, and estimate 2,000–2,500 fellows will graduate from research programs in 2026 alone ([Żurek](https://forum.effectivealtruism.org/posts/NrYkhgh6ZGrGtxxnc/talent-constraints-in-ai-safety-what-we-know-and-what-we-don)). If that's right, it strengthens the case for measurement: it would mean the field is spending heavily on a part of the pipeline that may be oversupplied, without being able to check.

**"Data won't change decisions."** This is the objection I worry about most. My only answer is to design every analysis around a decision someone has told me they face, and to stop if the work isn't changing anything.

**"Why you?"** Fair, for someone early in their career. I'm inside the gap I'm describing, I've built data pipelines for mapping AI safety research, and I'm proposing to start with cheap work that either earns trust or doesn't. The evaluation-methods side should come from partners with that training.

## What I'm asking for

- **If you applied to an AI safety program and didn't get in**, I want to hear what happened next.
- **If you run a program**, I'd like to know what you wish you knew about your applicants and alumni.
- **If you think this is a bad idea**, I especially want to hear why, before I spend a year on it.
- **If you're already working on something like this**, let's talk.

You can reach me through the contact details on my [about page](/about).

## Sources

- Laura Thomas-Walters, [Do AI safety talent programmes work? Nobody has run the study that would tell us](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study) (EA Forum, Sept 2026), and its [audit spreadsheet](https://docs.google.com/spreadsheets/d/1lLMJjsilZ5UTCnFGIHISj9ckuyz6GQS3MABzPsg7k2A/edit?gid=1560212863#gid=1560212863)
- Kairos, [Kairos has raised $50M to build talent infrastructure for AI safety](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for) (Sept 2026)
- Manifund, [AI Safety Funder Bulletin](https://manifund.org/ais-funder-bulletin) (as of Nov 2026) and [Trace](https://trace.manifund.org)
- Luke Muehlhauser, [AI safety is extremely bottlenecked on grantmakers](https://forum.effectivealtruism.org/posts/B6d8Wzk4gNzHsXvdi/ai-safety-is-extremely-bottlenecked-on-grantmakers) (May 2026)
- MATS, [fellow selection analysis](https://mats-selection-analysis.pages.dev/) and [alumni impact analysis](https://www.lesswrong.com/posts/jeBkx6agMuBCQW94C/mats-alumni-impact-analysis)
- MATS, [AI safety talent needs in 2026](https://www.lesswrong.com/posts/sdox3KhyFbLSwPwum/ai-safety-talent-needs-in-2026-insights-for-field-building)
- ML4Good, [Impact assessment](https://forum.effectivealtruism.org/posts/t8tZMxQonL4Q2zh3W/ml4good-impact-assessment)
- Arb Research, [Impact assessment of AI Safety Camp](https://www.longtermwiki.com/resources/9de14d6a0b6b0ea6) (Jan 2024)
- Chris Clay, [Where do AI safety fellows go? Analyzing a dataset of 600+ alumni](https://www.lesswrong.com/posts/8p2vmQWQbt55qwq98/where-do-ai-safety-fellows-go-analyzing-a-dataset-of-600)
- Weronika Żurek, [Talent constraints in AI safety: what we know and what we don't](https://forum.effectivealtruism.org/posts/NrYkhgh6ZGrGtxxnc/talent-constraints-in-ai-safety-what-we-know-and-what-we-don)
- LawrenceC, [Evaluations of new AI safety researchers can be noisy](https://www.lesswrong.com/posts/HACcn8roty9KBAWzZ/evaluations-of-new-ai-safety-researchers-can-be-noisy)
