"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Terminal, FileCode, Layers } from "lucide-react";

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e1e]">
      {/* Mac-style Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
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
      <div className="relative bg-[#1e1e1e]">
        <SyntaxHighlighter
          language={language || "text"}
          style={vscDarkPlus}
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
            minWidth: "2.5em",
            paddingRight: "1.5em",
            color: "#858585",
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
                  className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded-md text-gold text-xs font-mono"
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
              <p className="mb-4 last:mb-0 leading-7 text-slate-300">
                {children}
              </p>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-200">
                {children}
              </strong>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-black text-white mb-4 mt-6 first:mt-0 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold text-white mb-3 mt-5 first:mt-0 flex items-center gap-2 pb-2 border-b border-white/5">
                <Layers className="w-4 h-4 text-gold" />
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-bold text-white/90 mb-2 mt-4 first:mt-0">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul className="space-y-2 mb-4 ml-1">
                {React.Children.map(children, (child) => (
                  <li className="flex gap-2 items-start text-sm text-slate-300 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <div className="flex-1">{child}</div>
                  </li>
                ))}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-300 text-sm marker:text-gold marker:font-bold">
                {children}
              </ol>
            );
          },
          li({ children }) {
            // Unordered lists handle their own li rendering above to custom bullet
            // This is mostly for ordered lists or nested structures
            return <span>{children}</span>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="relative p-4 my-4 bg-white/5 rounded-lg border-l-4 border-gold">
                <div className="absolute top-2 right-2 opacity-10">
                  <Terminal className="w-8 h-8 text-gold" />
                </div>
                <div className="text-slate-300 italic relative z-10">
                  {children}
                </div>
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-amber-300 underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-all"
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
              <th className="px-4 py-3 font-semibold text-gold uppercase tracking-wider text-xs whitespace-nowrap">
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
