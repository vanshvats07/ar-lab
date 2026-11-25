import React, { useRef, useEffect } from 'react';

export function PendulumGraphCanvas({ trials = [], canvasRef }) {
  const localRef = useRef(null);
  const actualCanvas = canvasRef || localRef;

  useEffect(() => {
    const canvas = actualCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padL = 40;
    const padB = 30;
    const padR = 20;
    const padT = 20;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const maxL = 1.5; // meters
    const maxT2 = 6.0; // s²

    // Draw Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let l = 0; l <= maxL; l += 0.3) {
      const y = padT + plotH - (l / maxL) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(l.toFixed(1), padL - 6, y + 3);
    }

    for (let t2 = 0; t2 <= maxT2; t2 += 1.0) {
      const x = padL + (t2 / maxT2) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t2.toFixed(0), x, padT + plotH + 15);
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(width - padR, padT + plotH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('L (Meters)', padL + 5, padT + 12);

    ctx.textAlign = 'right';
    ctx.fillText('T² (s²)', width - padR, padT + plotH - 6);

    if (trials.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillText('Record oscillation times at different lengths.', width / 2, height / 2);
      return;
    }

    // Theoretical straight line: L = (g / 4π²) * T² ≈ 0.2485 * T²
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const startX = padL;
    const startY = padT + plotH;
    const endT2 = maxT2;
    const endL = (9.81 / (4 * Math.PI * Math.PI)) * endT2;
    const endX = padL + (endT2 / maxT2) * plotW;
    const endY = padT + plotH - (Math.min(maxL, endL) / maxL) * plotH;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Plot points
    trials.forEach((pt) => {
      const tSq = pt.period * pt.period;
      const cx = padL + (tSq / maxT2) * plotW;
      const cy = padT + plotH - (pt.length / maxL) * plotH;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Badge
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`g_std = 9.81 m/s²`, width - padR - 5, padT + 25);
  }, [trials]);

  return (
    <canvas
      ref={actualCanvas}
      width={360}
      height={200}
      className="w-full rounded-xl border border-white/10 shadow-inner bg-slate-900"
    />
  );
}
