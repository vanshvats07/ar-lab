import React, { useRef, useEffect } from 'react';

export function VIGraphCanvas({ readings = [], theoreticalR = 10, canvasRef }) {
  const localRef = useRef(null);
  const actualCanvas = canvasRef || localRef;

  useEffect(() => {
    const canvas = actualCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padL = 40;
    const padB = 30;
    const padR = 20;
    const padT = 20;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Axes bounds
    const maxV = 12.0; // Volts
    const maxI = 1.5; // Amps

    // Draw Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let v = 0; v <= maxV; v += 2) {
      const y = padT + plotH - (v / maxV) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      // Tick label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v.toString(), padL - 6, y + 3);
    }

    for (let i = 0; i <= maxI; i += 0.3) {
      const x = padL + (i / maxI) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(i.toFixed(1), x, padT + plotH + 15);
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
    ctx.fillText('V (Volts)', padL + 5, padT + 12);

    ctx.textAlign = 'right';
    ctx.fillText('I (Amps)', width - padR, padT + plotH - 6);

    if (readings.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillText('No readings yet. Adjust voltage & record 5 points.', width / 2, height / 2);
      return;
    }

    // Linear regression fit: V = m * I
    let sumI = 0;
    let sumV = 0;
    let sumI2 = 0;
    let sumIV = 0;
    const n = readings.length;

    readings.forEach((r) => {
      sumI += r.current;
      sumV += r.voltage;
      sumI2 += r.current * r.current;
      sumIV += r.current * r.voltage;
    });

    const slope = sumI2 !== 0 ? sumIV / sumI2 : theoreticalR;

    // Draw theoretical/best-fit line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const startX = padL;
    const startY = padT + plotH;
    const endI = maxI;
    const endV = slope * endI;
    const endX = padL + (endI / maxI) * plotW;
    const endY = padT + plotH - (Math.min(maxV, endV) / maxV) * plotH;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Plot data points
    readings.forEach((pt, index) => {
      const cx = padL + (pt.current / maxI) * plotW;
      const cy = padT + plotH - (pt.voltage / maxV) * plotH;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Slope badge
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Slope R = ${slope.toFixed(2)} Ω`, width - padR - 5, padT + 25);
  }, [readings, theoreticalR]);

  return (
    <canvas
      ref={actualCanvas}
      width={360}
      height={200}
      className="w-full rounded-xl border border-white/10 shadow-inner bg-slate-900"
    />
  );
}
