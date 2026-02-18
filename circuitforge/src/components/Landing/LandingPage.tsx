"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const features = [
  {
    title: 'VISUAL CIRCUIT BUILDER',
    desc: 'Drag-and-drop blocks to design ZK circuits. 16 block types for inputs, arithmetic, hashing, logic, constraints, and outputs. Snap them together like puzzle pieces to build complex proof systems without writing a single line of code.',
  },
  {
    title: 'LIVE CAIRO GENERATION',
    desc: 'See Cairo code generated in real-time as you build. Monaco editor with full syntax highlighting. Every block you place instantly transpiles to valid Cairo—watch your circuit come alive as code.',
  },
  {
    title: 'ONE-CLICK DEPLOY',
    desc: 'Compile and deploy directly to Starknet Sepolia. Connect your wallet, select a contract, deploy. No long setups. No complicated configuration.',
  },
  {
    title: 'AI ASSISTANT',
    desc: 'Chat with Claude, ChatGPT, or Gemini for help designing circuits, debugging constraint logic, or learning zero-knowledge concepts. Context-aware assistance that understands your circuit.',
  },
  {
    title: 'TEMPLATE GALLERY',
    desc: 'Start from pre-built templates: Hash Preimage, Arithmetic Proof, Age Verification, Merkle Proof. Load a template, modify it, make it yours.',
  },
  {
    title: 'IPFS MARKETPLACE',
    desc: 'Share your circuits on IPFS via Pinata. Browse and import circuits published by others. Build on the community\'s work.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Design',
    desc: 'Drag blocks from the toolbox onto the canvas. Snap them together to build your zero-knowledge circuit.',
    code: 'blocks.connect()',
  },
  {
    num: '02',
    title: 'Preview & Test',
    desc: 'Watch Cairo code generate live. Test constraints with custom inputs and visualize the dataflow.',
    code: 'assert(valid)',
  },
  {
    num: '03',
    title: 'Deploy',
    desc: 'Compile to Sierra + CASM with one click. Deploy to Starknet and get your contract address.',
    code: 'deploy(0x...)',
  },
];

const ANIMATED_BLOCKS = [
  { code: 'secret: felt252', color: '#7c4dff', label: 'INPUT' },
  { code: 'pedersen(secret, salt)', color: '#00bfa5', label: 'HASH' },
  { code: 'hash == commitment', color: '#ff5252', label: 'CONSTRAINT' },
  { code: 'proof_valid: bool', color: '#ffab40', label: 'OUTPUT' },
];

const CAIRO_LINES: { text: string; colors: { text: string; color: string }[] }[] = [
  { text: '', colors: [
    { text: 'fn', color: '#c792ea' }, { text: ' verify(', color: '#6a6a8a' },
    { text: 'secret', color: '#00f0ff' }, { text: ': felt252) {', color: '#6a6a8a' },
  ]},
  { text: '', colors: [
    { text: '    ', color: '' }, { text: 'let', color: '#c792ea' },
    { text: ' hash = ', color: '#6a6a8a' }, { text: 'pedersen', color: '#00bfa5' },
    { text: '(secret, salt);', color: '#6a6a8a' },
  ]},
  { text: '', colors: [
    { text: '    ', color: '' }, { text: 'assert', color: '#c792ea' },
    { text: '(hash == ', color: '#6a6a8a' }, { text: 'self', color: '#ff6e40' },
    { text: '.commitment);', color: '#6a6a8a' },
  ]},
  { text: '', colors: [
    { text: '    ', color: '' }, { text: 'return', color: '#c792ea' },
    { text: ' ', color: '' }, { text: 'true', color: '#c3e88d' },
    { text: ';', color: '#6a6a8a' },
  ]},
  { text: '', colors: [{ text: '}', color: '#6a6a8a' }] },
];

// Cubic bezier point at t
function bz(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

interface FlowPath {
  sx: number; sy: number; ex: number; ey: number;
  c1x: number; c1y: number; c2x: number; c2y: number;
  color: string;
  // Pre-sampled points for smooth drawing
  points: { x: number; y: number }[];
}

const SAMPLE_COUNT = 80; // points per curve for smooth stroking

const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const pathsRef = useRef<FlowPath[]>([]);
  const startTimeRef = useRef<number>(0);

  const computePaths = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const blocks = container.querySelectorAll('[data-block-color]');
    const codePanel = container.querySelector('[data-code-panel]');
    if (!codePanel) return;

    const codePanelRect = codePanel.getBoundingClientRect();
    const paths: FlowPath[] = [];

    blocks.forEach((block, i) => {
      const blockRect = block.getBoundingClientRect();
      const color = block.getAttribute('data-block-color') || '#00f0ff';

      const sx = blockRect.right - rect.left;
      const sy = blockRect.top - rect.top + blockRect.height / 2;
      const ex = codePanelRect.left - rect.left;
      const codeLineSpacing = codePanelRect.height / (blocks.length + 1);
      const ey = codePanelRect.top - rect.top + codeLineSpacing * (i + 1);

      const midX = (sx + ex) / 2;
      const c1x = midX;
      const c1y = sy;
      const c2x = midX;
      const c2y = ey;

      // Pre-sample points along curve
      const points: { x: number; y: number }[] = [];
      for (let s = 0; s <= SAMPLE_COUNT; s++) {
        const t = s / SAMPLE_COUNT;
        points.push({
          x: bz(t, sx, c1x, c2x, ex),
          y: bz(t, sy, c1y, c2y, ey),
        });
      }

      paths.push({ sx, sy, ex, ey, c1x, c1y, c2x, c2y, color, points });
    });

    pathsRef.current = paths;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      computePaths();
    };
    resize();
    window.addEventListener('resize', resize);
    const initTimer = setTimeout(() => computePaths(), 100);

    const animate = (now: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const paths = pathsRef.current;
      const elapsed = (now - startTimeRef.current) / 1000; // seconds

      for (let p = 0; p < paths.length; p++) {
        const path = paths[p];
        const pts = path.points;
        if (pts.length < 2) continue;

        // Draw the static faint path
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Animated pulse — a bright segment that travels along the curve
        // Each stream has a slightly different speed/phase
        const speed = 0.3 + p * 0.05; // different speeds per stream
        const phase = p * 0.6;         // stagger starts
        const pulseLen = 0.25;         // fraction of curve the bright segment covers

        // Multiple pulses per stream for continuity
        for (let pulse = 0; pulse < 3; pulse++) {
          const rawHead = ((elapsed * speed + phase + pulse * 0.4) % 1.4) - 0.2;
          const head = rawHead;
          const tail = head - pulseLen;

          // Draw the bright moving segment
          for (let i = 1; i < pts.length; i++) {
            const segT = i / SAMPLE_COUNT;
            const prevT = (i - 1) / SAMPLE_COUNT;

            // How much of this segment overlaps with the pulse window
            if (segT < tail || prevT > head) continue;

            // Brightness based on distance from pulse head
            const midT = (segT + prevT) / 2;
            const distFromHead = head - midT;
            // Bright at head, fading toward tail
            const intensity = Math.max(0, 1 - (distFromHead / pulseLen));
            // Smooth easing
            const eased = intensity * intensity * (3 - 2 * intensity);
            // Fade at curve endpoints
            const endFade = midT < 0.08 ? midT / 0.08 : midT > 0.92 ? (1 - midT) / 0.08 : 1;

            const alpha = eased * endFade * 0.6;
            if (alpha < 0.01) continue;

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = path.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
          }

          // Bright dot at the head of the pulse
          if (head > 0 && head < 1) {
            const headIdx = Math.min(Math.floor(head * SAMPLE_COUNT), SAMPLE_COUNT);
            const hx = pts[headIdx].x;
            const hy = pts[headIdx].y;
            const endFade = head < 0.08 ? head / 0.08 : head > 0.92 ? (1 - head) / 0.08 : 1;

            // Crisp leading dot
            ctx.globalAlpha = endFade * 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hx, hy, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Colored glow around head
            ctx.globalAlpha = endFade * 0.15;
            ctx.fillStyle = path.color;
            ctx.beginPath();
            ctx.arc(hx, hy, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [computePaths]);

  return (
    <div style={{ background: '#0a0a0a', color: '#e0e0ff', minHeight: '100vh' }}>

      {/* ───── Navbar ───── */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#00f0ff',
            letterSpacing: '-0.5px',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          CircuitForge
        </span>
        <Link
          href="/editor"
          style={{
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            color: '#00f0ff',
            padding: '8px 24px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            fontFamily: 'var(--font-geist-mono), monospace',
            transition: 'all 0.2s',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Launch Editor →
        </Link>
      </nav>

      {/* ───── Centerpiece: Animated Transpilation ───── */}
      <section
        ref={containerRef}
        style={{
          padding: '60px 40px 80px',
          maxWidth: 940,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 120px 1fr',
          gap: 0,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Particle canvas overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Left Panel: Blocks */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 8,
            zIndex: 1,
          }}
        >
          {ANIMATED_BLOCKS.map((block, i) => (
            <div
              key={i}
              data-block-color={block.color}
              style={{
                position: 'relative',
                padding: '12px 16px',
                borderRadius: 6,
                backgroundColor: `${block.color}08`,
                border: `1px solid ${block.color}25`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Colored left notch */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  width: 3,
                  height: '60%',
                  borderRadius: '0 3px 3px 0',
                  backgroundColor: block.color,
                  boxShadow: `0 0 12px ${block.color}60`,
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  color: block.color,
                  opacity: 0.6,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  minWidth: 76,
                  paddingLeft: 8,
                }}
              >
                {block.label}
              </span>
              <span style={{ fontSize: 12, color: '#7a7a9a', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {block.code}
              </span>
            </div>
          ))}
        </div>

        {/* Center: empty gap for particles to flow through */}
        <div />

        {/* Right Panel: Code */}
        <div
          data-code-panel
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            padding: '20px 24px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 12,
            lineHeight: 2,
            zIndex: 1,
          }}
        >
          {/* Window dots */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <span style={{ marginLeft: 10, fontSize: 9, color: '#3a3a5a' }}>circuit.cairo</span>
          </div>
          {CAIRO_LINES.map((line, i) => (
            <div
              key={i}
              className="animate-fade-in-up"
              style={{ animationDelay: `${1.2 + i * 1.2}s`, margin: 0 }}
            >
              {line.colors.map((seg, j) => (
                <span key={j} style={{ color: seg.color || 'transparent' }}>{seg.text}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ───── Headline ───── */}
      <section
        style={{
          textAlign: 'center',
          padding: '0 20px 80px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h1
          className="animate-fade-in-up"
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '6px',
            textTransform: 'uppercase' as const,
            marginBottom: 40,
          }}
        >
          BUILD  ZK  CIRCUITS<br />
          WITH  DRAG  &  DROP
        </h1>

        <div
          className="animate-fade-in-up-delay-1"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 14,
            lineHeight: 1.8,
            textAlign: 'left',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            padding: '20px 30px',
            maxWidth: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>
              <span style={{ color: '#c792ea' }}>{'> '}</span>
              <span style={{ color: '#5a5a7a' }}>Design </span>
              <span style={{ color: '#00f0ff' }}>zero-knowledge proof</span>
              <span style={{ color: '#5a5a7a' }}> circuits visually.</span>
            </span>
            <span>
              <span style={{ color: '#c792ea' }}>{'> '}</span>
              <span style={{ color: '#5a5a7a' }}>Generate </span>
              <span style={{ color: '#ffcb6b' }}>Cairo</span>
              <span style={{ color: '#5a5a7a' }}> code automatically.</span>
            </span>
            <span>
              <span style={{ color: '#c792ea' }}>{'> '}</span>
              <span style={{ color: '#5a5a7a' }}>Deploy to </span>
              <span style={{ color: '#c3e88d' }}>Starknet</span>
              <span style={{ color: '#5a5a7a' }}> with one click.</span>
            </span>
          </div>
        </div>
      </section>

      {/* ───── Features — alternating left/right ───── */}
      <section style={{ padding: '100px 40px 60px', maxWidth: 900, margin: '0 auto' }}>
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#00f0ff',
            textTransform: 'uppercase' as const,
            letterSpacing: 4,
            marginBottom: 16,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          Features
        </p>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: '-1px',
          }}
        >
          Everything You Need
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#5a5a7a',
            fontSize: 14,
            marginBottom: 80,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          A complete toolkit for building, testing, and deploying ZK circuits on Starknet.
        </p>

        {features.map((f, i) => {
          const isRight = i % 2 === 0;
          return (
            <div
              key={f.title}
              style={{
                maxWidth: 520,
                marginBottom: 80,
                marginLeft: isRight ? 'auto' : 0,
                marginRight: isRight ? 0 : 'auto',
                textAlign: isRight ? 'right' : 'left',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: '3px',
                  marginBottom: 16,
                  textTransform: 'uppercase' as const,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: '#5a5a7a',
                  fontSize: 14,
                  lineHeight: 1.8,
                  fontFamily: 'var(--font-geist-mono), monospace',
                }}
              >
                {f.desc}
              </p>
            </div>
          );
        })}
      </section>

      {/* ───── How It Works ───── */}
      <section
        style={{
          padding: '80px 40px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#00f0ff',
            textTransform: 'uppercase' as const,
            letterSpacing: 4,
            marginBottom: 16,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          Workflow
        </p>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 64,
            letterSpacing: '-1px',
          }}
        >
          How It Works
        </h2>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Connecting line */}
          <div
            style={{
              position: 'absolute',
              top: 32,
              left: '16.67%',
              right: '16.67%',
              height: 1,
              background: 'linear-gradient(90deg, rgba(0,240,255,0.2), rgba(92,107,192,0.2), rgba(0,240,255,0.2))',
            }}
          />

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            {steps.map((s) => (
              <div key={s.num} style={{ flex: 1, textAlign: 'center' }}>
                {/* Step number circle */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    backgroundColor: 'rgba(0, 240, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#00f0ff',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {s.num}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: '#5a5a7a',
                    fontSize: 13,
                    lineHeight: 1.7,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    marginBottom: 12,
                  }}
                >
                  {s.desc}
                </p>
                {/* Code snippet */}
                <span
                  style={{
                    fontSize: 11,
                    color: '#00f0ff',
                    opacity: 0.4,
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  {s.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer
        style={{
          padding: '40px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <p
          style={{
            color: '#5a5a7a',
            fontSize: 12,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          CircuitForge — Visual ZK Circuit Builder for Starknet
        </p>
        <p
          style={{
            marginTop: 6,
            fontSize: 11,
            color: '#3a3a5a',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
