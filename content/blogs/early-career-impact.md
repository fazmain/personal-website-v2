---
title: "The Case for an Independent Evaluator of AI Safety Talent Programs"
date: "2026-11-10"
category: "Opinion"
showInHome: true
description: "AI safety spends heavily on early-career talent programs, but nobody independently measures which ones work. A proposal for an organization that does."
---

## TL;DR

- AI safety is spending a lot on early career talent development, but there are no independent impact assessments of these programs.
- So we don't know which programs work, why they work, or for whom they work.
- For this, I propose an independent organization that measures impact across programs for early career researchers, understands the problems, and tries to find ways to make early career talent management better.

## The problem

It is pretty clear at this point that we need more people than ever to pivot to AI safety. There are arguments for and against the nature of this urgent call, but I think much of the criticism comes from the fact that the field's talent pipelines are not well defined. The field also argues that we need more generalists, and I somewhat agree with that too.

There have been heavy rounds of recent funding to bring more people into the field, but there are no evaluations of how well those organizations are working, and especially of how each organization's impact carries over to the broader field. As a result, we don't know which programs work, why they work, and how well they work.

In [her post](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study), Laura Thomas-Walters audits 17 talent programmes and finds that none of the 17 has published a comparison group, a follow-up of rejected applicants, or a matched control. In this post, I argue for an independent data and impact-measurement organization that helps the field grow faster and develop and route more talent.

## There is demand and funding

Coefficient Giving says it committed $351M across technical AI safety, security and fieldbuilding in 2025, and it expects to move around $1B in AI grantmaking in 2026 ([Manifund AI Safety Funder Bulletin](https://manifund.org/ais-funder-bulletin)). The change this year has also been noticeable, as many fieldbuilding and early-career organizations have received funding: Kairos raised $50M from Coefficient Giving ([Kairos](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for)), and BlueDot has raised $71M in total ([Manifund bulletin](https://manifund.org/ais-funder-bulletin)).

Demand is also growing. SPAR received 6,000 applications in its latest round, up from 2,400 six months earlier ([Kairos](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for)). MATS received 2,210 completed applications for its Summer 2026 cohort, up from 1,296 the cohort before ([MATS selection analysis](https://mats-selection-analysis.pages.dev/part_c/C7/report.html)). Many fellowship programs are trying hard to increase both the number of cohorts per year and the number of mentees per cohort.

Some argue that the field has too many junior researchers. One review estimates 2,000–2,500 fellows will graduate from research programs in 2026 alone ([Żurek](https://forum.effectivealtruism.org/posts/NrYkhgh6ZGrGtxxnc/talent-constraints-in-ai-safety-what-we-know-and-what-we-don)). This gives us another reason to measure the impact, and to find out whether the field is spending heavily on a part of the pipeline that may be oversupplied.

## But nobody can see what's working

However, we don't have much idea of what is actually working, either for developing early talent or for helping people move to the next step. There are clear entry pathways, like BlueDot's courses and Apart Research's hackathons. But because no one collects data across organizations, it is hard to track cohorts or individuals and see where they eventually end up.

Frequent surveys and detailed one-on-one data collection could help us understand the field better, but that is hard for organizations to manage on top of everything they already do. The evaluation that does exist stays internal, such as program surveys and private funder evaluations (Ryan Kidd mentions in a [comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=xoMBCgznK2EJrB7nE) that Coefficient Giving has run detailed internal investigations of MATS's impact).

Because there is no cross-organization collaboration or tracking, these are questions no one can answer:

1. What happens to people who are rejected from fellowships?
2. Where do people get stuck in their early-career AI safety journey?
3. Is there really a typical path (for example, BlueDot → SPAR → MATS or similar → a full-time role)? How many people actually follow it?
4. How much feedback do applicants actually get, and what kind of feedback helps most?
5. What are the breaking points? What matters most to people: research funding, learning, or something else?

## What we have

Some of the data I could find online:

| Source | What it reports | Main limitation |
| --- | --- | --- |
| [MATS alumni survey](https://www.lesswrong.com/posts/jeBkx6agMuBCQW94C/mats-alumni-impact-analysis) | 80% of pre-2025 alumni work in AI safety; 10% founded orgs or teams. 78% said their publication "possibly" or "probably" wouldn't have happened without MATS | 46% response rate; no comparison group |
| [MATS selection analysis](https://mats-selection-analysis.pages.dev/) | Summer 2026: 2,203 applications, 126 offers (5.7%). Application features explain at most \~25% of the variance in mentor evaluations | Internal to one program |
| [ML4Good impact assessment](https://forum.effectivealtruism.org/posts/t8tZMxQonL4Q2zh3W/ml4good-impact-assessment) | 180+ alumni in AI safety (\~135 FTE), about half counterfactual, \~£9.3k per counterfactual FTE; 66% response rate | Self-reported counterfactuals; comparison group promised for next cohort |
| [Arb's AI Safety Camp assessment](https://www.longtermwiki.com/resources/9de14d6a0b6b0ea6) | 5–10% of participants plausibly became researchers because of AISC, at $12–30K each | Commissioned by the program; survey-based |
| [Clay's alumni dataset](https://www.lesswrong.com/posts/8p2vmQWQbt55qwq98/where-do-ai-safety-fellows-go-analyzing-a-dataset-of-600) | 600+ alumni of 9 late-stage fellowships; >10% did another fellowship afterward; \~80% still in AI safety | Alumni only; counterfactual left open |
| [Kairos retrospective](https://forum.effectivealtruism.org/posts/6ucKLAbrnbESYguyL/kairos-has-raised-usd50m-to-build-talent-infrastructure-for) | \~80 people in full-time core AI safety roles after Kairos programs | Self-described "shallow"; no comparison |
| BlueDot | "25% of our graduates land impactful roles within six months" | No definition, denominator or method published ([per Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)) |

The closest thing to what I want to build is Chris Clay's dataset ([LessWrong, Jan 2026](https://www.lesswrong.com/posts/8p2vmQWQbt55qwq98/where-do-ai-safety-fellows-go-analyzing-a-dataset-of-600)): 600+ LinkedIn profiles across nine fellowships, showing that about 21.5% of fellows did more than one fellowship and roughly 80% still work in AI safety. But it's a one-time snapshot from LinkedIn, and does not address the people who didn't get in.

What I want to do is answer his open questions, like multi-year retention and each fellowship's counterfactual value. This is something the cross-program tracking would answer.

## Why existing efforts are not enough

1. **Programs cannot see outside their organization.** As a result, we cannot track the applicant who did multiple BlueDot courses, then did an Apart Hackathon, got rejected from MATS, and then got a SWE job. A joined-up approach is also what Thomas-Walters recommends, because most cohorts are too small to study on their own.
2. **Programs evaluating themselves have a conflict of interest.** I saw MATS hiring an impact analyst and Apart Research collecting feedback from past participants. This is good. However, in this [comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=dRrDKzSQYoNdLuLHT), Ryan Kidd from MATS wrote that he would fund a "GiveWell for AI safety" himself if not for the obvious conflict of interest.
3. **Funder evaluations like Coefficient Giving's internal investigations are private.** They don't help other funders or programs trying to improve and nobody outside can verify them either.
4. **The closest effort similar to my idea is Kairos's Talent Commons.** However, I think they solve a different problem: routing applicants to roles, rather than tracking outcomes.

Meanwhile, people with money have said they want this and can't find anyone to do it. Manifund's Austin Chen said he would like to fund a "GiveWell for AI safety" but that the talent is scarce ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=S7DFJyBoxfwYR8EQJ)). Coefficient Giving has said it's considering an internal project to set and share clearer outcome standards (quoted by [Thomas-Walters](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study)).

## The proposal

Based on the problems discussed, I propose an independent organization that measures what works in AI safety talent development, starting with early-career people. The initial goal is to collect cross-organizational data, and try to measure what is working and what is not, and find out the existing gaps.

These findings can be used to develop new programs as part of fieldbuilding efforts, and improve existing programs. As a moonshot goal, eventually this organization could end up conducting independent impact assessments of fellowships and other programs for funders and grantmakers.

Some of the work that I envision getting done here:

1. **Follow up with people who don't get in:** This group is perfect to show where the pipeline leaks. Fellowships already score their applicants, so near-miss candidates are easy to identify and compare with those who just made it in.
2. **Tracking across programs:** I would expect most people (including me) to opt in to sharing their data. We need to track people over time to understand where people stall and whether the 'typical' path is real or not.
3. **Direct Feedback from applicants/fellows:** Surveys and interviews to get a more subjective understanding supporting our objective metrics.
4. **Talk to employers:** Ideally, we would also talk to AI safety organizations on their hiring patterns and thoughts (especially for entry-level roles).

## Why this makes grantmaking easier

There are not a lot of grantmakers in the field ([Coefficient Giving calls it a major bottleneck](https://forum.effectivealtruism.org/posts/B6d8Wzk4gNzHsXvdi/ai-safety-is-extremely-bottlenecked-on-grantmakers)), and most of the existing ones judge talent programs mostly from self-reported surveys. The data we collect independently could make grantmaking faster and better. This would also let smaller funders decide without building their own evaluation teams.

## Some hard problems

Some of the things that could go wrong with this:

1. Access to data: Privacy laws and applicant consent can be a serious barrier to getting access to data. But I think this can get better as the organization grows and builds trust.
2. Giving back to the people: A lot of people just might feel surveilled being part of the study. We need to come up with motivations/incentives for the people to share their data or be part of this.
3. How do we get the money? Down the line, programs might end up paying to get an impact assessment done. But initially, the money will probably have to come from philanthropic funds.
4. Measuring the right thing: As Ryan Kidd points out, much of the impact of AI safety work is hard to observe in the near term, and near-term proxies can mislead ([comment](https://forum.effectivealtruism.org/posts/S5yBGo4fnqm2zKMKj/do-ai-safety-talent-programmes-work-nobody-has-run-the-study?commentId=dRrDKzSQYoNdLuLHT)). I would start with simple, observable outcomes like career moves, time to first role and publications.

## Call to action

I think that the problem is real, and the AI safety community will benefit from having an organization like this. And I would like to help build it. But I am more interested in getting this right. So if you think the premise is wrong or it should look different, I would like to hear it. If you have any feedback or criticism, I would like to know that as well.

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
