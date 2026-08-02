import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

/** Strips scripts / event handlers / external refs from AI-authored SVG. */
function sanitizeSvg(svg: string): string | null {
  const trimmed = svg.trim();
  if (!trimmed.startsWith("<svg")) return null;
  const cleaned = trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");
  return cleaned.length > 40000 ? null : cleaned;
}

function SvgBlock({ code }: { code: string }) {
  const safe = sanitizeSvg(code);
  if (!safe) return <CodeBlock code={code} lang="svg" />;
  return (
    <div
      className="my-4 overflow-x-auto rounded-2xl border p-4"
      style={{
        borderColor: "var(--tutor-border)",
        background: "var(--tutor-deep)",
        boxShadow: "var(--shadow-tutor)",
      }}
      // AI-generated SVG, sanitized above (no scripts, handlers or js: hrefs).
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--tutor-border)", background: "var(--tutor-deep)" }}
    >
      {lang && (
        <div
          className="border-b px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ borderColor: "var(--tutor-border)", color: "var(--tutor-sky)" }}
        >
          {lang}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono" style={{ color: "var(--tutor-sky-soft)" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function textOf(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in (children as never)) {
    return textOf((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function TutorMarkdown({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-foreground [&>*:first-child]:mt-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="font-display mt-5 mb-2 text-2xl" style={{ color: "var(--tutor-sky)" }}>{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-display mt-5 mb-2 text-xl" style={{ color: "var(--tutor-sky)" }}>{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-display mt-4 mb-2 text-lg" style={{ color: "var(--tutor-sky)" }}>{children}</h4>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
          strong: ({ children }) => (
            <strong style={{ color: "var(--tutor-sky-soft)" }}>{children}</strong>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--tutor-sky)" }}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="my-4 rounded-r-xl border-l-2 py-1 pl-4 italic"
              style={{ borderColor: "var(--tutor-sky)", background: "oklch(0.8 0.15 225 / 0.07)" }}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border px-3 py-2 text-left" style={{ borderColor: "var(--tutor-border)", color: "var(--tutor-sky)" }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-3 py-2" style={{ borderColor: "var(--tutor-border)" }}>{children}</td>
          ),
          code: ({ className, children }) => {
            const raw = textOf(children).replace(/\n$/, "");
            const lang = /language-(\w+)/.exec(className ?? "")?.[1];
            if (!lang && !raw.includes("\n")) {
              return (
                <code
                  className="rounded-md px-1.5 py-0.5 font-mono text-[13px]"
                  style={{ background: "oklch(0.8 0.15 225 / 0.14)", color: "var(--tutor-sky-soft)" }}
                >
                  {raw}
                </code>
              );
            }
            if (lang === "svg" || raw.trim().startsWith("<svg")) return <SvgBlock code={raw} />;
            return <CodeBlock code={raw} lang={lang} />;
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
