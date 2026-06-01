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
    <section id="vision" className="py-32 px-6 relative">

      {/* ── Cards ── staggered side-by-side reveal */}
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
        variants={staggerContainer(0.18)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={i % 2 === 0 ? fadeLeft : fadeRight}
            whileHover={{ scale: 1.015, transition: { duration: 0.25 } }}
            className="bg-white/3 p-10 border border-white/5 backdrop-blur-sm rounded-2xl relative overflow-hidden group hover:border-brand-saffron/30 transition-colors duration-500 cursor-default"
          >
            {/* Glow orb */}
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-brand-saffron/5 rounded-full blur-3xl group-hover:bg-brand-saffron/12 transition-all duration-700" />

            <h2 className="text-xs tracking-[0.3em] text-brand-saffron uppercase font-bold mb-6">
              {card.label}
            </h2>
            <p className="text-2xl text-white font-light leading-relaxed">{card.text}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Closing statement ── */}
      <SectionReveal
        variants={scaleIn}
        className="max-w-4xl mx-auto mt-28 text-center"
        margin="-40px"
      >
        <p className="text-3xl text-gray-300 font-light leading-snug">
          Simply put, turning market complexity into{' '}
          <span className="text-white font-bold border-b-2 border-brand-saffron pb-1">
            intelligent opportunities
          </span>{' '}
          — that's what drives us.
        </p>
      </SectionReveal>
    </section>
  );
};

export default VisionMission;
