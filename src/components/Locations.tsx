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
    role: 'HEADQUARTERS',
    desc: 'The maximum city — where conviction meets velocity.',
    coords: '19.0760° N • 72.8777° E',
    img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    city: 'Dubai',
    role: 'PARTNER DESK',
    desc: 'Bridging east and west capital flows.',
    coords: '25.2048° N • 55.2708° E',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    city: 'Singapore',
    role: 'PARTNER DESK',
    desc: 'Asia-Pacific liquidity & infrastructure.',
    coords: '1.3521° N • 103.8198° E',
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop',
  },
];

/** Card-entry variant: composited-only opacity + y — no clip-path (avoids paint) */
const cardReveal: Variants = {
  hidden: { opacity: 0, y: 56 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Locations: React.FC = () => {
  return (
    <section id="locations" className="py-24">
      {/* Heading */}
      <SectionReveal variants={fadeUp} className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <p className="text-xs tracking-[0.3em] text-brand-saffron uppercase font-semibold mb-4">
          Where We Operate
        </p>
        <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">
          We operate from the maximum city,{' '}
          <span className="font-bold">Mumbai</span>.<br />
          We have partners in{' '}
          <span className="text-brand-saffron">Dubai</span>,{' '}
          <span className="text-brand-saffron">Singapore</span>, among other places.
        </h2>
      </SectionReveal>

      {/* Cards — staggered clip-reveal from bottom */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-1"
        variants={staggerContainer(0.16)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {locations.map((loc, index) => (
          <motion.div
            key={loc.city}
            variants={cardReveal}
            className="relative h-[60vh] group overflow-hidden cursor-pointer bg-[#0d0d0d]"
          >
            {/* BG image: grayscale → color on hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 opacity-60 group-hover:opacity-85"
              style={{ backgroundImage: `url(${loc.img})` }}
            />

            {/* Dark gradient for legibility */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-55 transition-opacity duration-700" />

            {/* Content */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between">
              {/* Top row */}
              <div className="flex justify-between items-start">
                <motion.span
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  className="text-brand-saffron text-xs tracking-[0.22em] font-bold uppercase"
                >
                  {loc.role}
                </motion.span>
                <span className="text-white/25 text-sm font-mono tracking-widest">
                  0{index + 1}
                </span>
              </div>

              {/* Bottom text — slides up on hover */}
              <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="text-5xl font-serif text-white mb-3 drop-shadow-lg">
                  {loc.city}
                </h3>
                <p className="text-gray-300 font-light text-lg mb-5 max-w-sm drop-shadow">
                  {loc.desc}
                </p>
                <div className="text-xs font-mono text-white/45 tracking-widest flex items-center space-x-2">
                  <span className="w-4 h-px bg-white/25 inline-block" />
                  <span>{loc.coords}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Locations;
