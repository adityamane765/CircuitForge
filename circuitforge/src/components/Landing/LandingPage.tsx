"use client";

import React from 'react';
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
  { code: 'private input: a', color: '#7c4dff', label: 'INPUT' },
  { code: 'private input: b', color: '#7c4dff', label: 'INPUT' },
  { code: 'c = a + b', color: '#448aff', label: 'ARITHMETIC' },
  { code: 'assert c == 10', color: '#ff5252', label: 'CONSTRAINT' },
];

const ANIMATED_CODE_LINES = [
  { text: 'let a: felt252 = get_private_input();', color: '#e0e0ff' },
  { text: 'let b: felt252 = get_private_input();', color: '#e0e0ff' },
  { text: 'let c = a + b;', color: '#e0e0ff' },
  { text: 'assert(c == 10);', color: '#e0e0ff' },
];

const LandingPage: React.FC = () => {
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
        style={{
          padding: '60px 40px 80px',
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* Left Panel: Blocks */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 12,
            perspective: '1000px',
          }}
        >
          {ANIMATED_BLOCKS.map((block, i) => (
            <div
              key={i}
              className="animate-fade-in-up"
              style={{
                position: 'relative',
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${block.color}30`,
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: 280,
                animationDelay: `${0.5 + i * 1.5}s`,
              }}
            >
              <div style={{ width: 3, height: 28, borderRadius: 2, backgroundColor: block.color, opacity: 0.6 }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: block.color, opacity: 0.5, fontFamily: 'var(--font-geist-mono), monospace' }}>
                {block.label}
              </span>
              <span style={{ fontSize: 12, color: '#6a6a8a', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {block.code}
              </span>
            </div>
          ))}
        </div>

        {/* Right Panel: Code */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            padding: '20px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 13,
            height: '100%',
          }}
        >
          {ANIMATED_CODE_LINES.map((line, i) => (
            <p key={i} style={{ margin: 0, padding: 0, height: '22px' }}>
              <span
                className="typing-effect"
                style={{
                  animationDelay: `${1 + i * 1.5}s`,
                  color: line.color,
                }}
              >
                {line.text}
              </span>
            </p>
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
