import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';
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
import VWAP from './dashboard/vwap/VWAP';
import MarginCalculator from './dashboard/marginCalculator/MarginCalculator';
import InfoLayout from './components/mainLayout/InfoLayout';
import InvestorCharter from './components/compliances/InvestorCharter';
import './index.css';
import InvestorGreviance from './components/compliances/InvestorGreviance';
import FileComplaint from './components/compliances/FileComplaint';

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
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeen = sessionStorage.getItem('alphaMatrixSplashSeen');
    const hasScrollTo = window.location.search.includes('scrollTo=');
    return !hasSeen && !hasScrollTo;
  });

  useEffect(() => {
    if (!showSplash && !sessionStorage.getItem('alphaMatrixSplashSeen')) {
      sessionStorage.setItem('alphaMatrixSplashSeen', 'true');
    }
  }, [showSplash]);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(15);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const pauseRef = useRef<number | null>(null);
  const nextSectionIndexRef = useRef(1);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scrollToId = searchParams.get('scrollTo');
    if (scrollToId) {
      setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

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
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/' || location.search.includes('scrollTo=')) {
      sessionStorage.setItem('alphaMatrixSplashSeen', 'true');
    }
  }, [location.pathname, location.search]);

  return (
    <>
      <SEO />
      <StructuredData />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <>
              <SEO
                title="Employee Login"
                description="Secure employee login portal for AlphaMatrix quantitative trading platform."
                canonical="https://alphamatrixsecurities.com/login"
                noIndex
              />
              <EmployeeLoginPage />
            </>
          }
        />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<Navigate to="live-greeks" replace />} />
            <Route
              path="live-greeks"
              element={
                <>
                  <SEO
                    title="Live Greeks"
                    description="Real-time options Greeks dashboard — Delta, Gamma, Theta, Vega, Rho with live market data."
                    canonical="https://alphamatrixsecurities.com/dashboard/live-greeks"
                    noIndex
                  />
                  <LiveGreeks />
                </>
              }
            />
            <Route
              path="historical-greeks"
              element={
                <>
                  <SEO
                    title="Historical Greeks"
                    description="Historical options Greeks analysis and backtesting data for quantitative trading strategies."
                    canonical="https://alphamatrixsecurities.com/dashboard/historical-greeks"
                    noIndex
                  />
                  <HistoricalGreeks />
                </>
              }
            />
            <Route
              path="vwap"
              element={
                <>
                  <SEO
                    title="VWAP Calculator"
                    description="Volume-Weighted Average Price (VWAP) calculator and charting tool for algorithmic trading."
                    canonical="https://alphamatrixsecurities.com/dashboard/vwap"
                    noIndex
                  />
                  <VWAP />
                </>
              }
            />
            <Route
              path="margin-calculator"
              element={
                <>
                  <SEO
                    title="Margin Calculator"
                    description="Trading margin calculator for derivatives and equities — calculate required margin and leverage."
                    canonical="https://alphamatrixsecurities.com/dashboard/margin-calculator"
                    noIndex
                  />
                  <MarginCalculator />
                </>
              }
            />
          </Route>
        </Route>
        
        <Route element={<InfoLayout />}>
          <Route
            path="/investor-charter"
            element={
              <>
                <SEO
                  title="Investor Charter"
                  description="Investor Charter for Stock Brokers"
                  canonical="https://alphamatrixsecurities.com/investor-charter"
                />
                <InvestorCharter />
              </>
            }
          />
        </Route>

    <Route element={<InfoLayout />}>
          <Route
            path="/investor-grievance"
            element={
              <>
                <SEO
                  title="Investor Grievance"
                  description="Investor Grievance for Stock Brokers"
                  canonical="https://alphamatrixsecurities.com/investor-grievance"
                />
                <InvestorGreviance />
              </>
            }
          />
        </Route>


    <Route element={<InfoLayout />}>
          <Route
            path="/how-to-file-a-complaint"
            element={
              <>
                <SEO
                  title="How to File a Complaint"
                  description="How to File a Complaint for Stock Brokers"
                  canonical="https://alphamatrixsecurities.com/how-to-file-a-complaint"
                />
                <FileComplaint />
              </>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
