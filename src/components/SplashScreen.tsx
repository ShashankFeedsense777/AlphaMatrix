import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Logo } from '../assets/index'


interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const logo = logoRef.current;
    const eyebrow = eyebrowRef.current;
    const headline = headlineRef.current;

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

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete,
    });

    if (targetLogo) {
      gsap.set(targetLogo, { autoAlpha: 0 });
    }

    timeline
      .set(root, { autoAlpha: 1 })
      .fromTo(
        logo,
        { scale: 0.72, y: 18, autoAlpha: 0, filter: 'blur(10px)' },
        { scale: 2, y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.15, ease: 'expo.out' }
      )
      .fromTo(
        eyebrow,
        { y: 18, autoAlpha: 0, letterSpacing: '0.2em' },
        { y: 0, autoAlpha: 1, letterSpacing: '0.45em', duration: 0.85, ease: 'power3.out' },
        '-=0.35'
      )
      .fromTo(
        headlineWords,
        { y: 32, autoAlpha: 0, filter: 'blur(8px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.75, stagger: 0.11, ease: 'power3.out' },
        '-=0.2'
      )
      .to([eyebrow, headlineWords], { y: -14, autoAlpha: 0, filter: 'blur(6px)', duration: 0.55 }, '+=0.55')
      .to(logo, { x: targetX, y: targetY, scale: targetScale, duration: 1.25, ease: 'expo.inOut' }, '-=0.08')
      .addLabel('dock')
      .to(root, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.45 }, 'dock-=0.22')
      .to(logo, { autoAlpha: 0, duration: 0.22, ease: 'power2.out' }, 'dock+=0.02')
      .to(targetLogo, { autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, 'dock+=0.02')
      .to(root, { autoAlpha: 0, duration: 0.2 }, 'dock+=0.2');

    return () => {
      timeline.kill();
      if (targetLogo) {
        gsap.set(targetLogo, { clearProps: 'visibility,opacity' });
      }
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black opacity-0"
    >
      <img
        ref={logoRef}
        src={Logo}
        alt="Alpha Matrix"
        className="w-64 h-64 md:w-80 md:h-80 object-contain"
      />
      <div className="mt-8 text-center">
        <p ref={eyebrowRef} className="text-xs md:text-sm text-brand-saffron uppercase font-semibold opacity-0">
        </p>
        <p ref={headlineRef} className="mt-4 text-2xl md:text-4xl text-white font-light tracking-wide">
          {['Intelligent', 'Markets.', 'Built', 'Slowly.'].map((word) => (
            <span key={word} className="inline-block opacity-0 mr-2 last:mr-0">
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
