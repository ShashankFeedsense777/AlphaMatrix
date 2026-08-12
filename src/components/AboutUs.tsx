import React, { useEffect, useRef, useMemo } from 'react';
import SectionReveal, { fadeLeft, scaleIn, staggerContainer, fadeUp } from './SectionReveal';
import { Person1, Person2, Person3, Person4, Person5 } from '../assets/index';
import { AnimatePresence, motion } from 'framer-motion';
import { getCachedVideoUrl } from '../utils/videoCache';

const teamMembers = [
  {
    name: 'Aniel Malik',
    image: Person3,
    role: 'Director — The Quintessential Mentor',
    quote: 'Trust is the cornerstone of every enduring investment relationship.',
    headings: [
      {
        title: '40+ Years of Market Wisdom',
        text: 'Having navigated more than four decades of market cycles — from periods of remarkable growth to significant volatility and transformative technological change — Aniel brings a depth of perspective that few can match.',
      },
      {
        title: 'Discipline & Long-Term Thinking',
        text: 'These decades of experience consistently reinforce the importance of prudent risk management, disciplined execution, and maintaining a long-term perspective — principles that underpin every strategy at AlphaMatrix.',
      },
      {
        title: 'Trust & Legacy',
        text: "Dedicated to cultivating lasting relationships founded on integrity, transparency, and excellence — the firm's goal is not merely to navigate market complexities, but to help clients build wealth with confidence, clarity, and consistency.",
      },
    ],
  },
  {
    name: 'Rohit Aniel Malik',
    image: Person2,
    role: 'Founder, CEO & Chief Quantitative Strategist',
    quote: 'Empowering the Next Generation of Traders.',
    headings: [
      {
        title: 'Quantitative Trading',
        text: 'Over 20 years of experience in trading, systematic investing, market research, and risk management — developing data-driven strategies that combine rigorous research, disciplined execution, and robust risk controls across derivatives and algorithmic trading.',
      },
      {
        title: 'AI-Powered Market Intelligence',
        text: 'Leverages Artificial Intelligence and machine learning to enhance market intelligence, optimize strategy development, and automate decision-making — bringing institutional-grade quantitative investing to traders and investors.',
      },
      {
        title: 'Vision & Leadership',
        text: "Passionate about the intersection of finance and technology, Rohit's mission is to democratize access to advanced quantitative investing — empowering the next generation through discipline, innovation, and continuous learning.",
      },
    ],
  },
  {
    name: 'Khushboo Malik',
    image: Person1,
    role: 'Director',
    quote: 'The Creative Force that Binds the Pieces.',
    headings: [
      {
        title: 'Client Empowerment',
        text: 'Committed to equipping traders and investors with the tools, knowledge, and confidence to make informed decisions. Combines proven market principles with quantitative research and disciplined risk management to deliver consistency.',
      },
      {
        title: 'Technology & Innovation',
        text: 'Actively embraces Artificial Intelligence and automation to enhance analysis, improve decision-making, and build scalable investment solutions — believing that innovation paired with integrity creates the foundation for sustainable success.',
      },
      {
        title: 'Strategic Vision',
        text: "Drives the firm's mission of building a trusted platform where technology, expertise, and continuous learning converge — helping clients navigate markets with confidence and achieve lasting financial growth.",
      },
    ],
  },
  {
    name: 'Shailendra Singh',
    image: Person4,
    role: 'Director',
    quote: 'Technology, discipline, and risk management are the pillars of sustainable market leadership.',
    headings: [
      {
        title: '21+ Years of Capital Markets Leadership',
        text: 'With over two decades of experience spanning institutional broking, proprietary trading, commodities, equities, and financial market infrastructure, Shailendra has successfully built and scaled technology-driven brokerage businesses across multiple asset classes.',
      },
      {
        title: 'Technology-Driven Market Infrastructure',
        text: 'Leads the development of institutional-grade trading platforms focused on low-latency execution, robust risk management, operational resilience, and comprehensive regulatory compliance, delivering world-class trading experiences.',
      },
      {
        title: 'Strategic Growth & Innovation',
        text: "Guides AlphaMatrix's long-term strategic vision by championing digital transformation, innovation, and data-driven decision-making. His leadership is centred on creating a globally competitive capital markets institution that delivers sustainable value for clients, partners, and stakeholders.",
      },
    ],
  },
  {
    name: 'Vidhi Gala',
    image: Person5,
    role: 'Director',
    quote: 'Informed decisions, disciplined execution, and integrity create lasting financial success.',
    headings: [
      {
        title: '15+ Years of Market Expertise',
        text: 'Brings over 15 years of experience across equity and derivatives trading, investment strategy, financial planning, portfolio management, and market research, providing clients with comprehensive market insights.',
      },
      {
        title: 'Strategic Leadership',
        text: 'As Director, Vidhi plays a key role in shaping the organisation’s strategic direction, driving innovation, strengthening business development, and navigating the evolving landscape of capital markets with a balanced approach to growth and risk.',
      },
      {
        title: 'Excellence & Sustainable Growth',
        text: 'Combines strong analytical thinking, sound risk management, and leadership with an unwavering commitment to integrity and professionalism, fostering informed decision-making and long-term sustainable growth for clients and the organisation.',
      },
    ],
  },
];

const ABOUT_VIDEOS = [
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780914017/Circle_Frame1_ddntd8.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780914015/Footer_rrbhuu.mp4',
];

const VISIBLE_COUNT = 3;
const AUTO_ADVANCE_MS = 4500;
const MOBILE_IMAGE_HEIGHT = 300; // use the larger sm: value so the reservation is never too small
const MOBILE_GAP = 16; // use the larger sm:gap-4 value so the reservation is never too small

/** Content panel — always mounted, height animates between 0 and its real
 * measured scrollHeight on mobile. On desktop (lg) it's pinned to the fixed
 * row height set by the parent card, matching the old side-by-side layout. */
const ContentPanel: React.FC<{
  isActive: boolean;
  children: React.ReactNode;
}> = ({ isActive, children }) => {
  return (
    <div
      className="overflow-hidden lg:!h-full lg:!opacity-100 lg:flex-1 lg:overflow-y-auto"
      style={{
        background: 'linear-gradient(160deg, #faf9f7 0%, #f3f1ee 100%)',
        borderLeft: '1px solid rgba(0,0,0,0.05)',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

const MemberContent: React.FC<{ member: (typeof teamMembers)[number] }> = ({ member }) => (
  <div className="p-5 sm:p-7 lg:p-8">
    <div className="mb-3">
      <span
        className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm"
        style={{ background: '#111', color: '#fff', letterSpacing: '0.18em' }}
      >
        {member.role}
      </span>
    </div>

    <h4
      className="font-black leading-tight mb-2 text-brand-saffron"
      style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: 'Georgia, serif' }}
    >
      {member.name}
    </h4>

    <div className="w-10 h-0.5 bg-brand-saffron/40 mb-5" />

    <div className="space-y-3 sm:space-y-4 mb-5">
      {member.headings.map((item, idx) => (
        <div key={item.title}>
          {idx === 0 ? (
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{item.text}</p>
          ) : (
            <div className="flex gap-2.5">
              <div className="mt-1.5 w-1 h-1 rounded-full bg-brand-saffron shrink-0" />
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                <span className="font-semibold text-gray-800">{item.title}. </span>
                {item.text}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="mt-2 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex gap-3 items-start">
        <div className="w-0.5 min-h-6 bg-brand-saffron rounded-full shrink-0 self-stretch" />
        <p
          className="text-brand-saffron text-xs sm:text-sm leading-relaxed"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          "{member.quote}"
        </p>
      </div>
    </div>
  </div>
);

const AboutUs: React.FC = () => {
  const total = teamMembers.length;

  // windowStart = index of the leftmost visible card in the circular sequence
  const [windowStart, setWindowStart] = React.useState(0);
  const [activeName, setActiveName] = React.useState(teamMembers[0].name);
  const [isPaused, setIsPaused] = React.useState(false);

  const cachedAboutRef = useRef<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Reserved-height measurement (mobile only) ──
  // Measures every member's content height off-screen once, so the row can
  // reserve enough space for the tallest possible expanded card. This stops
  // sections below AboutUs from shifting when a card expands/collapses.
  const [maxContentHeight, setMaxContentHeight] = React.useState(0);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const heights = measureRefs.current.filter(Boolean).map((el) => el!.scrollHeight);
    if (heights.length) setMaxContentHeight(Math.max(...heights));
  }, []);

  // Compute the 3 globally-indexed members currently visible, left→right
  const visibleIndices = useMemo(
    () => Array.from({ length: VISIBLE_COUNT }, (_, i) => (windowStart + i) % total),
    [windowStart, total]
  );
  const visibleMembers = useMemo(
    () => visibleIndices.map((idx) => teamMembers[idx]),
    [visibleIndices]
  );

  // Auto-advance the window every interval, unless paused
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setWindowStart((prev) => (prev + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  // Keep the active/expanded card if it's still visible after a slide,
  // otherwise fall back to the new leftmost card
  React.useEffect(() => {
    const stillVisible = visibleMembers.some((m) => m.name === activeName);
    if (!stillVisible) {
      setActiveName(visibleMembers[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowStart]);

  useEffect(() => {
    Promise.all(ABOUT_VIDEOS.map(getCachedVideoUrl)).then((blobUrls) => {
      cachedAboutRef.current = blobUrls;
      if (videoRef.current) {
        videoRef.current.src = blobUrls[0];
      }
    });
  }, []);

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const i = Number(video.dataset.currentIndex || 0);
    const next = (i + 1) % ABOUT_VIDEOS.length;
    video.dataset.currentIndex = String(next);
    video.src = cachedAboutRef.current[next] || ABOUT_VIDEOS[next];
    video.play();
  };

  const goTo = (idx: number) => {
    setWindowStart(((idx % total) + total) % total);
    setIsPaused(true);
  };

  return (
    <>
      <section
        id="aboutus"
        className="relative px-4 sm:px-6 border-t-0"
        style={{ paddingTop: '4rem', paddingBottom: 0 }}
      >
        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── Hero row ── */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <SectionReveal
              variants={scaleIn}
              className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-none lg:w-1/2 relative mx-auto lg:mx-0"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
                style={{ willChange: 'transform', margin: '-16px' }}
                className="absolute inset-0 rounded-full border border-brand-saffron/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 44, ease: 'linear' }}
                style={{ willChange: 'transform', margin: '-32px' }}
                className="absolute inset-0 rounded-full border border-dashed border-brand-saffron/10"
              />
              <div className="aspect-square bg-linear-to-tr from-[#1a0505] via-brand-saffron/10 to-brand-saffron/25 rounded-full flex items-center justify-center p-6 sm:p-8 overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.75; }}
                  onEnded={handleVideoEnded}
                />
                <div className="text-center relative z-10 select-none">
                  <h3 className="text-[clamp(2rem,8vw,4.5rem)] font-bold text-white tracking-tight mb-1">AlphaMatrix</h3>
                </div>
              </div>
            </SectionReveal>

            <motion.div
              className="w-full lg:w-1/2"
              variants={staggerContainer(0.13)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.div variants={fadeLeft} className="flex items-center space-x-4 mb-5 sm:mb-7">
                <h2 className="text-[11px] sm:text-xs tracking-[0.24em] sm:tracking-[0.3em] text-brand-saffron uppercase font-bold">
                  About Us
                </h2>
                <div className="h-px w-12 bg-brand-saffron/50" />
              </motion.div>

              <motion.h3
                variants={fadeUp}
                className="text-[clamp(1.6rem,4vw,3rem)] font-light text-white leading-tight mb-5 sm:mb-7"
              >
                Pioneering the intersection of{' '}
                <span className="font-bold text-white">human ingenuity</span> and{' '}
                <span className="text-brand-saffron font-bold">machine precision.</span>
              </motion.h3>

              <motion.p variants={fadeUp} className="text-gray-400 text-sm sm:text-base lg:text-lg font-light leading-relaxed mb-4 sm:mb-5">
                AlphaMatrix was founded with a singular focus: to engineer absolute returns
                regardless of market climate. We employ a multidisciplinary approach,
                combining deep financial expertise with bleeding-edge AI and robust infrastructure.
              </motion.p>

              <motion.p variants={fadeUp} className="text-gray-400 text-sm sm:text-base lg:text-lg font-light leading-relaxed mb-7 sm:mb-9">
                Our team consists of brilliant minds from diverse fields — mathematics,
                computer science, and physics — all driven by the pursuit of alpha.
              </motion.p>
            </motion.div>
          </div>

          {/* ── Leadership team ── */}
          <motion.div
            className="mt-20 sm:mt-28 pb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-8 sm:mb-12">
              <h2 className="text-brand-saffron text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-3 sm:mb-4">
                Leadership Team
              </h2>
              <h3 className="text-3xl sm:text-4xl font-light text-white">
                The People Behind
                <span className="block font-bold text-white">AlphaMatrix</span>
              </h3>
            </div>

            {/* Hidden measurement pass — computes maxContentHeight, never visible */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:!min-h-0">
            </div>

            {/* Sliding-window cards */}
            <div
              className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:!min-h-0"
              style={{
                // Reserve space for ALL visible cards' collapsed images + gaps,
                // plus the tallest possible expanded content panel — not just one.
                // This must always be >= the real rendered height, or the
                // container still grows/shrinks and everything below drifts.
                minHeight: maxContentHeight
                  ? VISIBLE_COUNT * MOBILE_IMAGE_HEIGHT +
                  (VISIBLE_COUNT - 1) * MOBILE_GAP +
                  maxContentHeight
                  : undefined,
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {visibleMembers.map((member) => {
                  const isActive = activeName === member.name;
                  return (
                    <motion.div
                      key={member.name}
                      layout
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{
                        layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.35 },
                        x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                      }}
                      className={`relative overflow-hidden rounded-2xl sm:rounded-[28px] lg:h-[560px] cursor-pointer flex-none ${isActive ? 'lg:flex-[4]' : 'lg:flex-1'}`}
                      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                      onClick={() => {
                        setActiveName(member.name);
                        setIsPaused(true);
                      }}
                      onMouseEnter={() => {
                        setActiveName(member.name);
                        setIsPaused(true);
                      }}
                      onMouseLeave={() => {
                        setIsPaused(false);
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:h-full overflow-hidden">

                        {/* Image panel — fixed height at every breakpoint, never animated */}
                        <div
                          className="relative h-[280px] sm:h-[300px] lg:h-auto lg:w-[260px] xl:w-[300px] shrink-0 overflow-hidden"
                        >
                          <AnimatePresence initial={false} mode="sync">
                            <motion.img
                              key={member.name}
                              src={member.image}
                              alt={member.name}
                              initial={{ opacity: 0, scale: 1.04 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                filter: isActive ? 'grayscale(0)' : 'grayscale(1)',
                              }}
                              exit={{ opacity: 0, scale: 1.02 }}
                              transition={{
                                opacity: { duration: 0.45, ease: 'easeInOut' },
                                scale: { duration: 0.7, ease: 'easeOut' },
                                filter: { duration: 0.5 },
                              }}
                              className="absolute inset-0 w-full h-full object-cover object-top lg:object-center"
                            />
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                            <h4 className="text-white text-base sm:text-lg font-bold leading-tight drop-shadow-lg">
                              {member.name}
                            </h4>
                          </div>
                        </div>

                        {/* Content panel — smooth measured height on mobile, fixed on desktop */}
                        <ContentPanel isActive={isActive}>
                          <AnimatePresence initial={false} mode="sync">
                            {isActive && (
                              <motion.div
                                key={member.name}
                                initial={{ opacity: 0, x: 25 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -25 }}
                                transition={{
                                  duration: 0.4,
                                  ease: 'easeInOut',
                                }}
                              >
                                <MemberContent member={member} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </ContentPanel>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ── Manual slider control ── */}
            <div className="mt-8 sm:mt-10 mb-16 sm:mb-8 max-w-md lg:max-w-none mx-auto lg:mx-0 relative z-20">
              <input
                type="range"
                min={0}
                max={total - 1}
                step={1}
                value={windowStart}
                onChange={(e) => goTo(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-saffron [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-saffron [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(255,255,255,0.1)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-saffron [&::-moz-range-thumb]:border-0"
                style={{
                  background: `linear-gradient(to right, var(--color-brand-saffron, #f5a623) 0%, var(--color-brand-saffron, #f5a623) ${(windowStart / (total - 1)) * 100}%, rgba(255,255,255,0.15) ${(windowStart / (total - 1)) * 100}%, rgba(255,255,255,0.15) 100%)`,
                }}
              />
              <div className="flex justify-between mt-3">
                {teamMembers.map((member, idx) => {
                  const isInWindow = visibleIndices.includes(idx);
                  return (
                    <button
                      key={member.name}
                      onClick={() => goTo(idx)}
                      className="flex flex-col items-center gap-1.5 group"
                      aria-label={`Go to ${member.name}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${isInWindow ? 'bg-brand-saffron scale-125' : 'bg-white/25 group-hover:bg-white/50'
                          }`}
                      />
                      <span
                        className={`text-[9px] sm:text-[10px] uppercase tracking-wide transition-colors hidden sm:block ${isInWindow ? 'text-brand-saffron' : 'text-white/30'
                          }`}
                      >
                        {member.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom wave ── */}
        <div
          className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none"
          style={{ height: 80 }}
        >
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#270b08" />
                <stop offset="50%" stopColor="#321009" />
                <stop offset="100%" stopColor="#3a150b" />
              </linearGradient>
            </defs>
            <path d="M0,0 L0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,0 Z" fill="url(#waveGradient3)" />
            <path d="M0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>
    </>
  );
};

export default AboutUs;