import type { Metadata } from "next";
import DraftPage from "@/components/content/DraftPage";
import { getDraft } from "@/lib/drafts";
import { draftRoute } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(draftRoute("dessert-cups-gta"));

export default function Page() {
  return (
    <DraftPage draft={getDraft("dessert-cups-gta")!} kicker="Across the GTA"></DraftPage>
  );
}
