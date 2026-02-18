"use client";

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
  glowIntensity: number;
}

interface DataPacket {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  color: string;
}

const COLORS = ['#7c4dff', '#448aff', '#00f0ff', '#5c6bc0', '#00bfa5', '#ffab40'];
const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 200;
const SPEED = 0.15;
const GRID_SPACING = 40;
const SCANNER_SPEED = 0.04;
const MAX_PACKETS = 15;

const CircuitBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<DataPacket[]>([]);
  const animFrameRef = useRef<number>(0);
  const scannerYRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize nodes
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      radius: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      glowIntensity: 0,
    }));

    packetsRef.current = [];

    const animate = () => {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const nodes = nodesRef.current;
      const packets = packetsRef.current;
      const time = Date.now() * 0.001;

      // ── Dot grid ──
      ctx.fillStyle = '#ffffff';
      for (let gx = GRID_SPACING; gx < W; gx += GRID_SPACING) {
        for (let gy = GRID_SPACING; gy < H; gy += GRID_SPACING) {
          // fade towards edges
          const edgeFade = Math.min(gx, W - gx, gy, H - gy) / 200;
          const fade = Math.min(edgeFade, 1);
          ctx.globalAlpha = 0.04 * fade;
          ctx.beginPath();
          ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Scanner beam ──
      scannerYRef.current += SCANNER_SPEED * (H * 0.016);
      if (scannerYRef.current > H + 100) scannerYRef.current = -100;
      const sy = scannerYRef.current;

      const beamGrad = ctx.createLinearGradient(0, sy - 60, 0, sy + 60);
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      beamGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.03)');
      beamGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.07)');
      beamGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.03)');
      beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, sy - 60, W, 120);

      // thin bright center line
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();

      // ── Update node positions ──
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));

        // scanner proximity glow
        const distToScanner = Math.abs(node.y - sy);
        if (distToScanner < 80) {
          node.glowIntensity = Math.min(1, node.glowIntensity + 0.08);
        } else {
          node.glowIntensity = Math.max(0, node.glowIntensity - 0.015);
        }
      }

      // ── Draw connections ──
      const activeConnections: [number, number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            const pulse = Math.sin(time + nodes[i].pulsePhase) * 0.5 + 0.5;
            const glow = Math.max(nodes[i].glowIntensity, nodes[j].glowIntensity);
            const finalOpacity = opacity * (0.4 + pulse * 0.6) + glow * 0.15;

            ctx.strokeStyle = glow > 0.3 ? '#00f0ff' : nodes[i].color;
            ctx.globalAlpha = Math.min(finalOpacity, 0.4);
            ctx.lineWidth = glow > 0.3 ? 1 : 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            activeConnections.push([i, j, dist]);
          }
        }
      }

      // ── Spawn data packets ──
      if (packets.length < MAX_PACKETS && activeConnections.length > 0 && Math.random() < 0.03) {
        const [fromIdx, toIdx] = activeConnections[Math.floor(Math.random() * activeConnections.length)];
        packets.push({
          fromIdx,
          toIdx,
          progress: 0,
          speed: 0.005 + Math.random() * 0.01,
          color: '#00f0ff',
        });
      }

      // ── Draw & update data packets ──
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }
        const from = nodes[pkt.fromIdx];
        const to = nodes[pkt.toIdx];
        const px = from.x + (to.x - from.x) * pkt.progress;
        const py = from.y + (to.y - from.y) * pkt.progress;

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = pkt.color;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // packet glow
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw nodes ──
      for (const node of nodes) {
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7;
        const glow = node.glowIntensity;
        const baseAlpha = 0.5 + glow * 0.5;

        // outer glow when scanner-lit
        if (glow > 0.1) {
          ctx.globalAlpha = glow * 0.15;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // node body
        ctx.globalAlpha = baseAlpha * pulse;
        ctx.fillStyle = glow > 0.3 ? '#00f0ff' : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (1 + glow * 0.5), 0, Math.PI * 2);
        ctx.fill();

        // subtle halo
        ctx.globalAlpha = 0.08 * pulse;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default CircuitBackground;
