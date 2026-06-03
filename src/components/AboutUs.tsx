import React from 'react';
import SectionReveal, { fadeLeft, fadeRight, scaleIn, staggerContainer, fadeUp } from './SectionReveal';
import {Person1, Person2, Person3} from '../assets/index';
import { AnimatePresence, motion } from "framer-motion";

const stats = [
  { label: 'Strategies Live', value: '40+' },
  { label: 'Markets Covered', value: '12' },
  { label: 'Uptime', value: '99.98%' },
  { label: 'Founded', value: '2026' },
];

const teamMembers = [
  {
    name: "Person 1",
    image: Person1,
    role: "Chief Quantitative Officer",
    headings: [
      { title: "Quantitative Research", text: "Develops alpha generating strategies using advanced statistical models." },
      { title: "Portfolio Construction",  text: "Designs systematic frameworks for capital allocation." },
      { title: "Risk Management",         text: "Builds adaptive risk controls across market regimes." },
    ],
  },
  {
    name: "Person 2",
    image: Person2,
    role: "Head of AI Research",
    headings: [
      { title: "Machine Learning", text: "Researching predictive models for market behavior." },
      { title: "Deep Learning",    text: "Building next generation forecasting engines." },
      { title: "Automation",       text: "Creating self-improving trading systems." },
    ],
  },
  {
    name: "Person 3",
    image: Person3,
    role: "Director of Trading Systems",
    headings: [
      { title: "Execution",       text: "Ultra-low latency execution architecture." },
      { title: "Infrastructure",  text: "Distributed systems built for scale." },
      { title: "Monitoring",      text: "24/7 operational intelligence." },
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
      {/* ── Top wave transition: previous section (dark) → this section (dark) ── */}
      <div className="relative w-full overflow-hidden leading-none" style={{ height: 80, marginBottom: -2, background: 'transparent' }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          {/* White fills coming up from below — carves the wave into the dark bg above */}
          <path
            d="M0,80 L0,50 C240,80 480,20 720,55 C960,90 1200,25 1440,50 L1440,80 Z"
            fill="white"
          />
        </svg>
      </div>

      <section
        id="aboutus"
        className="relative px-4 sm:px-6 bg-white border-t-0"
        style={{ paddingTop: '4rem', paddingBottom: 0 }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* ── Visual side ── */}
            <SectionReveal variants={scaleIn} className="w-full max-w-[360px] sm:max-w-[460px] lg:max-w-none lg:w-1/2 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
                style={{ willChange: 'transform', margin: '-16px' }}
                className="absolute inset-0 rounded-full border border-brand-saffron/15"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 44, ease: 'linear' }}
                style={{ willChange: 'transform', margin: '-32px' }}
                className="absolute inset-0 rounded-full border border-dashed border-brand-saffron/8"
              />
              <div className="aspect-square bg-linear-to-tr from-[#1a0505] via-brand-saffron/10 to-brand-saffron/25 rounded-full flex items-center justify-center p-6 sm:p-8 overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-cover mix-blend-overlay opacity-25"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')" }}
                />
                <div className="text-center relative z-10 select-none">
                  <h3 className="text-[clamp(2.75rem,10vw,4.5rem)] font-bold text-white tracking-tight mb-1">Alpha</h3>
                  <h3 className="text-[clamp(2rem,7vw,3rem)] font-light text-brand-saffron tracking-widest">Matrix</h3>
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
                className="text-[clamp(2rem,5vw,3rem)] font-light text-gray-900 leading-tight mb-6 sm:mb-8"
              >
                Pioneering the intersection of{' '}
                <span className="font-bold text-gray-900">human ingenuity</span> and{' '}
                <span className="text-brand-saffron font-bold">machine precision.</span>
              </motion.h3>

              <motion.p variants={fadeUp} className="text-gray-500 text-base sm:text-lg font-light leading-relaxed mb-5 sm:mb-6">
                Alpha Matrix was founded with a singular focus: to engineer absolute returns
                regardless of market climate. We employ a multidisciplinary approach,
                combining deep financial expertise with bleeding-edge AI and robust infrastructure.
              </motion.p>

              <motion.p variants={fadeUp} className="text-gray-500 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-10">
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

          {/* ── Stats row ── */}
          <motion.div
            className="mt-14 sm:mt-20 lg:mt-24 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-px border border-gray-100 rounded-xl overflow-hidden shadow-sm"
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="bg-gray-50 px-5 sm:px-8 py-7 sm:py-10 text-center hover:bg-orange-50 transition-colors duration-300"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{s.value}</div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-gray-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Leadership team ── */}
          <motion.div
            className="mt-28 pb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-12">
              <h2 className="text-brand-saffron text-xs tracking-[0.3em] uppercase font-bold mb-4">
                Leadership Team
              </h2>
              <h3 className="text-4xl font-light text-gray-900">
                The People Behind
                <span className="block font-bold">Alpha Matrix</span>
              </h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {teamMembers.map((member, index) => {
                const isActive = activeIndex === index;
                return (
                  <motion.div
                    key={member.name}
                    layout
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    animate={{ flex: isActive ? 4 : 1 }}
                    className="relative overflow-hidden rounded-[28px] h-[520px] lg:h-[560px] cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="h-full flex flex-col lg:flex-row bg-transparent overflow-hidden">

                      {/* Image */}
                      <motion.div layout className="relative h-[260px] lg:h-auto lg:w-[320px] shrink-0 overflow-hidden">
                        <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 backdrop-blur-xl bg-black/20">
                          <h4 className="text-white text-xl font-bold">{member.name}</h4>
                          <p className="text-white/80 text-sm">{member.role}</p>
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
                            className="flex-1 bg-white p-8 lg:p-10 overflow-y-auto border-t border-gray-100 lg:border-t-0 lg:border-l"
                          >
                            <div className="space-y-8">
                              {member.headings.map((item) => (
                                <div key={item.title}>
                                  <h5 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h5>
                                  <p className="text-slate-500 leading-relaxed">{item.text}</p>
                                </div>
                              ))}
                            </div>
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

        {/* ── Bottom wave transition: white → next dark section ── */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none" style={{ height: 80 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,0 L0,30 C240,0 480,60 720,25 C960,-10 1200,55 1440,30 L1440,0 Z"
              fill="#f97316"
            />
            {/* Dark fill below the wave — matches next section bg */}
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