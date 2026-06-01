import React from 'react';
import { motion } from 'framer-motion';
import SectionReveal, { fadeUp, fadeLeft, staggerContainer } from './SectionReveal';

const WhatWeDo: React.FC = () => {
  return (
    <section id="whatwedo" className="py-32 px-6 relative">
      <div className="max-w-4xl mx-auto">

        {/* ── Block 1: What We Do ── */}
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Label */}
          <motion.div variants={fadeLeft} className="flex items-center space-x-4 mb-12">
            <h2 className="text-sm tracking-[0.3em] text-brand-saffron uppercase font-bold">
              What We Do
            </h2>
            <div className="h-px w-24 bg-brand-saffron/50" />
          </motion.div>

          {/* Headline */}
          <motion.h3
            variants={fadeUp}
            className="text-4xl md:text-5xl font-light text-white leading-tight mb-12"
          >
            Built by coders, traders, and market obsessives — a next-gen trading firm
            focused on turning{' '}
            <span className="font-bold text-brand-saffron">data, speed, and technology</span>{' '}
            into an edge.
          </motion.h3>

          {/* Body paragraphs — each staggered */}
          {[
            'We create fully automated trading systems powered by quantitative research, machine learning, deep learning and real-time market intelligence — designed to move fast, adapt faster, and perform fastest, across changing market conditions.',
            'From equities and derivatives to global liquid markets, we\'re building systems that can trade anything electronic, anywhere, at any timescale.',
          ].map((text, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              className="text-xl text-gray-400 font-light leading-relaxed mb-6"
            >
              {text}
            </motion.p>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <SectionReveal className="my-24">
          <div className="h-px w-full bg-linear-to-r from-transparent via-brand-saffron/30 to-transparent" />
        </SectionReveal>

        {/* ── Block 2: What We Aim ── */}
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeLeft} className="flex items-center space-x-4 mb-12">
            <h2 className="text-sm tracking-[0.3em] text-brand-saffron uppercase font-bold">
              What We Aim
            </h2>
            <div className="h-px w-24 bg-brand-saffron/50" />
          </motion.div>

          <motion.h3
            variants={fadeUp}
            className="text-3xl md:text-4xl font-light text-white leading-tight mb-8"
          >
            But for us, trading isn't just about profits.
          </motion.h3>

          <motion.p
            variants={fadeUp}
            className="text-2xl text-gray-400 font-light leading-relaxed border-l-2 border-brand-saffron pl-6"
          >
            It's about pushing boundaries, solving impossible problems, and building the
            future of intelligent markets and coparticipants.
          </motion.p>
        </motion.div>

      </div>
    </section>
  );
};

export default WhatWeDo;
