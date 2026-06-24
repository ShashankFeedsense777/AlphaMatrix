import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionReveal, { fadeIn, staggerContainer, fadeUp } from './SectionReveal';
import { getCachedVideoUrl } from '../utils/videoCache';

const heroVideos = [
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780913982/Frame1_za36iw.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780913981/Frame2_yqwhp2.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780913979/Frame3_vaahnp.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780913980/Frame4_qrqjqt.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780913983/Frame5_iweisg.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1781008757/Frame6_lfixvv.mp4',
  'https://res.cloudinary.com/drverjcjf/video/upload/v1780919603/Frame7_bkz6dk.mp4',
];

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadedVideosRef = useRef<HTMLVideoElement[]>([]);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [cachedUrls, setCachedUrls] = useState<string[]>([]);

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
    Promise.all(orderedVideos.map(getCachedVideoUrl)).then(setCachedUrls);
  }, [orderedVideos]);

  useEffect(() => {
    if (cachedUrls.length === 0) return;
    preloadedVideosRef.current = cachedUrls.map((blobUrl) => {
      const video = document.createElement('video');
      video.src = blobUrl;
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.load();
      return video;
    });

    return () => {
      preloadedVideosRef.current = [];
    };
  }, [cachedUrls]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = 0.75;
    videoRef.current.play().catch(() => {
      // Browser autoplay policies can reject briefly until the muted video is ready.
    });
  }, [currentVideo, cachedUrls]);

  const currentSrc = cachedUrls[currentVideo] || orderedVideos[currentVideo];

  return (
    <section id="hero" className="relative min-h-svh w-full flex items-center justify-center overflow-hidden px-4 py-28 sm:px-6 lg:py-32">
      {/* Background video sequence */}
      <AnimatePresence mode="wait">
        <motion.video
          key={currentSrc}
          ref={videoRef}
          src={currentSrc}
          muted
          autoPlay
          playsInline
          preload="auto"
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = 0.75;
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
      <div className="absolute inset-0 z-1 bg-linear-to-br from-[#1a0505]/40 via-[#1a0505]/20 to-brand-saffron/8" />

      {/* Staggered hero text */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center mt-8 sm:mt-14 lg:mt-20"
        variants={staggerContainer(0.18)}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={fadeUp}
          className="inline-block text-[10px] sm:text-xs tracking-[0.24em] sm:tracking-[0.35em] text-brand-saffron uppercase mb-4 sm:mb-6 font-semibold"
        >
          AI · Investing · Quant · Trading
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="mt-5 sm:mt-8 text-[clamp(1.5rem,6vw,4rem)] text-gray-300 font-light leading-tight"
        >
          <span className="text-white font-semibold">AlphaMatrix</span>
          <br/>
          We are building the{' '}
          <br/>
          <span className="text-white font-semibold">best-in-class</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-[clamp(2.25rem,8vw,4.5rem)] font-extrabold text-white leading-[1.05]"
        >
          Quintessential{' '}
          <span className="text-brand-saffron">AlphaMatrix</span>{' '}AI ready
          <br/>
          <strong className="text-brand-saffron block mt-2">Humanoid Quant Firm</strong>
        </motion.p>

       
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 sm:gap-3"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-px h-10 sm:h-14 bg-linear-to-b from-white/0 via-brand-saffron to-white/0"
        />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
