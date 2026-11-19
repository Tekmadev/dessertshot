import type { Metadata } from "next";
import DraftPage from "@/components/content/DraftPage";
import Packages from "@/components/sections/Packages";
import { getDraft } from "@/lib/drafts";
import { draftRoute } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(draftRoute("packages"));

export default function Page() {
  return (
    <DraftPage draft={getDraft("packages")!} kicker="Packages">
      <Packages />
    </DraftPage>
  );
}
