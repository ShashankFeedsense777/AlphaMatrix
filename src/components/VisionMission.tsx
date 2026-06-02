import React from 'react';
import { motion } from 'framer-motion';
import SectionReveal, { fadeUp, fadeLeft, fadeRight, scaleIn, staggerContainer } from './SectionReveal';

const cards = [
  {
    label: 'Our Vision',
    text: (
      <>
        To create scalable quant infrastructure that can create wealth{' '}
        <span className="font-semibold text-brand-saffron">ethically</span>{' '}
        for every partner.
      </>
    ),
  },
  {
    label: 'Our Mission',
    text: (
      <>
        To build intelligent solutions that make financial markets{' '}
        <span className="font-semibold text-brand-saffron">
          simpler, smarter, and more accessible.
        </span>
      </>
    ),
  },
];

const VisionMission: React.FC = () => {
  return (
    <section id="vision" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden" >

      {/* ── Cards ── staggered side-by-side reveal */}
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-10"
        variants={staggerContainer(0.18)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={i % 2 === 0 ? fadeLeft : fadeRight}
            whileHover={{ scale: 1.018, transition: { duration: 0.3 } }}
            className="relative min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl cursor-default group p-6 sm:p-8 lg:p-10"
            style={{
              background: i === 0
                ? 'radial-gradient(ellipse 80% 80% at 110% -10%, rgba(249,115,22,0.18) 0%, rgba(255,255,255,0.03) 50%, rgba(99,102,241,0.08) 100%)'
                : 'radial-gradient(ellipse 80% 80% at -10% 110%, rgba(249,115,22,0.18) 0%, rgba(255,255,255,0.03) 50%, rgba(99,102,241,0.08) 100%)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'border-color 0.5s, box-shadow 0.5s',
            }}
          >
            <h2 className="text-[11px] sm:text-xs tracking-[0.28em] text-brand-saffron uppercase font-bold mb-4 sm:mb-6">
              {card.label}
            </h2>
            <p className="text-lg sm:text-xl xl:text-2xl text-white font-light leading-relaxed">
              {card.text}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Closing statement ── */}
      <SectionReveal
        variants={scaleIn}
        className="max-w-4xl mx-auto mt-14 sm:mt-20 lg:mt-28 text-center"
        margin="-40px"
      >
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light leading-snug">
          Simply put, turning market complexity into{' '}
          <span className="inline text-white font-bold border-b-2 border-brand-saffron pb-1">
            intelligent opportunities
          </span>{' '}
          — that's what drives us.
        </p>
      </SectionReveal>
    </section>
  );
};

export default VisionMission;
