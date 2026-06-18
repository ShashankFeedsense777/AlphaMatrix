import React, { useEffect, useRef } from 'react';
import SectionReveal, { fadeLeft, scaleIn, staggerContainer, fadeUp } from './SectionReveal';
import { Person1, Person2, Person3 } from '../assets/index';
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
];

const ABOUT_VIDEOS = [
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780914017/Circle_Frame1_ddntd8.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780914015/Footer_rrbhuu.mp4',
];

const AboutUs: React.FC = () => {
const [activeIndex, setActiveIndex] = React.useState(0);
const [isPaused, setIsPaused] = React.useState(false);
const cachedAboutRef = useRef<string[]>([]);
const videoRef = useRef<HTMLVideoElement>(null);

React.useEffect(() => {
  if (isPaused) return;
  const interval = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % teamMembers.length);
  }, 5000);
  return () => clearInterval(interval);
}, [isPaused]);

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

  return (
    <>
      <section
        id="aboutus"
        className="relative px-4 sm:px-6 border-t-0"
        style={{
          paddingTop: '4rem',
          paddingBottom: 0,
          // background: 'linear-gradient(160deg, #060608 0%, #130804 40%, #1f0b05 70%, #270b08 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">

          {/* ── Hero row ── */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Visual side */}
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
                  <h3 className="text-[clamp(2rem,8vw,4.5rem)] font-bold text-white tracking-tight mb-1">Alpha</h3>
                  <h3 className="text-[clamp(1.5rem,6vw,3rem)] font-bold text-brand-saffron tracking-widest">Matrix</h3>
                </div>
              </div>
            </SectionReveal>

            {/* Text side */}
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
  className="mt-20 sm:mt-28 pb-24"
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

  {/* Cards */}
  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
    {teamMembers.map((member, index) => {
      const isActive = activeIndex === index;
      return (
        <motion.div
          key={member.name}
          layout
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          animate={{ flex: isActive ? 4 : 1 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-[28px] h-[420px] sm:h-[500px] lg:h-[560px] cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          onClick={() => {
            setActiveIndex(index);
            setIsPaused(true);       // click → lock open
          }}
          onMouseEnter={() => {
            setActiveIndex(index);
            setIsPaused(true);       // hover in → lock open
          }}
          onMouseLeave={() => {
            setIsPaused(false);      // hover out → resume auto-loop
          }}
        >
          <div className="h-full flex flex-col lg:flex-row overflow-hidden">

            {/* Image panel */}
            <motion.div
              layout
              className="relative h-[200px] sm:h-[240px] lg:h-auto lg:w-[260px] xl:w-[300px] shrink-0 overflow-hidden"
            >
              <img
                src={member.image}
                alt={member.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isActive ? 'saturate-100 scale-100' : 'saturate-0 scale-105'}`}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h4 className="text-white text-base sm:text-lg font-bold leading-tight drop-shadow-lg">
                  {member.name}
                </h4>
              </div>

              {/* Inactive indicator */}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white" opacity="0.7">
                      <path d="M4 2.5l5 3.5-5 3.5V2.5z" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Expanded content panel */}
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 overflow-y-auto"
                  style={{
                    background: 'linear-gradient(160deg, #faf9f7 0%, #f3f1ee 100%)',
                    borderLeft: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="p-5 sm:p-7 lg:p-8">

                    {/* Role pill */}
                    <div className="mb-3">
                      <span
                        className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm"
                        style={{ background: '#111', color: '#fff', letterSpacing: '0.18em' }}
                      >
                        {member.role}
                      </span>
                    </div>

                    {/* Name */}
                    <h4
                      className="font-black leading-tight mb-2 text-brand-saffron"
                      style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: 'Georgia, serif' }}
                    >
                      {member.name}
                    </h4>

                    {/* Divider */}
                    <div className="w-10 h-0.5 bg-brand-saffron/40 mb-5" />

                    {/* Content items */}
                    <div className="space-y-3 sm:space-y-4 mb-5">
                      {member.headings.map((item, idx) => (
                        <div key={item.title}>
                          {idx === 0 ? (
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                              {item.text}
                            </p>
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

                    {/* Blockquote */}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    })}
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
                <stop offset="0%"   stopColor="#270b08" />
                <stop offset="50%"  stopColor="#321009" />
                <stop offset="100%" stopColor="#3a150b" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 L0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,0 Z"
              fill="url(#waveGradient3)"
            />
            <path
              d="M0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,80 L0,80 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>
    </>
  );
};

export default AboutUs;