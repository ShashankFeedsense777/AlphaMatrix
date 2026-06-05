import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import { Menu, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../assets/index'

interface NavbarProps {
  isAutoScrollEnabled?: boolean;
  setIsAutoScrollEnabled?: (val: boolean) => void;
  scrollSpeed?: number;
  setScrollSpeed?: (val: number) => void;
}

const navItems = [
  { name: 'Home', to: 'hero' },
  { name: 'What We Do', to: 'whatwedo' },
  { name: 'Vision', to: 'vision' },
  { name: 'Locations', to: 'locations' },
  { name: 'About Us', to: 'aboutus' },
  { name: 'Connect With Us', to: 'contact' },
] as const;

const Navbar: React.FC<NavbarProps> = ({
  isAutoScrollEnabled = false,
  setIsAutoScrollEnabled = () => { },
  scrollSpeed = 15,
  setScrollSpeed = () => { },
}) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<String>(navItems[0].to);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number | null = null;

    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        const activationPoint = scrollPosition + 110;

        setScrolled(scrollPosition > 50);

        const currentSection = navItems.reduce((current: any, item) => {
          const section = document.getElementById(item.to);
          if (!section) return current;

          const sectionTop = section.getBoundingClientRect().top + scrollPosition;
          return sectionTop <= activationPoint ? item.to : current;
        }, navItems[0].to);

        setActiveSection(currentSection);
        frameId = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const handleNavClick = (sectionId: string) => {
    setIsAutoScrollEnabled(false);
    setActiveSection(sectionId);
    setShowMobileMenu(false);
  };

  const openEmployeeLogin = () => {
    setIsAutoScrollEnabled(false);
    navigate('/login');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || showMobileMenu ? 'bg-brand-black/92 backdrop-blur-md shadow-lg py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-3">
        {/* Logo Placeholder */}
        <div className="flex min-w-fit items-center space-x-2 cursor-pointer">
          {/* <div className="w-10 h-10 border-2 border-brand-saffron flex items-center justify-center text-brand-saffron font-bold text-xl relative">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-saffron rounded-full"></span>
            A
          </div> */}
          <img id="navbar-logo" src={Logo} alt="" className="h-14 w-14 sm:h-16 sm:w-16 lg:h-[50px] lg:w-[50px] shrink-0" />
          <div className="flex min-w-0 flex-col">
            <span className="text-white font-bold text-base sm:text-lg lg:text-xl tracking-[0.12em] sm:tracking-[0.18em] lg:tracking-[0.2em] uppercase leading-none truncate">Alpha Matrix</span>
            {/* <span className="text-brand-saffron text-[10px] sm:text-sm tracking-widest mt-1">Since 2026</span> */}
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center space-x-5 xl:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              smooth={true}
              spy={false}
              duration={50}
              delay={0}
              offset={-80}
              onClick={() => handleNavClick(item.to)}
              className={`transition-colors cursor-pointer text-sm xl:text-sm tracking-wide uppercase whitespace-nowrap ${activeSection === item.to
                ? 'text-brand-saffron font-bold'
                : 'text-gray-300 hover:text-brand-saffron font-medium'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Controls and Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
          {/* Auto Scroll Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${showSettings || isAutoScrollEnabled ? 'text-brand-saffron bg-brand-saffron/10' : 'text-gray-400 hover:text-white bg-white/5'}`}
              aria-label="Auto scroll settings"
            >
              <Settings size={20} className={isAutoScrollEnabled ? 'animate-[spin_4s_linear_infinite]' : ''} />
            </button>

            {showSettings && (
              <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-64 bg-[#1a0505]/95 backdrop-blur-xl border border-brand-saffron/20 rounded-xl p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold">Auto Scroll</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isAutoScrollEnabled ? 'bg-brand-saffron' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAutoScrollEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs font-mono font-bold w-6 text-right" style={{ color: isAutoScrollEnabled ? '#f97316' : '#9ca3af' }}>
                      {isAutoScrollEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-4"></div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold">Speed</span>
                    <span className="text-xs text-brand-saffron font-mono bg-brand-saffron/10 px-2 py-0.5 rounded">
                      {scrollSpeed === 10 ? 'Fast' : scrollSpeed === 15 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    step="5"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-saffron"
                    style={{ direction: 'rtl' }}
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Low</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Fast</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openEmployeeLogin}
            className="hidden xl:block text-white hover:text-brand-saffron transition-colors text-sm tracking-wide font-medium whitespace-nowrap"
          >
            EMPLOYEE LOGIN
          </button>
          {/* <button className="hidden sm:block bg-brand-saffron text-white px-4 lg:px-6 py-2 rounded-sm text-xs lg:text-sm font-bold tracking-wider uppercase hover:bg-orange-600 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.5)] whitespace-nowrap">
            Get Started
          </button> */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((value) => !value)}
            className="lg:hidden p-2 rounded-full text-gray-300 bg-white/5 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="lg:hidden border-t border-white/10 bg-brand-black/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                smooth={true}
                spy={false}
                duration={120}
                delay={0}
                offset={-76}
                onClick={() => handleNavClick(item.to)}
                className={`px-3 py-3 rounded-md text-sm uppercase tracking-wide cursor-pointer ${activeSection === item.to
                    ? 'bg-brand-saffron/10 text-brand-saffron font-bold'
                    : 'text-gray-300 hover:bg-white/5'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <button
              type="button"
              onClick={openEmployeeLogin}
              className="px-3 py-3 rounded-md text-left text-sm uppercase tracking-wide cursor-pointer text-gray-300 hover:bg-white/5 "
            >
              Employee Login
            </button>
            <button className="sm:hidden mt-2 bg-brand-saffron text-white px-4 py-3 rounded-sm text-xs font-bold tracking-wider uppercase hover:bg-orange-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
