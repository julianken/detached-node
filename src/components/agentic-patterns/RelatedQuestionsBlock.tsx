// ---------------------------------------------------------------------------
// RelatedQuestionsBlock
// ---------------------------------------------------------------------------
// Renders a visible Q&A list as <dl>/<dt>/<dd>. Sits after the decision
// matrix and before the "In the wild" table. Pairs 1:1 with the FAQPage
// JSON-LD emitted from generateFaqPageSchema(): per Google's structured-data
// guidelines, the questions and answers in the JSON-LD must also be visible
// to the user, so this component must NOT be wrapped in <DisclosureSection>.

import type { Pattern } from "@/data/agentic-design-patterns/types";

interface RelatedQuestionsBlockProps {
  questions: NonNullable<Pattern["relatedQuestions"]>;
}

export function RelatedQuestionsBlock({ questions }: RelatedQuestionsBlockProps) {
  if (questions.length === 0) return null;

  return (
    <section
      id="common-questions"
      aria-labelledby="common-questions-heading"
      className="scroll-mt-24"
    >
      <h2
        id="common-questions-heading"
        className="font-mono text-nav font-semibold uppercase tracking-[0.08em] text-text-tertiary"
      >
        Common questions
      </h2>
      <dl className="mt-4 flex flex-col gap-4">
        {questions.map((qa, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-border-subtle bg-surface px-4 py-3"
          >
            <dt className="text-body font-semibold text-text-primary [text-wrap:pretty]">
              {qa.q}
            </dt>
            <dd className="mt-2 text-body leading-7 text-text-secondary [text-wrap:pretty]">
              {qa.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
