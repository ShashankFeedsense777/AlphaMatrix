import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionReveal, { fadeUp } from './SectionReveal';

type CardId = 'trader' | 'research' | 'technology';

interface CardConfig {
  id: CardId;
  label: string;
  tagline: string;
  jingle: string;
  gradient: string;
  options: { value: string; label: string }[];
}

const CARDS: CardConfig[] = [
  {
    id: 'trader',
    label: 'Trader',
    tagline: 'Markets move on conviction.',
    jingle: 'Every tick tells a story. We need traders who read between the lines — disciplined, sharp, and ready to execute at the speed of thought.',
    gradient: 'from-amber-600/80 to-orange-900/80',
    options: [
      { value: 'fresher', label: 'A fresher wants to be a professional trader' },
      { value: 'experienced', label: 'Experienced trader' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    tagline: 'Alpha hides in the noise.',
    jingle: 'We decode markets through data, machine learning, and first-principles thinking. Join us to uncover edges others miss.',
    gradient: 'from-blue-600/80 to-indigo-900/80',
    options: [
      { value: 'analyst', label: 'A research analyst with proven track record' },
      { value: 'graduate', label: 'Just out of college wants to become a researcher' },
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    tagline: 'Infrastructure is edge.',
    jingle: 'Latency is language. We build systems that trade at the nanosecond — resilient, elegant, and endlessly optimized.',
    gradient: 'from-emerald-600/80 to-teal-900/80',
    options: [
      { value: 'join', label: 'Looking to join the team' },
      { value: 'bug', label: 'Report a bug' },
    ],
  },
];

const VIDEO_SRC = 'https://res.cloudinary.com/donk8eyno/video/upload/v1780050731/Frame1_qigxfh.mp4';

const ConnectWithUs: React.FC = () => {
  const [active, setActive] = useState<CardId | null>(null);
  const [hovered, setHovered] = useState<CardId | null>(null);
  const [formData, setFormData] = useState({ whoAmI: '', fullName: '', email: '', phone: '', doc: null as File | null });
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    CARDS.forEach((c) => {
      const video = videoRefs.current[c.id];
      if (video) {
        if (active === c.id) {
          video.playbackRate = 0.75;
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [active]);

  const resetForm = () => {
    setFormData({ whoAmI: '', fullName: '', email: '', phone: '', doc: null });
  };

  const handleCardClick = (id: CardId) => {
    if (active === id) {
      setActive(null);
      resetForm();
    } else {
      setActive(id);
      setFormData({ whoAmI: '', fullName: '', email: '', phone: '', doc: null });
    }
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionReveal variants={fadeUp} className="mb-12 sm:mb-16">
          <h2 className="text-brand-saffron text-xs tracking-[0.3em] uppercase font-bold mb-4">
            Connect With Us
          </h2>
          <h3 className="text-4xl sm:text-5xl font-light text-gray-900 leading-tight">
            Shape the future of{' '}
            <span className="font-bold">finance.</span>
          </h3>
        </SectionReveal>

        {/* ── Cards row ── */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch">
          {CARDS.map((card) => {
            const isActive = active === card.id;
            const isHovered = hovered === card.id && active === null;
            const isAnyExpanded = active !== null;

            return (
              <motion.div
                key={card.id}
                layout
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                animate={{
                  flex: isActive ? 3.5 : isHovered ? 2.5 : isAnyExpanded ? 0.6 : 1,
                }}
                onClick={() => handleCardClick(card.id)}
                onMouseEnter={() => { if (active === null) setHovered(card.id); }}
                onMouseLeave={() => { if (hovered === card.id) setHovered(null); }}
                className="relative overflow-hidden rounded-[28px] cursor-pointer min-h-[360px] lg:min-h-[520px]"
              >
                {/* Video / Poster */}
                <div className="absolute inset-0">
                  <video
                    ref={(el) => { videoRefs.current[card.id] = el; }}
                    src={VIDEO_SRC}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-linear-to-r ${card.gradient} mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Label */}
                <div className="absolute top-5 left-5 right-5 z-10 flex items-start justify-between">
                  <div>
                    <h4 className="text-white text-2xl font-bold tracking-tight">{card.label}</h4>
                    <p className="text-white/60 text-sm mt-1">{card.tagline}</p>
                  </div>
                  {/* <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-white border-white' : 'border-white/40'
                  }`}>
                    <span className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-white'}`}>
                      {isActive ? '−' : '+'}
                    </span>
                  </div> */}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="absolute inset-0 z-20 flex"
                    >
                      {/* Left — jingle */}
                      <div className="hidden lg:flex flex-col justify-end w-[38%] p-6">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white' : 'bg-white/20'
                          }`}>
                            <span className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-white'}`}>
                              {isActive ? '−' : '+'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white text-lg font-bold tracking-tight">{card.label}</h4>
                            <p className="text-white/50 text-xs mt-0.5">{card.tagline}</p>
                          </div>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed italic border-l-2 border-brand-saffron pl-4 mt-4">
                          "{card.jingle}"
                        </p>
                      </div>

                      {/* Right — form */}
                      <div className={`ml-auto w-full lg:w-[62%] h-full p-6 backdrop-blur-sm ${
                        isActive ? 'bg-black/20' : 'bg-black/10'
                      }`} onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-white font-semibold text-sm mb-4 tracking-wide">
                          {isActive ? 'Get in touch' : 'Click to connect'}
                        </h5>
                        <div className={`space-y-3 ${isActive ? '' : 'pointer-events-none opacity-60'}`}>
                          <select
                            value={formData.whoAmI}
                            onChange={(e) => setFormData({ ...formData, whoAmI: e.target.value })}
                            className="w-full h-10 px-3 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron/30 backdrop-blur-sm"
                          >
                            <option value="" className="text-gray-900">Who am I?</option>
                            {card.options.map((opt) => (
                              <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full h-10 px-3 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron/30 backdrop-blur-sm"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="email"
                              placeholder="Email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full h-10 px-3 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron/30 backdrop-blur-sm"
                            />
                            <input
                              type="tel"
                              placeholder="Phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full h-10 px-3 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron/30 backdrop-blur-sm"
                            />
                          </div>
                          <label className="flex items-center gap-3 h-10 px-3 text-sm border border-dashed border-white/20 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-sm">
                            <span className="text-white/60 truncate text-xs">
                              {formData.doc ? formData.doc.name : 'Attach resume / docs'}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => setFormData({ ...formData, doc: e.target.files?.[0] ?? null })}
                            />
                          </label>
                          <button className={`w-full h-10 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-colors ${
                            isActive
                              ? 'bg-brand-saffron hover:bg-orange-600 cursor-pointer'
                              : 'bg-brand-saffron/60 cursor-default'
                          }`}>
                            {isActive ? 'Submit' : 'Click to fill'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConnectWithUs;
