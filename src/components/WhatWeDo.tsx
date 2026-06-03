import React from 'react';
import { motion } from 'framer-motion';
import SectionReveal, { fadeUp, fadeLeft, staggerContainer } from './SectionReveal';

const WhatWeDo: React.FC = () => {
  return (
    <section id="whatwedo" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative" >
      <div className="max-w-6xl mx-auto" >

        {/* ── Block 1: What We Do ── */}
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Section Label */}
          <motion.div
            variants={fadeLeft}
            className="flex items-center space-x-4 mb-8 sm:mb-12"
          >
            <h2 className="text-xs sm:text-sm tracking-[0.24em] sm:tracking-[0.3em] text-brand-saffron uppercase font-bold">
              What We Do
            </h2>

            <div className="h-px w-12 sm:w-24 bg-brand-saffron/50" />
          </motion.div>

          {/* Main Heading */}
          <motion.h3
            variants={fadeUp}
            className="text-[clamp(2rem,5vw,3.5rem)] font-light text-white leading-tight mb-12 max-w-5xl"
          >
            Built by coders, traders, and market obsessives —
            <span className="font-semibold text-brand-saffron">
              {" "}engineering market intelligence at scale.
            </span>
          </motion.h3>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                title: "Technology Driven",
                text: "We are a next-generation trading firm focused on transforming data, speed, and technology into a sustainable market edge.",
                number: "01",
              },
              {
                title: "AI & Quant Research",
                text: "Our fully automated trading systems combine quantitative research, machine learning, deep learning, and real-time intelligence to adapt continuously to changing markets.",
                number: "02",
              },
              {
                title: "Global Market Infrastructure",
                text: "From equities and derivatives to liquid global markets, we build systems capable of trading any electronic instrument across any timeframe.",
                number: "03",
              },
            ].map((item) => (
              <motion.div
                key={item.number}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-black/30
          backdrop-blur-xl
          p-7
          lg:p-8
          group
        "
              >
                {/* Glow */}
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
                      "radial-gradient(circle at top left, rgba(249,115,22,0.12), transparent 60%)",
                  }}
                />

                {/* Number */}
                <div className="relative z-10 mb-8">
                  <span
                    className="
              text-4xl
              font-black
              text-transparent
              bg-clip-text
              bg-gradient-to-b
              from-brand-saffron
              to-white/20
            "
                  >
                    {item.number}
                  </span>
                </div>

                {/* Accent Line */}
                <div className="relative z-10 h-[2px] w-12 bg-brand-saffron mb-6" />

                {/* Title */}
                <h4 className="relative z-10 text-xl font-semibold text-white mb-4">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="relative z-10 text-gray-400 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <SectionReveal className="my-14 sm:my-20 lg:my-24">
          <div className="h-px w-full bg-linear-to-r from-transparent via-brand-saffron/30 to-transparent" />
        </SectionReveal>

        {/* ── Block 2: What We Aim ── */}
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeLeft} className="flex items-center space-x-4 mb-8 sm:mb-12">
            <h2 className="text-xs sm:text-sm tracking-[0.24em] sm:tracking-[0.3em] text-brand-saffron uppercase font-bold">
              What We Aim
            </h2>
            <div className="h-px w-12 sm:w-24 bg-brand-saffron/50" />
          </motion.div>

          <motion.h3
            variants={fadeUp}
            className="text-[clamp(1.75rem,4vw,2.25rem)] font-light text-white leading-tight mb-6 sm:mb-8"
          >
            For us, trading isn't just about profits.
          </motion.h3>

          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl lg:text-2xl text-gray-400 font-light leading-relaxed border-l-2 border-brand-saffron pl-4 sm:pl-6"
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
