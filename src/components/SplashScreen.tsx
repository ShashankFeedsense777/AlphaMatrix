import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { alphaMatrix1 } from '../assets/index';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const sinceRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const logo = logoRef.current;
    const eyebrow = eyebrowRef.current;
    const headline = headlineRef.current;
    const since = sinceRef.current;
    const divider = dividerRef.current;
    const bar = barRef.current;

    if (!root || !logo || !eyebrow || !headline) return;

    const headlineWords = Array.from(headline.children);

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete });

    tl.set(root, { autoAlpha: 1 })
      .fromTo(logo,
        { scale: 0.6, autoAlpha: 0, filter: 'blur(14px)' },
        { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }
      )
      .fromTo(eyebrow,
        { y: 16, autoAlpha: 0, letterSpacing: '0.2em' },
        { y: 0, autoAlpha: 1, letterSpacing: '0.38em', duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo([since, divider],
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out', stagger: 0.1 },
        '-=0.5'
      )
      .fromTo(headlineWords,
        { y: 28, autoAlpha: 0, filter: 'blur(8px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.65, stagger: 0.1, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(bar,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 2, ease: 'power2.inOut' },
        '-=0.2'
      )
      .to([eyebrow, since, divider, headlineWords, bar],
        { y: -12, autoAlpha: 0, filter: 'blur(5px)', duration: 0.45, stagger: 0.03 },
        '+=0.25'
      )
      .to(root, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, '-=0.05');

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center opacity-0"
      style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #2d1205 0%, #060608 70%)' }}>
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: 'clamp(32px, 5vw, 48px) clamp(32px, 5vw, 48px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, #060608 100%)' }}
      />

      {/* Corner accents */}
      {[
        'top-6 left-6 border-t border-l sm:top-8 sm:left-8',
        'top-6 right-6 border-t border-r sm:top-8 sm:right-8',
        'bottom-6 left-6 border-b border-l sm:bottom-8 sm:left-8',
        'bottom-6 right-6 border-b border-r sm:bottom-8 sm:right-8',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${cls} border-[#00f2fe] opacity-25`} />
      ))}

      {/* Logo */}
      <div className="relative flex flex-col items-center">
  <div
    className="absolute pointer-events-none"
    style={{
      inset: "-40px",
      background:
        "radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(0,242,254,0.07) 40%, transparent 70%)",
      borderRadius: "50%",
    }}
  />

  <img
    ref={logoRef}
    src={alphaMatrix1}
    alt="AlphaMatrix"
    className="h-auto object-contain relative z-10"
    style={{
      width: "clamp(160px, 26vw, 360px)",
    }}
  />

  <span
    className="
      relative z-10
      mt-5
      mb-8
      text-xl
      sm:text-2xl
      md:text-3xl
      lg:text-4xl
      font-bold
      uppercase
      tracking-[0.3em]
      text-white
      text-center
    "
  >
    AlphaMatrix
  </span>
</div>

      {/* Eyebrow */}
      <p
        ref={eyebrowRef}
        className="mt-0 sm:mt-0 text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase opacity-0"
        style={{ color: '#00f2fe', letterSpacing: '0.38em' }}
      >
        Quantitative Intelligence
      </p>

      {/* Brand */}
      <p className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-[0.18em]">
        {/* ALPHA <span className="font-semibold">MATRIX</span> */}
      </p>

      {/* Since */}
      <p
        ref={sinceRef}
        className="mt-2 text-xs sm:text-sm md:text-base font-light tracking-[0.22em] opacity-0"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {/* Since 2026 */}
      </p>

      {/* Divider */}
      <div
        ref={dividerRef}
        className="opacity-0"
        style={{
          width: '1px',
          height: 'clamp(24px, 4vh, 36px)',
          margin: 'clamp(16px, 3vh, 28px) auto',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Headline */}
      <p
        ref={headlineRef}
        className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wide px-6 text-center"
      >
        {['Intelligent', 'Markets.', 'Built', 'Slowly.'].map((word, i) => (
          <span
            key={word}
            className="inline-block opacity-0"
            style={{ color: i % 2 === 0 ? 'rgba(255,255,255,0.65)' : '#fff' }}
          >
            {word}
          </span>
        ))}
      </p>

      {/* Loading bar */}
      <div
        className="mt-14 sm:mt-16 md:mt-20 rounded-full overflow-hidden"
        style={{
          width: 'clamp(120px, 22vw, 200px)',
          height: '3px',
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #f97316, #00f2fe, #6366f1)',
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;