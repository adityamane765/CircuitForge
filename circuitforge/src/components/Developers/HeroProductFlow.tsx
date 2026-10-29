const outputs = [".cairo", "Scarb", "Sepolia", "IPFS"];

export function HeroProductFlow() {
  return (
    <div role="img" aria-label="CircuitForge product flow" className="relative mx-auto h-[410px] w-full max-w-[560px] overflow-hidden">
      <div className="absolute right-1 top-7 h-[220px] w-[66%] bg-[linear-gradient(135deg,#31294d_0%,#52366c_58%,#75427a_100%)]" />
      <div className="absolute bottom-4 left-[16%] h-[160px] w-[80%] bg-[linear-gradient(135deg,#1d2744_0%,#294566_56%,#287181_100%)]" />

      <svg className="absolute inset-0 z-30 h-full w-full" viewBox="0 0 560 410" aria-hidden="true">
        <defs>
          <marker id="flow-arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#bfaeff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></marker>
          <marker id="flow-arrow-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#24222a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></marker>
          <marker id="flow-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#8aeaf4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></marker>
        </defs>
        <path d="M28 178 H258" fill="none" stroke="#24222a" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#flow-arrow-dark)" />
        <path d="M400 186 H438 Q459 186 459 207 V212" fill="none" stroke="#24222a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#flow-arrow-dark)" />
        <path d="M439 91 H488 Q505 91 505 108 V236" fill="none" stroke="#e7a0e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M451 378 V392 H535" fill="none" stroke="#8aeaf4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#flow-arrow-cyan)" />
      </svg>

      <section className="absolute left-[11%] top-8 z-10 h-[224px] w-[68%] border border-[#24222a] bg-[#f5f4f7] text-[#24222a] shadow-[7px_7px_0_#17161d]">
        <header className="flex h-9 items-center border-b border-[#24222a] px-4">
          <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff5d62]" /><span className="h-2 w-2 rounded-full bg-[#ffb447]" /><span className="h-2 w-2 rounded-full bg-[#10bca7]" /></div>
          <span className="ml-auto font-mono text-[8px] font-semibold uppercase tracking-[0.18em]">CircuitForge</span>
        </header>
        <div className="grid h-[187px] grid-cols-[1.04fr_.96fr]">
          <div className="relative border-r border-[#24222a] bg-[#efedf2]">
            <span className="absolute left-3 top-3 font-mono text-[7px] uppercase tracking-[0.16em] text-[#6e6877]">Typed graph</span>
            <div className="absolute left-[35px] top-[24px] h-[106px] w-[104px] border border-[#c9c4cf] bg-[#f8f6f4] p-3 shadow-[4px_4px_0_rgba(36,34,42,0.10)]">
              <p className="font-mono text-[8px] font-semibold text-[#24222a]">{'{graph}'}</p>
              <svg className="mt-2 h-[58px] w-full" viewBox="0 0 78 58" aria-hidden="true">
                <path d="M12 14 L38 8 L64 18 M12 14 L25 42 M64 18 L52 45 M25 42 L52 45 M38 8 L40 29 M40 29 L25 42 M40 29 L64 18" fill="none" stroke="#615a69" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="12" cy="14" r="4" fill="#d9cbff" stroke="#6843c2" />
                <circle cx="38" cy="8" r="4" fill="#c5f2ea" stroke="#0e7e72" />
                <circle cx="64" cy="18" r="4" fill="#ffd1d3" stroke="#b64046" />
                <circle cx="40" cy="29" r="4" fill="#f3c970" stroke="#9c6919" />
                <circle cx="25" cy="42" r="4" fill="#d9cbff" stroke="#6843c2" />
                <circle cx="52" cy="45" r="4" fill="#c5f2ea" stroke="#0e7e72" />
              </svg>
            </div>
          </div>
          <div className="p-4">
            <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-[#6e6877]">Live Cairo</span>
            <div className="mt-6 font-mono text-[7px] leading-5 text-[#292730]">
              <p><span className="text-[#6245b5]">mod</span> Circuit {'{'}</p>
              <p className="pl-3"><span className="text-[#0e7e72]">let</span> out = op(input);</p>
              <p className="pl-3">assert!(out == expected);</p>
              <p>{'}'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="absolute left-6 top-[150px] z-40 h-[166px] w-[150px] border border-[#24222a] bg-white text-[#24222a] shadow-[6px_6px_0_#17161d]">
        <header className="border-b border-[#24222a] bg-[#1b1a21] px-3 py-2.5 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-white">Build visually</header>
        <div className="space-y-2 p-3">
          {['Inputs', 'Operations', 'Constraints'].map((label, index) => <div key={label} className={`border border-[#24222a] px-2.5 py-1.5 font-mono text-[7px] font-semibold ${index === 1 ? 'bg-[#d9cbff]' : 'bg-[#f5f4f7]'}`}>{label}</div>)}
          <div className="bg-[#16d7e6] px-2 py-2 text-center font-mono text-[7px] font-semibold uppercase tracking-[0.06em]">Connect blocks</div>
        </div>
      </section>

      <section className="absolute bottom-[31px] right-3 z-40 h-[166px] w-[235px] border border-[#24222a] bg-white text-[#24222a] shadow-[7px_7px_0_#17161d]">
        <header className="flex items-center justify-between border-b border-[#24222a] px-3.5 py-2.5"><span className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em]">Test and ship</span><span className="bg-[#c5f2ea] px-2 py-0.5 font-mono text-[7px] font-semibold">PASS</span></header>
        <div className="relative h-[125px]">
          <div className="absolute left-4 top-5 border border-[#24222a] bg-[#f5f4f7] px-3 py-2 font-mono text-[7px] font-semibold">TEST</div>
          <div className="absolute right-4 top-5 border border-[#b64046] bg-[#ffd1d3] px-3 py-2 font-mono text-[7px] font-semibold">FAIL</div>
          <div className="absolute left-[40%] top-[56px] border border-[#0e7e72] bg-[#c5f2ea] px-3 py-2 font-mono text-[7px] font-semibold">VALID</div>
          <span className="absolute left-[61px] top-[34px] h-px w-[103px] bg-[#24222a]" />
          <span className="absolute left-1/2 top-[35px] h-[22px] w-px bg-[#24222a]" />
          <div className="absolute bottom-3 left-3.5 flex gap-1.5">
            {outputs.map((label, index) => <span key={label} className={`border px-2 py-1 font-mono text-[6px] font-semibold ${index === 2 ? 'border-[#9c6919] bg-[#f3c970]' : 'border-[#24222a] bg-[#f5f4f7]'}`}>{label}</span>)}
          </div>
        </div>
      </section>

      <span className="absolute right-[2px] top-[73px] z-50 origin-bottom-right -rotate-90 font-mono text-[7px] uppercase tracking-[0.18em] text-[#efb6ee]">visual graph</span>
      <span className="absolute bottom-[2px] right-1 z-50 font-mono text-[8px] text-[#9beaf3]">export · deploy · share</span>
    </div>
  );
}
