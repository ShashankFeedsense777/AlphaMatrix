import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SplashScreen from './components/SplashScreen';
import EmployeeLoginPage from './components/EmployeeLoginPage';
import DashboardPage from './components/DashboardPage';
import WhatWeDo from './components/WhatWeDo';
import VisionMission from './components/VisionMission';
import Locations from './components/Locations';
import AboutUs from './components/AboutUs';
import ConnectWithUs from './components/ConnectWithUs';
import RealTimeMarket from './components/RealTimeMarket';
import CompanyFooter from './components/CompanyFooter';
import PrivateRoute from './routes/PrivateRoute';
import LiveGreeks from './dashboard/sotm/GreeksLive';
import HistoricalGreeks from './dashboard/sotm/GreeksHistorical';
import MarginCalculator from './dashboard/marginCalculator/MarginCalculator';
import './index.css';

gsap.registerPlugin(ScrollToPlugin);

/**
 * Page-level reveal wrapper — each direct section child fades in and
 * rises 40 px as it enters the viewport.  `once: true` keeps the
 * animation from replaying on scroll-back, giving a clean, professional feel.
 */
const pageSection: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageSection}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    style={{ willChange: 'opacity, transform' }}
  >
    {children}
  </motion.div>
);

const NAVBAR_OFFSET = 80;

function LandingPage() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('alphaMatrixSplashSeen'));
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(15);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const pauseRef = useRef<number | null>(null);
  const nextSectionIndexRef = useRef(1);

  useEffect(() => {
    let isActive = isAutoScrollEnabled;

    const clearAutoScroll = () => {
      if (pauseRef.current !== null) {
        window.clearTimeout(pauseRef.current);
        pauseRef.current = null;
      }

      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };

    const getSectionTop = (section: Element) =>
      section.getBoundingClientRect().top + window.scrollY;

    const getStartingSectionIndex = (sections: Element[]) => {
      const activationPoint = window.scrollY + NAVBAR_OFFSET + 10;
      const currentIndex = sections.reduce((activeIndex, section, index) => {
        return getSectionTop(section) <= activationPoint ? index : activeIndex;
      }, 0);

      return Math.min(currentIndex + 1, sections.length);
    };

    const scrollNextSection = () => {
      if (!isActive) return;

      const sections = Array.from(document.querySelectorAll('section'));
      if (!sections.length) return;

      const nextSection = sections[nextSectionIndexRef.current];

      if (nextSection) {
        nextSectionIndexRef.current += 1;

        tweenRef.current = gsap.to(window, {
          scrollTo: {
            y: nextSection,
            offsetY: NAVBAR_OFFSET,
            autoKill: false,
          },
          duration: scrollSpeed,
          ease: 'power2.inOut',
          onComplete: () => {
            tweenRef.current = null;

            if (!isActive) return;

            pauseRef.current = window.setTimeout(() => {
              pauseRef.current = null;
              scrollNextSection();
            }, 0);
          },
          onInterrupt: () => {
            tweenRef.current = null;
          },
        });
      } else {
        setIsAutoScrollEnabled(false);
      }
    };

    if (isAutoScrollEnabled) {
      document.documentElement.classList.add('gsap-auto-scroll-active');
      clearAutoScroll();
      nextSectionIndexRef.current = getStartingSectionIndex(Array.from(document.querySelectorAll('section')));
      scrollNextSection();
    } else {
      isActive = false;
      clearAutoScroll();
      document.documentElement.classList.remove('gsap-auto-scroll-active');
    }

    return () => {
      isActive = false;
      clearAutoScroll();
      document.documentElement.classList.remove('gsap-auto-scroll-active');
    };
  }, [isAutoScrollEnabled, scrollSpeed]);

  // Listen to user scroll events (like mouse wheel) to disable auto scroll if they intervene manually.
  useEffect(() => {
    const handleUserScroll = (e: Event) => {
      // If auto-scroll is on and user uses mouse wheel or touch move, GSAP's autoKill will kill the tween.
      // We just need to sync our React state.
      if (isAutoScrollEnabled && e.isTrusted) {
        setIsAutoScrollEnabled(false);
      }
    };

    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [isAutoScrollEnabled]);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-brand-saffron selection:text-white">
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            sessionStorage.setItem('alphaMatrixSplashSeen', 'true');
            setShowSplash(false);
          }}
        />
      )}

      {/* Navbar is always visible — no scroll trigger */}
      <Navbar
        isAutoScrollEnabled={isAutoScrollEnabled}
        setIsAutoScrollEnabled={setIsAutoScrollEnabled}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
      />

      {/* Hero loads immediately (no Section wrapper) */}
      <HeroSection />

      {/* Every subsequent section gets a smooth page-level reveal */}
      <Section>
        <WhatWeDo />
      </Section>

      <Section>
        <VisionMission />
      </Section>

      <Section>
        <Locations />
      </Section>

      <Section>
        <AboutUs />
      </Section>

      <Section>
        <ConnectWithUs />
      </Section>

      <Section>
        <CompanyFooter />
      </Section>

      {/* <Section>
        <RealTimeMarket />
      </Section> */}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<EmployeeLoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<Navigate to="live-greeks" replace />} />
          <Route path="live-greeks" element={<LiveGreeks />} />
          <Route path="historical-greeks" element={<HistoricalGreeks />} />
          <Route path="margin-calculator" element={<MarginCalculator />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
