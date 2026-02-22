"use client";

import React, { useState, useEffect } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { cn } from "@/lib/utils"; // Assumes you have a standard cn utility, or just use classNames mapping. Fallback to basic template literal if needed. We'll use cn if possible, but actually let's just use string templates to be safe.

export interface DocSection {
  id: string;
  title: string;
  category: string;
  content: string;
}

export function DocsClient({ sections }: { sections: DocSection[] }) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSectionId]);

  const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
  const activeSection = sections[currentIndex];
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  // Group sections by category for the sidebar
  const categories: Record<string, DocSection[]> = {};
  sections.forEach((s) => {
    if (!categories[s.category]) {
      categories[s.category] = [];
    }
    categories[s.category].push(s);
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex gap-12 w-full relative">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 shrink-0 relative">
        <div className="sticky top-28 space-y-8 text-sm max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-4">
          {Object.entries(categories).map(([category, catSections]) => (
            <div key={category}>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">
                {category}
              </h4>
              <ul className="space-y-3 border-l-2 border-white/5 ml-1">
                {catSections.map((s) => {
                  const isActive = s.id === activeSectionId;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => setActiveSectionId(s.id)}
                        className={`block text-left w-full pl-4 transition-colors relative before:absolute before:inset-y-0 before:-left-[2px] before:w-0.5 before:transition-colors ${
                          isActive
                            ? "text-gold font-medium before:bg-gold"
                            : "text-slate-400 hover:text-white before:bg-transparent hover:before:bg-white/30"
                        }`}
                      >
                        {s.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-32">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {/* Markdown Content for Active Section */}
          <MarkdownRenderer content={activeSection.content} />

          {/* Bottom Pagination Links */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            {prevSection ? (
              <button
                onClick={() => setActiveSectionId(prevSection.id)}
                className="group flex flex-col items-start w-full sm:w-1/2 p-4 rounded-xl border border-white/5 hover:border-gold/30 bg-white/2 hover:bg-white/4 transition-all text-left"
              >
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-gold/80 transition-colors">
                  Previous
                </div>
                <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {prevSection.title}
                </div>
              </button>
            ) : (
              <div className="w-full sm:w-1/2"></div>
            )}

            {nextSection ? (
              <button
                onClick={() => setActiveSectionId(nextSection.id)}
                className="group flex flex-col items-end text-right w-full sm:w-1/2 p-4 rounded-xl border border-white/5 hover:border-gold/30 bg-white/2 hover:bg-white/4 transition-all"
              >
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-gold/80 transition-colors">
                  Next
                </div>
                <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {nextSection.title}
                </div>
              </button>
            ) : (
              <div className="w-full sm:w-1/2"></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
