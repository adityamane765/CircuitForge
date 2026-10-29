import Link from "next/link";

import type { GuideSection } from "@/content/developerGuide";

interface DeveloperHeaderProps {
  sections: GuideSection[];
}

export function DeveloperHeader({ sections }: DeveloperHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-5 px-5 lg:px-8">
        <Link
          href="/"
          className="shrink-0 font-mono text-sm font-bold tracking-[-0.04em] text-[#00f0ff] outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
        >
          CircuitForge
        </Link>

        <span className="hidden h-4 w-px bg-white/10 sm:block" />
        <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-[#77778f] sm:block">
          Developers
        </span>

        <nav aria-label="Developer guide" className="ml-auto hidden min-w-0 items-center gap-5 lg:flex">
          {sections.slice(0, 6).map((section) => (
            <Link
              key={section.id}
              href={`/developers#${section.id}`}
              className="whitespace-nowrap font-mono text-[11px] text-[#77778f] outline-none transition-colors hover:text-[#e0e0ff] focus-visible:text-[#00f0ff]"
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/editor"
          className="ml-auto shrink-0 rounded-md border border-[#00f0ff]/35 bg-[#00f0ff]/10 px-3 py-2 font-mono text-[11px] font-semibold text-[#00f0ff] outline-none transition-colors hover:border-[#00f0ff]/70 hover:bg-[#00f0ff]/15 focus-visible:ring-2 focus-visible:ring-[#00f0ff] lg:ml-2"
        >
          Open editor <span aria-hidden="true">→</span>
        </Link>
      </div>
      <nav aria-label="Developer guide sections" className="scrollbar-hidden flex gap-5 overflow-x-auto border-t border-white/[0.06] px-5 py-3 lg:hidden">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/developers#${section.id}`}
            className="shrink-0 font-mono text-[10px] text-[#77778f] outline-none hover:text-[#00f0ff] focus-visible:text-[#00f0ff]"
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
