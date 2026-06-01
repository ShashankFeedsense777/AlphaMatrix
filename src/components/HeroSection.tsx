import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionReveal, { fadeIn, staggerContainer, fadeUp } from './SectionReveal';

const heroVideos = [
  'https://res.cloudinary.com/donk8eyno/video/upload/v1780050731/Frame1_qigxfh.mp4',
  'https://res.cloudinary.com/donk8eyno/video/upload/v1780050734/Frame2_pbeird.mp4',
  'https://res.cloudinary.com/donk8eyno/video/upload/v1780050733/Frame4_hj4tuc.mp4',
  'https://res.cloudinary.com/donk8eyno/video/upload/v1780050731/Frame3_iz8gke.mp4',
];

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadedVideosRef = useRef<HTMLVideoElement[]>([]);
  const [currentVideo, setCurrentVideo] = useState(0);

  const orderedVideos = useMemo(
    () =>
      [...heroVideos].sort((firstUrl, secondUrl) => {
        const firstFrame = Number(firstUrl.match(/Frame(\d+)/)?.[1] ?? 0);
        const secondFrame = Number(secondUrl.match(/Frame(\d+)/)?.[1] ?? 0);
        return firstFrame - secondFrame;
      }),
    []
  );

  useEffect(() => {
    preloadedVideosRef.current = orderedVideos.map((url) => {
      const video = document.createElement('video');
      video.src = url;
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.load();
      return video;
    });

    return () => {
      preloadedVideosRef.current = [];
    };
  }, [orderedVideos]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = 0.75;
    videoRef.current.play().catch(() => {
      // Browser autoplay policies can reject briefly until the muted video is ready.
    });
  }, [currentVideo]);

  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background video sequence */}
      <AnimatePresence mode="wait">
        <motion.video
          key={orderedVideos[currentVideo]}
          ref={videoRef}
          src={orderedVideos[currentVideo]}
          muted
          autoPlay
          playsInline
          preload="auto"
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = 0.5;
          }}
          onEnded={() => {
            setCurrentVideo((prev) => (prev + 1) % orderedVideos.length);
          }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.62, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0, ease: [0.22, 1, 0.36, 1] as const }}
          style={{ willChange: 'opacity, transform' }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      {/* <div className="absolute inset-0 z-1 bg-gradient-to-br from-[#1a0505]/72 via-[#1a0505]/45 to-brand-saffron/16" /> */}
      <div className="absolute inset-0 z-1 bg-linear-to-br from-[#1a0505]/40 via-[#1a0505]/20 to-brand-saffron/8" />

      {/* Staggered hero text */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20"
        variants={staggerContainer(0.18)}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={fadeUp}
          className="inline-block text-2xs tracking-[0.35em] text-brand-saffron uppercase mb-6 font-semibold"
        >
          AI · Quant · Trading
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-5xl font-extrabold text-white leading-tight"
        >
          We are building the{' '}
          <span className="text-brand-saffron block mt-2">best-in-class</span>
        </motion.h1>
        

        <motion.p
          variants={fadeUp}
          className="mt-8 text-7xl md:text-6xl text-gray-300 font-light"
        >
          quintessential AI ready humanoid{' '}
          <strong className="text-white font-semibold">Quant Firm</strong>
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <button className="bg-brand-saffron hover:bg-orange-600 text-white px-8 py-3 rounded text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.55)] hover:shadow-[0_0_35px_rgba(249,115,22,0.8)] hover:-translate-y-0.5">
            Explore Systems
          </button>
          <button className="border border-white/30 hover:border-brand-saffron text-white px-8 py-3 rounded text-sm font-bold tracking-widest uppercase transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5">
            Our Performance
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-px h-14 bg-linear-to-b from-white/0 via-brand-saffron to-white/0"
        />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
