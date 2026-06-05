import React, { lazy, Suspense } from 'react';
import SectionReveal, { fadeLeft, scaleIn, staggerContainer, fadeUp } from './SectionReveal';
import { Person1, Person2, Person3 } from '../assets/index';
import { AnimatePresence, motion } from 'framer-motion';

const stats = [
  { label: 'Strategies Live', value: '40+' },
  { label: 'Markets Covered', value: '12' },
  { label: 'Uptime', value: '99.98%' },
  { label: 'Founded', value: '2026' },
];

const teamMembers = [
  {
    name: 'Rohit Aniel Malik',
    image: Person2,
    role: 'Founder, CEO & Chief Quantitative Strategist',
    quote:
      '"Our mission is to democratize institutional-grade quantitative investing through technology, research, and disciplined execution."',
    headings: [
      {
        title: 'Quantitative Trading',
        text: 'Over 20 years of experience developing systematic trading frameworks across derivatives, algorithmic trading, and quantitative investing.',
      },
      {
        title: 'AI-Powered Market Intelligence',
        text: 'Leverages artificial intelligence and machine learning to enhance market analysis, automate decision-making, and improve strategy development.',
      },
      {
        title: 'Risk & Capital Preservation',
        text: 'Builds data-driven strategies focused on consistency, disciplined execution, robust risk controls, and long-term wealth creation.',
      },
    ],
  },

  {
    name: 'Khushboo Malik',
    image: Person1,
    role: 'Director',
    quote:
      '"Innovation, integrity, and disciplined decision-making create the foundation for sustainable success in financial markets."',
    headings: [
      {
        title: 'Client Empowerment',
        text: 'Focused on providing traders and investors with the tools, knowledge, and confidence required for informed financial decisions.',
      },
      {
        title: 'Technology & Innovation',
        text: 'Advocates the adoption of AI, automation, and data-driven research to improve analysis, execution, and scalable investment solutions.',
      },
      {
        title: 'Strategic Leadership',
        text: 'Drives the firm’s vision of combining proven market principles with quantitative research and disciplined risk management.',
      },
    ],
  },

  {
    name: 'Aniel Malik',
    image: Person3,
    role: 'Director',
    quote:
      '"Trust, discipline, and long-term thinking remain the cornerstones of every successful investment journey."',
    headings: [
      {
        title: '40+ Years of Market Experience',
        text: 'Has navigated multiple market cycles, technological shifts, and periods of volatility while maintaining a long-term investment perspective.',
      },
      {
        title: 'Mentorship & Guidance',
        text: 'Provides strategic direction grounded in market wisdom, prudent risk management, and sustainable wealth-building principles.',
      },
      {
        title: 'Trust & Excellence',
        text: 'Dedicated to fostering lasting client relationships built on transparency, integrity, consistency, and long-term value creation.',
      },
    ],
  },
];

const AboutUs: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % teamMembers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              <div className="aspect-square bg-gradient-to-tr from-[#1a0505] via-brand-saffron/10 to-brand-saffron/25 rounded-full flex items-center justify-center p-6 sm:p-8 overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-cover mix-blend-overlay opacity-25"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')" }}
                />
                <div className="text-center relative z-10 select-none">
                  <h3 className="text-[clamp(2rem,8vw,4.5rem)] font-bold text-white tracking-tight mb-1">Alpha</h3>
                  <h3 className="text-[clamp(1.5rem,6vw,3rem)] font-light text-brand-saffron tracking-widest">Matrix</h3>
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

              <motion.p
                variants={fadeUp}
                className="text-gray-400 text-sm sm:text-base lg:text-lg font-light leading-relaxed mb-4 sm:mb-5"
              >
                Alpha Matrix was founded with a singular focus: to engineer absolute returns
                regardless of market climate. We employ a multidisciplinary approach,
                combining deep financial expertise with bleeding-edge AI and robust infrastructure.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-gray-400 text-sm sm:text-base lg:text-lg font-light leading-relaxed mb-7 sm:mb-9"
              >
                Our team consists of brilliant minds from diverse fields — mathematics,
                computer science, and physics — all driven by the pursuit of alpha.
              </motion.p>

              {/* <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                className="border border-brand-saffron text-brand-saffron hover:bg-brand-saffron hover:text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors duration-300"
              >
                Join the Matrix
              </motion.button> */}
            </motion.div>
          </div>

          {/* ── Stats row ── */}
          {/* <motion.div
            className="mt-14 sm:mt-20 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/5 rounded-xl overflow-hidden"
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="bg-white/3 px-4 sm:px-8 py-6 sm:py-10 text-center hover:bg-white/6 transition-colors duration-300"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1 sm:mb-2">
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.2em] text-gray-500">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div> */}

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
                <span className="block font-bold text-white">Alpha Matrix</span>
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
                    className="relative overflow-hidden rounded-2xl sm:rounded-[28px] h-[420px] sm:h-[480px] lg:h-[540px] cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="h-full flex flex-col lg:flex-row overflow-hidden">

                      {/* Image */}
                      <motion.div
                        layout
                        className="relative h-[200px] sm:h-[240px] lg:h-auto lg:w-[280px] xl:w-[320px] shrink-0 overflow-hidden"
                      >
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`absolute inset-0 w-full h-full object-cover ${isActive ? 'saturate-100' : 'saturate-0'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 backdrop-blur-md bg-black/25">
                          <h4 className="text-white text-base sm:text-lg lg:text-xl font-bold leading-tight">
                            {member.name}
                          </h4>
                          <p className="text-white/75 text-xs sm:text-sm mt-0.5">{member.role}</p>
                        </div>
                      </motion.div>

                      {/* Expanded content */}
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            key="content"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.45 }}
                            className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto"
                            style={{ background: '#f5f4f2', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
                          >
                            {/* Role pill */}
                            <span className="inline-block bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-4">
                              {member.role}
                            </span>

                            {/* Name */}
                            <h4 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-saffron mb-4 leading-tight">
                              {member.name}
                            </h4>

                            {/* Headings as body paragraphs */}
                            <div className="space-y-4 mb-6">
                              {member.headings.map((item, idx) => (
                                <p key={item.title} className="text-gray-800 text-sm sm:text-base leading-relaxed">
                                  {idx === 0 ? (
                                    // First heading treated as intro paragraph
                                    <>{item.text}</>
                                  ) : (
                                    <>
                                      <span className="font-semibold text-gray-900">{item.title}. </span>
                                      {item.text}
                                    </>
                                  )}
                                </p>
                              ))}
                            </div>

                            {/* Blockquote */}
                            <blockquote className="border-l-4 border-brand-saffron pl-4 mt-6">
                              <p className="text-brand-saffron italic text-sm sm:text-base font-medium leading-relaxed">
                                "{member.headings[member.headings.length - 1].title} — {member.headings[member.headings.length - 1].text}"
                              </p>
                            </blockquote>
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
                <stop offset="0%" stopColor="#270b08" />
                <stop offset="50%" stopColor="#321009" />
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