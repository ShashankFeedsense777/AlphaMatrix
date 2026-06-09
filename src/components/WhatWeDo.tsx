import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import SectionReveal, {
  fadeUp,
  fadeLeft,
  staggerContainer,
} from './SectionReveal';

const DottedSurface = lazy(() => import('./ui/DottedSurface'));


const WhatWeDo: React.FC = () => {
  const cards = [
    {
      title: 'Technology Driven',
      text: 'We are a next-generation trading firm focused on transforming data, speed, and technology into a sustainable market edge.',
      number: '01',
    },
    {
      title: 'AI & Quant Research',
      text: 'Our fully automated trading systems combine quantitative research, machine learning, deep learning, and real-time intelligence to adapt continuously to changing markets.',
      number: '02',
    },
    {
      title: 'Global Market Infrastructure',
      text: 'From equities and derivatives to liquid global markets, we build systems capable of trading any electronic instrument across any timeframe.',
      number: '03',
    },
  ];

  return (
    <section
      id="whatwedo"
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-[#f7fafd] text-[#181c1e]"
    >
      <Suspense fallback={null}>
        <DottedSurface />
      </Suspense>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* ───────────────────────────── */}
        {/* WHAT WE DO */}
        {/* ───────────────────────────── */}

        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div
            variants={fadeLeft}
            className="flex items-center gap-4 mb-8 sm:mb-12"
          >
            <h2 className="text-xs sm:text-sm tracking-[0.3em] uppercase font-bold text-brand-saffron">
              What We Do
            </h2>

            <div className="h-px w-12 sm:w-24 bg-brand-saffron/40" />
          </motion.div>

          <motion.h3
            variants={fadeUp}
            className="text-[clamp(2rem,5vw,3.5rem)] font-light leading-tight mb-10 sm:mb-12 max-w-5xl text-[#181c1e]"
          >
            Built by coders, traders, and market obsessives —
            <span className="font-semibold text-brand-saffron">
              {' '}
              engineering market intelligence at scale.
            </span>
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((item) => (
              <motion.div
                key={item.number}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#dfe8f0]
                  bg-[#fbfdff]
                  p-6
                  sm:p-7
                  lg:p-8
                  shadow-[0_4px_20px_rgba(15,23,42,0.04)]
                  hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]
                  group
                  transition-all
                  duration-300
                "
              >
                {/* Hover Glow */}
                <div
                  className="
                    absolute
                    inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                  "
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(0,63,135,0.08), rgba(0,86,179,0.03) 55%, transparent)',
                  }}
                />

                <div className="relative z-10 mb-8">
                  <span
                    className="
                      text-4xl
                      font-black
                      text-transparent
                      bg-clip-text
                      bg-linear-to-b
                      from-[#003f87]
                      to-[#0056b3]/25
                    "
                  >
                    {item.number}
                  </span>
                </div>

                <div className="relative z-10 h-[2px] w-12 bg-brand-saffron mb-6" />

                <h4 className="relative z-10 text-xl font-semibold text-[#181c1e] mb-4">
                  {item.title}
                </h4>

                <p className="relative z-10 text-[#4b5563] leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ───────────────────────────── */}
        {/* DIVIDER */}
        {/* ───────────────────────────── */}

        <SectionReveal className="my-14 sm:my-20 lg:my-24">
          <div
            // className="
            //   rounded-2xl
            //   border
            //   border-[#e3ebf3]
            //   bg-gradient-to-r
            //   from-[#f1f5f9]
            //   via-[#eef4f8]
            //   to-[#f1f5f9]
            // "
          />
        </SectionReveal>

        {/* ───────────────────────────── */}
        {/* WHAT WE AIM */}
        {/* ───────────────────────────── */}

        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div
            variants={fadeLeft}
            className="flex items-center gap-4 mb-8 sm:mb-12"
          >
            <h2 className="text-xs sm:text-sm tracking-[0.3em] uppercase font-bold text-brand-saffron">
              What We Aim
            </h2>

            <div className="h-px w-12 sm:w-24 bg-brand-saffron/40" />
          </motion.div>

          <motion.h3
            variants={fadeUp}
            className="text-[clamp(1.75rem,4vw,2.4rem)] font-light text-[#181c1e] leading-tight mb-8"
          >
            For us, trading isn't just about profits.
          </motion.h3>

          <motion.div
            variants={fadeUp}
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#dfe8f0]
              bg-[#fbfdff]
              px-6
              py-7
              sm:px-8
              sm:py-9
              shadow-[0_4px_20px_rgba(15,23,42,0.04)]
            "
          >
<p className="text-lg sm:text-xl lg:text-2xl text-[#111827] font-medium leading-relaxed">  
              It's about pushing boundaries, solving impossible problems,
              and building the future of intelligent markets and
              coparticipants.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* WAVE */}
      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none"
        style={{ height: 80 }}
      >
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="waveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#461a0d" />
              <stop offset="50%" stopColor="#43180c" />
              <stop offset="100%" stopColor="#2e0e08" />
            </linearGradient>
          </defs>

          <path
            d="M0,0 L0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,0 Z"
            fill="#f7fafd"
          />

          <path
            d="M0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,80 L0,80 Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>
    </section>
  );
};

export default WhatWeDo;