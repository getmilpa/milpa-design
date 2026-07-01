/* Milpa motion config — for GSAP / ScrollTrigger. Mirrors milpa-tokens.css. */
export const motion = {
  duration: { instant: 0, fast: 0.12, base: 0.2, moderate: 0.32, slow: 0.48, deliberate: 0.72 }, // seconds
  ease:     { standard: 'power2.out', settle: 'power3.out', grano: 'expo.out', in: 'power2.in', linear: 'none' },
  easeCSS:  { standard: [0.4,0,0.2,1], settle: [0.2,0.8,0.2,1], grano: [0.16,1,0.3,1], in: [0.4,0,1,1] },
  stagger:  { tight: 0.04, base: 0.07, loose: 0.12 },
  rise:     { sm: 8, base: 16, lg: 32 },
  scrollTrigger: { start: 'top 80%', end: 'bottom 60%', toggleActions: 'play none none reverse' },
};

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Signature — the grano kernels assembling into the M:
gsap.from('.grano', {
  y: motion.rise.base, opacity: 0,
  duration: motion.duration.slow, ease: motion.ease.grano,
  stagger: motion.stagger.base,
  scrollTrigger: { trigger: '#hero', ...motion.scrollTrigger },
}); */
