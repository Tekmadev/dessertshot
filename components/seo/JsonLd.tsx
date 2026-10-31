import { serializeJsonLd, type JsonLdGraph } from "@/lib/structured-data";

/**
 * Structured data as a plain <script> (not next/script: it's data, not code),
 * escaped so nothing in it can close the tag (lib/structured-data.ts).
 */
export default function JsonLd({ data }: { data: JsonLdGraph }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
