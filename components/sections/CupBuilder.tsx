import { copy } from "@/lib/copy";
import BuildIntro from "@/components/experience/build/BuildIntro";
import BuildStage from "@/components/experience/build/BuildStage";

/**
 * "How a cup is built" (homepage S2, The Build): the heading, then a pinned
 * scroll that uncovers the hero cup's photo from the bottom up with a callout
 * on each layer (about 300vh on phones, 400vh on desktop). With reduced
 * motion it is a plain section: the whole photo, every callout, four phases.
 */
export default function CupBuilder() {
  return (
    <section id="builder" aria-label={copy.builder.sectionLabel} className="relative bg-bone hairline-bottom">
      <BuildIntro />
      <BuildStage />
    </section>
  );
}
