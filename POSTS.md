# Research posts from research repos

Research write-ups with interactive figures are written by the agents in each research repo, not here. They hand over a **post bundle**; this repo imports and publishes it. The contract (bundle format, rules, kit API) lives in the `publish-post` skill: `~/.claude/skills/publish-post/` (start with `SKILL.md`, then `references/kit.md`).

## Where things live
| Path | What |
|---|---|
| `content/posts/<slug>/` | imported bundles: `post.json`, `facts.json`, `site/index.mdx`, `site/components/`, `data/`, `figures/`, `media/`, `source.json` (provenance, never rendered) |
| `content/posts/_preview/` | git-ignored; bundles synced by `postctl preview`, shown only in `next dev` |
| `components/kit/` | components posts may use: `index.ts` (for post components), `mdx.tsx` (global MDX components) |
| `app/research/[slug]/page.tsx` | renders a post at `/research/<slug>` |
| `lib/posts.ts` | reads bundles; `lib/research.ts` `allResearch()` merges them into Research / Publications |
| `scripts/posts.mjs` | runs before `dev` and `build`: checks posts, copies figures/media to `public/posts/<slug>/`, writes `lib/posts.generated.ts` |

Hand-written research pages (`app/research/<slug>/page.tsx` + an entry in `lib/research.ts`) still work and take precedence over a bundle with the same slug. Essays stay markdown in `content/blogs/`.

## Publishing a post (website agent)
```bash
POSTCTL="python3 ~/.claude/skills/publish-post/scripts/postctl.py"
$POSTCTL import "<research repo>/publish/<slug>"
npm run build
git switch -c post/<slug> && git add content/posts/<slug> && git commit -m "Add research post: <slug>" && git push -u origin post/<slug>
```
Send Faiaz the Vercel preview URL. Merge to `main` only after he approves and the bundle's `channels.site.status` is `approved` (re-import if it changed). Problems in the post's claims or prose go back to the research repo, not fixed here.

## Changing the kit
`components/kit/` and `references/kit.md` in the skill are one contract: change both in the same piece of work, and keep old props working (published posts depend on them).
