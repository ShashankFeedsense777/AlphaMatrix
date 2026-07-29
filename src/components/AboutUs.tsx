import React, { useEffect, useRef } from 'react';
import SectionReveal, { fadeLeft, scaleIn, staggerContainer, fadeUp } from './SectionReveal';
import { Person1, Person2, Person3, Person4, Person5, Paper } from '../assets/index';
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

const AboutUs: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const cachedAboutRef = useRef<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeMember = teamMembers[activeIndex];

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
                  <h3 className="text-[clamp(2rem,8vw,4.5rem)] font-bold text-white tracking-tight mb-1">AlphaMatrix</h3>
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
            <div className="mb-10 sm:mb-14">
              <h2 className="text-brand-saffron text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-3 sm:mb-4">
                Leadership Team
              </h2>
              <h3 className="text-3xl sm:text-4xl font-light text-white">
                The People Behind
                <span className="block font-bold text-white">AlphaMatrix</span>
              </h3>
            </div>

            {/* Featured profile + selector — scales cleanly for 5 members */}
            <div
              className="rounded-2xl sm:rounded-[28px] overflow-hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Featured member panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] sm:min-h-[480px]">
                {/* Portrait */}
                <div className="relative lg:col-span-5 h-[280px] sm:h-[340px] lg:h-auto overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeMember.name}
                      src={activeMember.image}
                      alt={activeMember.name}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-black/40" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                  {/* Mobile name overlay on photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:hidden">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-brand-saffron font-bold mb-1">
                      {activeMember.role}
                    </p>
                    <h4 className="text-white text-xl font-bold leading-tight">
                      {activeMember.name}
                    </h4>
                  </div>
                </div>

                {/* Bio content */}
                <div
                  className="lg:col-span-7 relative flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 overflow-hidden"
                  style={{
                    backgroundImage: `url(${Paper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMember.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10"
                    >
                      {/* Role pill — desktop */}
                      <div className="hidden lg:block mb-4">
                        <span
                          className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-sm"
                          style={{ background: '#111', color: '#fff', letterSpacing: '0.18em' }}
                        >
                          {activeMember.role}
                        </span>
                      </div>

                      {/* Name — desktop */}
                      <h4
                        className="hidden lg:block font-black leading-tight mb-3 text-brand-saffron"
                        style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.15rem)', fontFamily: 'Georgia, serif' }}
                      >
                        {activeMember.name}
                      </h4>

                      {/* Quote */}
                      <div className="flex gap-3 items-start mb-6 sm:mb-7">
                        <div className="w-0.5 min-h-full bg-brand-saffron rounded-full shrink-0 self-stretch" />
                        <p
                          className="text-brand-saffron text-sm sm:text-base leading-relaxed"
                          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                        >
                          &ldquo;{activeMember.quote}&rdquo;
                        </p>
                      </div>

                      <div className="w-10 h-0.5 bg-brand-saffron/40 mb-5 sm:mb-6" />

                      {/* Headings */}
                      <div className="space-y-4 sm:space-y-5">
                        {activeMember.headings.map((item, idx) => (
                          <div key={item.title} className="flex gap-3">
                            <span className="mt-0.5 text-brand-saffron text-[10px] font-bold tracking-wider shrink-0 w-4">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h5 className="text-gray-900 text-sm sm:text-[15px] font-semibold mb-1 leading-snug">
                                {item.title}
                              </h5>
                              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Member selector strip */}
              <div
                className="border-t border-white/8 px-3 sm:px-5 py-4 sm:py-5"
                style={{ background: 'rgba(0,0,0,0.25)' }}
              >
                <div className="flex items-stretch justify-between gap-1 sm:gap-2">
                  {teamMembers.map((member, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`group relative flex-1 flex flex-col items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl px-1 sm:px-2 py-2 sm:py-3 transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-white/8'
                            : 'hover:bg-white/4'
                        }`}
                        aria-label={`View ${member.name}`}
                        aria-pressed={isActive}
                      >
                        <div
                          className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all duration-300 ${
                            isActive
                              ? 'ring-2 ring-brand-saffron ring-offset-2 ring-offset-[#0a0605] scale-105'
                              : 'ring-1 ring-white/15 opacity-100 group-hover:opacity-100 group-hover:ring-white/30'
                          }`}
                        >
                          <img
                            src={member.image}
                            alt=""
                            className={`w-full h-full object-cover object-top transition-all duration-500 ${
                              isActive ? 'saturate-100' : 'saturate-100 group-hover:saturate-100'
                            }`}
                          />
                        </div>

                        <div className="text-center min-w-0 w-full">
                          <p
                            className={`text-[9px] sm:text-[11px] md:text-xs font-semibold leading-tight truncate transition-colors duration-300 ${
                              isActive ? 'text-white' : 'text-white group-hover:text-white'
                            }`}
                          >
                            {member.name.split(' ')[0]}
                          </p>
                          <p
                            className={`hidden sm:block text-[8px] md:text-[9px] tracking-wide uppercase mt-0.5 truncate transition-colors duration-300 ${
                              isActive ? 'text-brand-saffron/80' : 'text-gray-600'
                            }`}
                          >
                            {member.role.split(/[—,&]/)[0].trim()}
                          </p>
                        </div>

                        {/* Active progress bar (auto-rotate indicator) */}
                        {isActive && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full overflow-hidden bg-white/10">
                            <motion.span
                              key={`progress-${index}-${isPaused}`}
                              className="block h-full bg-brand-saffron origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: isPaused ? 0 : 1 }}
                              transition={
                                isPaused
                                  ? { duration: 0 }
                                  : { duration: 5, ease: 'linear' }
                              }
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
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