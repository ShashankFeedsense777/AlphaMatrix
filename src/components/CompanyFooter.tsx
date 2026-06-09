import React from 'react';
import SectionReveal, { fadeUp, staggerContainer } from './SectionReveal';
import { Logo } from '../assets/index';
import { motion } from 'framer-motion';

const companyDetails = [
  { label: 'CIN Number', value: 'U67120MH2008PTC185004' },
  { label: 'GST Number', value: '27AAFCM6712K1Z9' },
  { label: 'NSE Membership', value: '90415' },
  { label: 'BSE Membership', value: '6879' },
  { label: 'SEBI Registration', value: 'INZ000318637' },

];

const CompanyFooter: React.FC = () => {
  return (
    <footer className="relative overflow-hidden px-4 sm:px-6 py-14 sm:py-16 lg:py-20 border-t border-white/10">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = 0.75;
        }}
      >
        <source
          src="https://res.cloudinary.com/drverjcjf/video/upload/v1780914015/Footer_rrbhuu.mp4"
          type="video/mp4"
        />
      </video>

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      {/* Premium Saffron Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top center, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.05) 30%, transparent 70%)",
        }}
      />

      {/* Soft Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Vignette — fades grid toward edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, #060608 100%)' }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr] lg:items-start">
          <SectionReveal variants={fadeUp}>
            <div className="flex items-center gap-3 mb-6">
              <img src={Logo} alt="Alpha Matrix" className="h-12 w-12 sm:h-14 sm:w-14" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Alpha Matrix
                </h2>
                {/* <p className="text-xs uppercase tracking-[0.28em] text-brand-saffron mt-1">
                  Registered Details
                </p> */}
              </div>
            </div>

            <div className="space-y-5 text-sm sm:text-base text-white/60 leading-relaxed">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/35 mb-2">Address</p>
                <p>Mumbai, Maharashtra</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/35 mb-2">
                  Registered Office Address
                </p>
                <p>
                  Flat No. 17, 1st Floor, Mahavir Majesty, M.G Road, Near BMC
                  Swimming Pool, Kandivali West, Mumbai, Mumbai Suburban,
                  Maharashtra 400067
                </p>
              </div>
            </div>
          </SectionReveal>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {companyDetails.map((detail) => (
              <motion.div
                key={detail.label}
                variants={fadeUp}
                className="
                    rounded-2xl
                    border border-white/10
                    bg-white/5
                    backdrop-blur-xl
                    px-4 py-3
                    transition-all
                    duration-500
                    hover:border-brand-saffron/40
                    hover:bg-white/[0.07]
                    hover:-translate-y-1
                    "
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-brand-saffron mb-3">
                  {detail.label}
                </p>
                <p className="font-mono text-sm sm:text-base text-white wrap-break-word">
                  {detail.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        

        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-xs sm:text-sm text-white/30">
            &copy; 2026 Alpha Matrix. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-white/25">
            NSE: 90415&nbsp;&nbsp;•&nbsp;&nbsp;BSE: 6879
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CompanyFooter;