const tabs = ["Test", "AI", "Deploy", "Share", "Graph"];

export function EditorMap() {
  return (
    <div role="img" aria-label="CircuitForge editor layout" className="overflow-hidden rounded-xl border border-white/[0.09] bg-[#0c0c11] shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#111118] px-4 py-3">
        <span className="mr-2 font-mono text-[11px] font-bold text-[#00f0ff]">CircuitForge</span>
        {['Templates', 'Clear', 'Save', 'Load', 'Export'].map((item) => <span key={item} className="rounded border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[9px] text-[#85859b]">{item}</span>)}
        <span className="ml-auto hidden font-mono text-[9px] text-[#65657b] sm:block">Constraints · Gas · Theme · Guide</span>
      </div>
      <div className="grid min-h-[340px] sm:grid-cols-[1.35fr_1fr]">
        <div className="relative border-b border-white/[0.08] p-4 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#606078]">Block toolbox + canvas</p>
          <div className="mt-5 grid grid-cols-[74px_1fr] gap-3">
            <div className="space-y-2">{['Inputs', 'Arithmetic', 'Hashing', 'Logic', 'Constraints', 'Output'].map((item) => <div key={item} className="rounded border border-white/[0.07] px-2 py-2 font-mono text-[8px] text-[#74748b]">{item}</div>)}</div>
            <div className="relative min-h-[250px] rounded-lg border border-white/[0.06] bg-[#09090e] bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:24px_24px]">
              <div className="absolute left-[10%] top-[24%] rounded border border-[#7c4dff]/50 bg-[#15121f] px-3 py-2 font-mono text-[9px] text-[#b49aff]">Private Input</div>
              <div className="absolute left-[42%] top-[42%] rounded border border-[#00bfa5]/50 bg-[#0d1b19] px-3 py-2 font-mono text-[9px] text-[#63dfc9]">Poseidon</div>
              <div className="absolute bottom-[18%] right-[8%] rounded border border-[#ff5252]/50 bg-[#1e1115] px-3 py-2 font-mono text-[9px] text-[#ff8a8a]">Assert Equal</div>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-[1fr_auto_1fr]">
          <div className="p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#606078]">Live Cairo</p><pre className="mt-4 overflow-hidden font-mono text-[9px] leading-5 text-[#8f8fa7]"><code><span className="text-[#7c8cff]">#[starknet::contract]</span>{'\n'}mod Circuit {'{'}{'\n'}  <span className="text-[#00bfa5]">let hash</span> = poseidon(...);{'\n'}  assert!(hash == expected);{'\n'}{'}'}</code></pre></div>
          <div className="h-px bg-white/[0.08]" />
          <div><div className="flex border-b border-white/[0.07]">{tabs.map((tab, index) => <span key={tab} className={`px-3 py-2 font-mono text-[8px] ${index === 0 ? 'border-b border-[#00f0ff] text-[#00f0ff]' : 'text-[#65657b]'}`}>{tab}</span>)}</div><div className="p-4 font-mono text-[9px] text-[#77778d]">Input values → Run Tests → PASS / FAIL</div></div>
        </div>
      </div>
    </div>
  );
}
