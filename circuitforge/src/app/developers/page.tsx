import type { Metadata } from "next";
import Link from "next/link";

import { DeveloperHeader } from "@/components/Developers/DeveloperHeader";
import { EditorMap } from "@/components/Developers/EditorMap";
import { HeroProductFlow } from "@/components/Developers/HeroProductFlow";
import { blockCategories, capabilityGroups, exampleSteps, executionBoundaries, guideSections, limitations, quickstartSteps, templateSummaries, troubleshootingItems, workflows } from "@/content/developerGuide";

export const metadata: Metadata = {
  title: "CircuitForge developer guide",
  description: "Build, test, export, share, and deploy Cairo circuits with CircuitForge.",
};

function SectionHeading({ label, title, body }: { label: string; title: string; body?: string }) {
  return <div className="mb-8 max-w-3xl"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]">{label}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#f0f0fa] sm:text-4xl">{title}</h2>{body ? <p className="mt-4 text-[15px] leading-7 text-[#9292a7]">{body}</p> : null}</div>;
}

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0ef] selection:bg-[#00f0ff]/25 selection:text-white">
      <DeveloperHeader sections={guideSections} />
      <main className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <section id="overview" className="scroll-mt-28 border-b border-white/[0.08] py-12 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6d6d83]">Documentation</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#f4f4fc] sm:text-5xl">CircuitForge developer guide</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[#9999ad]">Build Cairo circuits from typed blocks, test their constraints, then export or deploy the generated code.</p></div>
            <HeroProductFlow />
          </div>
        </section>

        <div className="grid gap-12 py-14 lg:grid-cols-[180px_minmax(0,900px)] lg:justify-center lg:gap-16 lg:py-20">
          <aside className="hidden lg:block"><nav aria-label="On this page" className="sticky top-28 border-l border-white/[0.09] pl-5"><p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#505066]">On this page</p><ul className="space-y-3">{guideSections.slice(1).map((section) => <li key={section.id}><Link href={`#${section.id}`} className="font-mono text-[11px] text-[#77778d] hover:text-[#00f0ff]">{section.label}</Link></li>)}</ul></nav></aside>
          <div className="min-w-0 space-y-20 sm:space-y-24">
            <section id="quickstart" className="scroll-mt-28">
              <SectionHeading label="First circuit" title="Build and test a circuit" body="" />
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d12]">{quickstartSteps.map((step) => <article key={step.number} className="grid gap-3 border-t border-white/[0.07] p-5 first:border-t-0 sm:grid-cols-[42px_210px_1fr] sm:gap-5"><span className="font-mono text-[10px] text-[#00f0ff]">{step.number}</span><h3 className="text-sm font-semibold text-[#e4e4ef]">{step.title}</h3><p className="text-sm leading-6 text-[#89899e]">{step.instruction}</p></article>)}</div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#00f0ff]/15 bg-[#00f0ff]/[0.025] px-5 py-4"><p className="text-sm text-[#9292a7]">Editing, local tests, saves, and exports do not require a wallet. Deployment does.</p><Link href="/editor" className="font-mono text-xs font-semibold text-[#00f0ff]">Open the editor →</Link></div>
            </section>

            <section id="features" className="scroll-mt-28">
              <SectionHeading label="Product map" title="What the editor does" body="Build a circuit as a typed graph, inspect the generated Cairo, test its constraints, and export or deploy the result." />
              <EditorMap />
              <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">{capabilityGroups.map((group) => <div key={group.title} className="bg-[#0d0d12] p-5"><h3 className="text-sm font-semibold text-[#e2e2ee]">{group.title}</h3><ul className="mt-3 space-y-2">{group.items.map((item) => <li key={item} className="text-xs leading-5 text-[#85859a]">{item}</li>)}</ul></div>)}</div>
              <div className="mt-10"><h3 className="text-lg font-semibold text-[#e7e7f2]">Built-in templates</h3><p className="mt-2 text-sm leading-6 text-[#85859a]">Load a complete graph, then edit it like any other circuit.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{templateSummaries.map((template) => <div key={template.name} className="rounded-lg border border-white/[0.08] bg-white/[0.018] p-4"><p className="text-sm font-medium text-[#dddded]">{template.name}</p><p className="mt-2 text-xs leading-5 text-[#7f7f94]">{template.teaches}</p></div>)}</div></div>
            </section>

            <section id="workflows" className="scroll-mt-28 border-t border-white/[0.08] pt-20">
              <SectionHeading label="Workflows" title="Use each part of the editor" body="These flows are independent. Use only the ones your circuit needs." />
              <div className="grid gap-4 sm:grid-cols-2">{workflows.map((workflow, index) => <article key={workflow.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="font-mono text-[10px] text-[#55556c]">{String(index + 1).padStart(2, "0")}</span><h3 className="font-semibold text-[#e7e7f2]">{workflow.title}</h3></div><ol className="mt-4 space-y-2 pl-5 text-sm leading-6 text-[#8b8ba0]">{workflow.steps.map((step) => <li key={step} className="list-decimal pl-1">{step}</li>)}</ol>{workflow.note ? <p className="mt-4 border-t border-white/[0.07] pt-4 text-xs leading-5 text-[#acacbd]">{workflow.note}</p> : null}</article>)}</div>
              <div className="mt-12"><h3 className="text-lg font-semibold text-[#e7e7f2]">Where each step runs</h3><div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">{executionBoundaries.map((boundary) => <div key={boundary.name} className="grid gap-2 border-t border-white/[0.07] bg-[#0d0d12] p-5 first:border-t-0 sm:grid-cols-[170px_1fr_150px]"><h4 className="text-sm font-semibold text-[#dddded]">{boundary.name}</h4><p className="text-xs leading-5 text-[#85859a]">{boundary.responsibilities}</p><p className="font-mono text-[10px] text-[#00f0ff]/75">{boundary.requirement}</p></div>)}</div></div>
            </section>

            <section id="example" className="scroll-mt-28 border-t border-white/[0.08] pt-20">
              <SectionHeading label="Example" title="Hash Preimage" body="Use one template to learn the build, test, inspect, and export loop." />
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">{exampleSteps.map((step) => <div key={step.number} className="grid gap-2 border-t border-white/[0.07] bg-[#0d0d12] p-5 first:border-t-0 sm:grid-cols-[44px_170px_1fr] sm:gap-4"><span className="font-mono text-[10px] text-[#55556d]">{step.number}</span><h3 className="text-sm font-semibold text-[#dddded]">{step.title}</h3><p className="text-sm leading-6 text-[#85859a]">{step.body}</p></div>)}</div>
            </section>

            <section id="blocks" className="scroll-mt-28 border-t border-white/[0.08] pt-20">
              <SectionHeading label="Reference" title="Available blocks" body="The toolbox contains 19 blocks across six categories." />
              <div className="grid gap-3 sm:grid-cols-2">{blockCategories.map((category) => <div key={category.name} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"><div className="flex items-center justify-between"><h3 className="font-mono text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: category.accent }}>{category.name}</h3><span className="font-mono text-[10px] text-[#55556c]">{category.blocks.length}</span></div><ul className="mt-4 space-y-3">{category.blocks.map((block) => <li key={block.name}><p className="text-sm text-[#d5d5e2]">{block.name}</p><p className="mt-1 text-xs leading-5 text-[#79798f]">{block.description}</p></li>)}</ul></div>)}</div>
            </section>

            <section id="troubleshooting" className="scroll-mt-28 border-t border-white/[0.08] pt-20">
              <SectionHeading label="Troubleshooting" title="Common errors" />
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">{troubleshootingItems.map((item) => <details key={item.category} className="group border-t border-white/[0.07] bg-[#0d0d12] first:border-t-0"><summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[#dddded] marker:hidden">{item.symptom}<span className="float-right font-mono text-[#5f5f75] group-open:rotate-45">+</span></summary><div className="grid gap-4 border-t border-white/[0.06] px-5 py-4 text-xs leading-5 sm:grid-cols-2"><p className="text-[#7f7f94]"><span className="mb-1 block font-mono text-[9px] uppercase text-[#55556c]">Cause</span>{item.cause}</p><p className="text-[#a3a3b5]"><span className="mb-1 block font-mono text-[9px] uppercase text-[#55556c]">Fix</span>{item.action}</p></div></details>)}</div>
            </section>

            <section id="limitations" className="scroll-mt-28 border-t border-white/[0.08] pt-20">
              <SectionHeading label="Before you use exported code" title="Current limitations" />
              <div className="divide-y divide-white/[0.07] border-y border-white/[0.08]">{limitations.map((item) => <div key={item.id} className="grid gap-2 py-5 sm:grid-cols-[190px_1fr]"><h3 className="text-sm font-semibold text-[#dddded]">{item.title}</h3><p className="text-sm leading-6 text-[#85859a]">{item.description}</p></div>)}</div>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-[#00f0ff]/20 bg-[#00f0ff]/[0.035] p-6"><div><h2 className="text-xl font-semibold text-[#ededf6]">Open the editor</h2><p className="mt-1 text-sm text-[#85859a]">Start empty or load existing work.</p></div><Link href="/editor" className="rounded-md bg-[#00f0ff] px-4 py-2.5 font-mono text-xs font-bold text-[#041012]">Open editor ↗</Link></div>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t border-white/[0.07] px-5 py-8 text-center font-mono text-[10px] text-[#4f4f63]">CircuitForge · Visual circuit builder for Cairo</footer>
    </div>
  );
}
