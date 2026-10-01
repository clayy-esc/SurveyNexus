import React, { useEffect, useRef } from 'react';

interface StarfieldBackgroundProps {
  starCount?: number;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ starCount = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number, y: number, z: number, o: number, size: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        o: Math.random() * 0.8 + 0.2, // Base opacity
        size: Math.random() * 1.5 + 0.5
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let starColor = getComputedStyle(canvas)
      .getPropertyValue('--starfield-star')
      .trim();

    const themeObserver = new MutationObserver(() => {
      starColor = getComputedStyle(canvas)
        .getPropertyValue('--starfield-star')
        .trim();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const cx = width / 2;
      const cy = height / 2;
      const dx = (mouseX - cx) * 0.03;
      const dy = (mouseY - cy) * 0.03;

      stars.forEach(star => {
        // Slowly move stars towards the viewer
        star.z -= 0.2;
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width;
          star.y = Math.random() * height;
        }

        // 3D projection to 2D screen with parallax based on mouse
        const factor = (width / 2) / star.z;
        const sx = (star.x - cx) * factor + cx - dx * (width / star.z);
        const sy = (star.y - cy) * factor + cy - dy * (width / star.z);

        const size = Math.max(0.1, star.size * factor * 0.5);
        const opacity = Math.min(1, (1 - star.z / width) * star.o * 2);

        if (sx > 0 && sx < width && sy > 0 && sy < height) {
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, 2 * Math.PI);
          ctx.fillStyle = starColor;
          ctx.globalAlpha = opacity;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      themeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount]);

  return (
    <div className="auth-starfield fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Nebula gradients for the Milky Way effect */}
      <div
        className="auth-nebula absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 75% 28% at 50% 78%, var(--primary) 0%, transparent 68%), radial-gradient(circle at 18% 24%, var(--primary) 0%, transparent 38%), radial-gradient(circle at 84% 18%, var(--starfield-nebula-secondary) 0%, transparent 34%)'
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
