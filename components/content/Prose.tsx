import Link from "next/link";
import { parseBlocks, resolveTokens, type Inline, type Tokens } from "@/lib/markdown";

/**
 * Renders draft copy (lib/markdown.ts subset) as React. Internal links use
 * next/link; mailto and external links are plain anchors.
 */
export default function Prose({
  body,
  tokens,
  className = "",
}: {
  body: string;
  tokens?: Tokens;
  className?: string;
}) {
  const text = resolveTokens(body, tokens);
  if (!text) return null;
  return (
    <div className={`flex flex-col gap-5 text-[17px] md:text-[18px] leading-[1.65] text-ink/80 ${className}`}>
      {parseBlocks(text).map((b, i) =>
        b.kind === "p" ? (
          <p key={i} className="max-w-[62ch]">
            <Inlines nodes={b.children} />
          </p>
        ) : b.kind === "table" ? (
          <Table key={i} head={b.head} rows={b.rows} />
        ) : (
          <List key={i} ordered={b.kind === "ol"} items={b.items} />
        )
      )}
    </div>
  );
}

/** First column labels each row (e.g. the tier); figures line up. */
function Table({ head, rows }: { head: Inline[][]; rows: Inline[][][] }) {
  return (
    <div className="max-w-[62ch] overflow-x-auto">
      <table className="w-full border-collapse text-left tabular-nums">
        <thead>
          <tr className="border-b border-ink/25">
            {head.map((c, i) => (
              <th
                key={i}
                scope="col"
                className={`py-2 pr-4 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-ink/70 ${i ? "text-right" : ""}`}
              >
                <Inlines nodes={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-ink/15">
              {row.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="py-3 pr-4 font-normal text-ink">
                    <Inlines nodes={c} />
                  </th>
                ) : (
                  <td key={i} className="py-3 pr-4 text-right text-ink">
                    <Inlines nodes={c} />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function List({ ordered, items }: { ordered: boolean; items: Inline[][] }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`max-w-[62ch] flex flex-col gap-2.5 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-berry`}>
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          <Inlines nodes={item} />
        </li>
      ))}
    </Tag>
  );
}

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.kind === "text") return <span key={i}>{n.text}</span>;
        if (n.kind === "bold")
          return (
            <strong key={i} className="font-semibold text-ink">
              <Inlines nodes={n.children} />
            </strong>
          );
        const cls = "text-ink underline decoration-ember/50 underline-offset-[3px] hover:decoration-ember transition-colors";
        return n.href.startsWith("/") ? (
          <Link key={i} href={n.href} className={cls}>
            <Inlines nodes={n.children} />
          </Link>
        ) : (
          <a key={i} href={n.href} className={cls}>
            <Inlines nodes={n.children} />
          </a>
        );
      })}
    </>
  );
}
