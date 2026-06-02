import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Logo } from '../assets/index';

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

    const targetLogo = document.getElementById('navbar-logo');
    const targetRect = targetLogo?.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const targetX = targetRect
      ? targetRect.left + targetRect.width / 2 - (logoRect.left + logoRect.width / 2)
      : 0;
    const targetY = targetRect
      ? targetRect.top + targetRect.height / 2 - (logoRect.top + logoRect.height / 2)
      : -window.innerHeight / 2 + 96;
    const targetScale = targetRect ? targetRect.width / logoRect.width : 0.32;

    const headlineWords = Array.from(headline.children);

    if (targetLogo) gsap.set(targetLogo, { autoAlpha: 0 });

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
      .to(logo,
        { x: targetX, y: targetY, scale: targetScale, duration: 1.2, ease: 'expo.inOut' },
        '-=0.05'
      )
      .addLabel('dock')
      .to(root, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.35 }, 'dock-=0.2')
      .to(logo, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, 'dock')
      .to(targetLogo, { autoAlpha: 1, duration: 0.18, ease: 'power2.out' }, 'dock')
      .to(root, { autoAlpha: 0, duration: 0.15, ease: 'none' }, 'dock+=0.15');

    return () => {
      tl.kill();
      if (targetLogo) gsap.set(targetLogo, { clearProps: 'visibility,opacity' });
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
      <div className="relative">
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-40px',
            background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(0,242,254,0.07) 40%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <img
          ref={logoRef}
          src={Logo}
          alt="Alpha Matrix"
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 object-contain relative z-10"
        />
      </div>

      {/* Eyebrow */}
      <p
        ref={eyebrowRef}
        className="mt-8 sm:mt-10 text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase opacity-0"
        style={{ color: '#00f2fe', letterSpacing: '0.38em' }}
      >
        Quantitative Intelligence
      </p>

      {/* Brand */}
      <p className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-[0.18em]">
        ALPHA <span className="font-semibold">MATRIX</span>
      </p>

      {/* Since */}
      <p
        ref={sinceRef}
        className="mt-2 text-xs sm:text-sm md:text-base font-light tracking-[0.22em] opacity-0"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Since 2026
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