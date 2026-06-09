import React from 'react';
import { motion, Variants } from 'framer-motion';
import SectionReveal, { fadeUp, staggerContainer } from './SectionReveal';

interface Location {
  city: string;
  role: string;
  desc: string;
  coords: string;
  img: string;
}

const locations: Location[] = [
  {
    city: 'Mumbai',
    role: 'Headquarters',
    desc: 'The maximum city — where conviction meets velocity.',
    coords: '19.0760° N, 72.8777° E',
    img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1400&auto=format&fit=crop',
  },
  {
    city: 'Dubai',
    role: 'Partner Desk',
    desc: 'Bridging east and west capital flows.',
    coords: '25.2048° N, 55.2708° E',
    img: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=1400&auto=format&fit=crop',
  },
  {
    city: 'Singapore',
    role: 'Partner Desk',
    desc: 'Asia-Pacific liquidity & infrastructure.',
    coords: '1.3521° N, 103.8198° E',
    img: 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1400&auto=format&fit=crop',
  },
];

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Locations: React.FC = () => {
  return (
    <section
      id="locations"
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden bg-white"
    >

      {/* Heading */}
      <SectionReveal variants={fadeUp} className="max-w-6xl mx-auto mb-14 sm:mb-20 text-center">
        <p className="text-[11px] sm:text-xs tracking-[0.28em] text-brand-saffron uppercase font-semibold mb-4">
          Where We Operate
        </p>
        <h2 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-light text-gray-900 leading-tight">
          Rooted in <span className="font-bold text-gray-900">Mumbai</span>,{' '}
          connected across{' '}
          <span className="text-brand-saffron">global markets</span>.
        </h2>
      </SectionReveal>

      {/* Cards */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5"
        variants={staggerContainer(0.14)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {locations.map((loc, index) => (
          <motion.div
            key={loc.city}
            variants={cardReveal}
            className="group relative min-w-0 overflow-hidden cursor-pointer"
            style={{ borderRadius: '20px' }}
          >
            <div
              className="relative min-h-[360px] h-[70svh] max-h-[460px] sm:h-[520px] sm:max-h-none xl:h-[580px] overflow-hidden"
              style={{ borderRadius: '20px' }}
            >
              {/* BG image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-100 group-hover:scale-105 grayscale-30 group-hover:grayscale-0"
                style={{ backgroundImage: `url(${loc.img})` }}
              />

              {/* Overlays — these stay dark as they're inside the card */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Saffron tint */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249,115,22,0.18) 0%, transparent 70%)' }}
              />

              {/* Top row */}
              <div className="absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 flex justify-between items-center gap-3">
                <span
                  className="text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.22em] font-bold uppercase px-2.5 sm:px-3 py-1.5 truncate"
                  style={{
                    color: index === 0 ? '#f97316' : 'rgba(255,255,255,0.75)',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: index === 0 ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '100px',
                  }}
                >
                  {loc.role}
                </span>
                <span className="text-white/50 text-xs font-mono tabular-nums">0{index + 1}</span>
              </div>

              {/* Bottom content — always white text since it's over a dark image overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">

                <div className="flex items-center gap-2 mb-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-75">
                  <span className="w-5 h-px bg-brand-saffron/70 inline-block shrink-0" />
                  <span className="min-w-0 text-[9px] sm:text-[10px] font-mono text-white/55 tracking-widest truncate">
                    {loc.coords}
                  </span>
                </div>

                <h3 className="text-[clamp(2.25rem,9vw,3.75rem)] font-light text-white mb-2 tracking-tight leading-none">
                  {loc.city}
                </h3>

                <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed max-w-xs translate-y-0 opacity-100 md:translate-y-3 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {loc.desc}
                </p>

                <div
                  className="mt-5 h-px w-0 group-hover:w-full transition-all duration-700 ease-out delay-150"
                  style={{ background: 'linear-gradient(90deg, rgba(249,115,22,0.7), transparent)' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer note */}
      <SectionReveal variants={fadeUp} className="max-w-7xl mx-auto mt-8 sm:mt-10 px-1">
        <div className="flex items-start sm:items-center gap-3">
          <span className="mt-1.5 sm:mt-0 w-1.5 h-1.5 rounded-full bg-brand-saffron/60 inline-block shrink-0" />
          <p className="text-xs text-gray-400 font-light tracking-wide leading-relaxed">
            Additional partner networks across London, Hong Kong, and New York.
          </p>
        </div>
      </SectionReveal>

      {/* Bottom wave */}
      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none"
        style={{ height: 80 }}
      >
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#270907" />
              <stop offset="50%"  stopColor="#350f09" />
              <stop offset="100%" stopColor="#330e0a" />
            </linearGradient>
          </defs>
          <path
            d="M0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,80 L0,80 Z"
            fill="url(#waveGradient2)"
          />
        </svg>
      </div>
    </section>
  );
};

export default Locations;