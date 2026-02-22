"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Terminal, FileCode, Layers } from "lucide-react";

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-[#0d1117] max-w-full">
      {/* Mac-style Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className="ml-4 flex items-center gap-2 opacity-60">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider">
              {language || "plaintext"}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-medium text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative bg-[#0d1117] overflow-x-auto max-w-full font-mono text-[13px] custom-scrollbar pb-2">
        <SyntaxHighlighter
          language={language || "text"}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "0.9rem",
            lineHeight: "1.6",
            background: "transparent", // Use container bg
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#484f58",
            textAlign: "right",
          }}
          wrapLines
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;
            const value = String(children).replace(/\n$/, "");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded-md text-slate-200 text-[13px] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : ""} value={value} />;
          },
          p({ children }) {
            return (
              <p className="mb-4 last:mb-0 leading-7 text-slate-200 text-[15px]">
                {children}
              </p>
            );
          },
          strong({ children }) {
            return <strong className="font-bold text-white">{children}</strong>;
          },
          h1({ children }) {
            const id = Array.isArray(children)
              ? children
                  .map((c) => (typeof c === "string" ? c : ""))
                  .join("")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
              : String(children)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
            return (
              <h1
                id={id}
                className="text-xl font-bold text-white mb-4 mt-6 first:mt-0 flex items-center gap-2 scroll-mt-24"
              >
                {children}
              </h1>
            );
          },
          h2({ children }) {
            const id = Array.isArray(children)
              ? children
                  .map((c) => (typeof c === "string" ? c : ""))
                  .join("")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
              : String(children)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
            return (
              <h2
                id={id}
                className="text-lg font-bold text-white mb-3 mt-5 first:mt-0 flex items-center gap-2 pb-2 border-b border-white/5 scroll-mt-24"
              >
                {children}
              </h2>
            );
          },
          h3({ children }) {
            const id = Array.isArray(children)
              ? children
                  .map((c) => (typeof c === "string" ? c : ""))
                  .join("")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
              : String(children)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
            return (
              <h3
                id={id}
                className="text-base font-bold text-white mb-2 mt-4 first:mt-0 scroll-mt-24"
              >
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-slate-200 text-[15px] marker:text-slate-500">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-slate-200 text-[15px] marker:text-slate-500">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed pl-1">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="p-4 my-4 bg-white/5 rounded-lg border-l-4 border-slate-600">
                <div className="text-slate-300 italic">{children}</div>
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-slate-200 underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all font-medium"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-white/10 shadow-lg">
                <table className="w-full text-sm text-left">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-white/5">{children}</thead>;
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-white/5">{children}</tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-white/5 transition-colors">{children}</tr>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 font-semibold text-slate-300 uppercase tracking-wider text-xs whitespace-nowrap bg-white/5">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                {children}
              </td>
            );
          },
          hr() {
            return <hr className="border-white/10 my-6" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
