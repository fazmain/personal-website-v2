// TEMPLATE for a research entry page. Folders starting with "_" are not routed,
// so this page is never published.
//
// To start a new entry:
//   1. Add it to lib/research.ts with `hasPage: true` and a slug, e.g. "my-sprint".
//   2. Copy this folder to app/research/my-sprint/ and set SLUG below.
//   3. Write. Put demo components next to the page or in components/research/.

import ResearchHeader from '@/components/research/ResearchHeader';
import Prose, { Figure } from '@/components/research/Prose';
import SoftmaxDemo from '@/components/research/SoftmaxDemo';
import { getEntry } from '@/lib/research';

const SLUG = 'my-sprint';

export function generateMetadata() {
  const entry = getEntry(SLUG);
  return { title: entry.title, description: entry.summary };
}

export default function Page() {
  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 animate-fade-in">
      <ResearchHeader slug={SLUG} />

      <Prose>
        <h2>TL;DR</h2>
        <p>
          One paragraph on the question, what you did, and what you found.
        </p>

        <h2>Setup</h2>
        <p>
          Prose works like normal HTML: <strong>bold</strong>, <a href="#">links</a>, lists, and <code>code</code>.
        </p>

        <Figure caption="Figure 1. Drag the slider: low temperature sharpens the distribution, high temperature flattens it.">
          <SoftmaxDemo />
        </Figure>

        <h2>Results</h2>
        <p>Keep writing here.</p>
      </Prose>
    </article>
  );
}
