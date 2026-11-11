import { useEffect, useRef } from 'react';

const COLORS = ['#ffffff', '#ff4048', '#58a6ff', '#57d9ff', '#ffcb6b', '#c792ea'];

export default function VectorParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame;
    let particles = [];
    let confetti = [];
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(Math.floor((width * height) / 28000), 45);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 4 + Math.random() * 7,
        vx: (Math.random() - 0.48) * 0.48,
        vy: (Math.random() - 0.52) * 0.48,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.012,
        arrow: Math.random() > 0.62,
        red: Math.random() < 0.16,
        alpha: 0.15 + Math.random() * 0.36,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const drawShape = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const alpha = Math.max(0.08, p.alpha + Math.sin(p.pulse) * 0.07);
      ctx.strokeStyle = p.red ? `rgba(255,48,56,${alpha * 1.25})` : `rgba(255,255,255,${alpha})`;
      ctx.fillStyle = p.red ? `rgba(255,48,56,${alpha * 0.14})` : `rgba(255,255,255,${alpha * 0.09})`;
      ctx.lineWidth = 1.1;
      ctx.shadowColor = p.red ? '#ff3038' : 'transparent';
      ctx.shadowBlur = p.red ? 7 : 0;
      ctx.beginPath();
      if (p.arrow) {
        const s = p.size;
        ctx.moveTo(-s, -s * 0.55);
        ctx.lineTo(0, s * 0.8);
        ctx.lineTo(s, -s * 0.55);
        ctx.lineTo(0, -s * 0.05);
      } else {
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.86, r / 2);
        ctx.lineTo(-r * 0.86, r / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const burst = () => {
      const originX = width * 0.78;
      const originY = height * 0.46;
      confetti = Array.from({ length: 85 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 1.8 + Math.random() * 5.5;
        return {
          x: originX, y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 1,
          size: 2 + Math.random() * 4,
          rotation: Math.random() * 6,
          spin: (Math.random() - 0.5) * 0.25,
          color: COLORS[i % COLORS.length],
          life: 150 + Math.random() * 70,
          circle: Math.random() > 0.35,
        };
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,.014)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 80) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx; p.y += p.vy; p.rotation += p.spin; p.pulse += 0.018;
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
          if (p.y < -30) p.y = height + 30;
          if (p.y > height + 30) p.y = -30;
        }
        drawShape(p);
      });

      confetti = confetti.filter((p) => p.life > 0);
      confetti.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.992;
        p.rotation += p.spin; p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life / 45);
        ctx.fillStyle = p.color;
        if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('portfolio:burst', burst);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('portfolio:burst', burst);
    };
  }, []);

  return <canvas ref={canvasRef} className="vector-particle-canvas" aria-hidden="true" />;
}
