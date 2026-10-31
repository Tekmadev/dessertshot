import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DraftPage from "@/components/content/DraftPage";
import { getDraft } from "@/lib/drafts";
import { EVENT_TYPES, getEventBySlug } from "@/lib/events";
import { draftRoute } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// One page per event type (lib/events.ts); anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return EVENT_TYPES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return getDraft(slug) ? pageMetadata(draftRoute(slug)) : {};
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const draft = getDraft(slug);
  const event = getEventBySlug(slug);
  if (!draft || !event) notFound();
  return <DraftPage draft={draft} kicker={`Events · ${event.label}`} />;
}
