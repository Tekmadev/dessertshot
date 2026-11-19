import type { Metadata } from "next";
import DraftPage from "@/components/content/DraftPage";
import { getDraft } from "@/lib/drafts";
import { draftRoute } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(draftRoute("events"));

export default function Page() {
  return (
    <DraftPage draft={getDraft("events")!} kicker="Events"></DraftPage>
  );
}
