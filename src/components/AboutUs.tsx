import React from 'react';
import { motion } from 'framer-motion';
import SectionReveal, { fadeLeft, fadeRight, scaleIn, staggerContainer, fadeUp } from './SectionReveal';

const stats = [
  { label: 'Strategies Live', value: '40+' },
  { label: 'Markets Covered', value: '12' },
  { label: 'Uptime', value: '99.98%' },
  { label: 'Founded', value: '2026' },
];

const AboutUs: React.FC = () => {
  return (
    <section
      id="aboutus"
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Visual side ── */}
          <SectionReveal variants={scaleIn} className="w-full max-w-[360px] sm:max-w-[460px] lg:max-w-none lg:w-1/2 relative">
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
              style={{ willChange: 'transform', margin: '-16px' }}
              className="absolute inset-0 rounded-full border border-brand-saffron/15"
            />
            {/* Slower counter-rotating ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 44, ease: 'linear' }}
              style={{ willChange: 'transform', margin: '-32px' }}
              className="absolute inset-0 rounded-full border border-dashed border-brand-saffron/8"
            />

            <div className="aspect-square bg-linear-to-tr from-[#1a0505] via-brand-saffron/10 to-brand-saffron/25 rounded-full flex items-center justify-center p-6 sm:p-8 overflow-hidden relative">
              <div
                className="absolute inset-0 bg-cover mix-blend-overlay opacity-25"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')",
                }}
              />
              <div className="text-center relative z-10 select-none">
                <h3 className="text-[clamp(2.75rem,10vw,4.5rem)] font-bold text-white tracking-tight mb-1">
                  Alpha
                </h3>
                <h3 className="text-[clamp(2rem,7vw,3rem)] font-light text-brand-saffron tracking-widest">
                  Matrix
                </h3>
              </div>
            </div>
          </SectionReveal>

          {/* ── Text side ── */}
          <motion.div
            className="w-full lg:w-1/2"
            variants={staggerContainer(0.13)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeLeft} className="flex items-center space-x-4 mb-6 sm:mb-8">
              <h2 className="text-[11px] sm:text-xs tracking-[0.24em] sm:tracking-[0.3em] text-brand-saffron uppercase font-bold">
                About Us
              </h2>
              <div className="h-px w-12 bg-brand-saffron/50" />
            </motion.div>

            <motion.h3
              variants={fadeUp}
              className="text-[clamp(2rem,5vw,3rem)] font-light text-white leading-tight mb-6 sm:mb-8"
            >
              Pioneering the intersection of{' '}
              <span className="font-bold">human ingenuity</span> and{' '}
              <span className="text-brand-saffron font-bold">machine precision.</span>
            </motion.h3>

            <motion.p
              variants={fadeUp}
              className="text-gray-400 text-base sm:text-lg font-light leading-relaxed mb-5 sm:mb-6"
            >
              Alpha Matrix was founded with a singular focus: to engineer absolute returns
              regardless of market climate. We employ a multidisciplinary approach,
              combining deep financial expertise with bleeding-edge AI and robust infrastructure.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-gray-400 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-10"
            >
              Our team consists of brilliant minds from diverse fields — mathematics,
              computer science, and physics — all driven by the pursuit of alpha.
            </motion.p>

            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              className="border border-brand-saffron text-brand-saffron hover:bg-brand-saffron hover:text-white px-6 sm:px-8 py-3 rounded text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors duration-300"
            >
              Join the Matrix
            </motion.button>
          </motion.div>
        </div>

        {/* ── Stats row — staggered ── */}
        <motion.div
          className="mt-14 sm:mt-20 lg:mt-24 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-px border border-white/5 rounded-xl overflow-hidden"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="bg-white/2.5 px-5 sm:px-8 py-7 sm:py-10 text-center hover:bg-white/5 transition-colors duration-300"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{s.value}</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-gray-500">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
