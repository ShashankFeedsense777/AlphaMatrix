import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Lock, Phone, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo, Nature1, Nature2, Nature3 } from '../assets/index';
import { loginAPI } from '../api/apiCalls';
import ShapeGrid from './ui/ShapeGrid';

type LoginMode = 'password' | 'phone';
type LoginResponse = { status: number; message?: string };
type ToastState = {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
} | null;

const loginWithUsernamePassword = async (_username: string, _password: string) => {
  const response = await loginAPI(_username, _password);
  return response as LoginResponse | undefined;
};

const requestLoginOtp = async (_mobile: string) => {
  return { status: 200, message: 'OTP sent successfully.' };
};

const validateMobileOtp = async (_mobile: string, _otp: string) => {
  return { status: 200, message: 'OTP validated successfully.' };
};

const slideVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

// Content for the 3 slides
const SLIDE_DATA = [
  {
    id: 1,
    image: Nature1,
    label: "Foundational Growth",
    title: "Cultivate your portfolio. Watch it grow.",
    desc: "Just as a tree builds strong roots, successful trading requires patience and a resilient foundation.",
    stats: [
      { value: 'Deep', label: 'Roots' },
      { value: 'Steady', label: 'Growth' },
      { value: 'High', label: 'Yields' },
    ]
  },
  {
    id: 2,
    image: Nature2,
    label: "Market Ecosystems",
    title: "Opportunities in bloom. Across all sectors.",
    desc: "Access a thriving landscape of liquidity across NSE, Derivatives, and Global FX markets.",
    stats: [
      { value: 'Live', label: 'Trading' },
      { value: 'Global', label: 'Reach' },
      { value: 'Diverse', label: 'Assets' },
    ]
  },
  {
    id: 3,
    image: Nature3,
    label: "Autonomous Intelligence",
    title: "Precision in every pulse. Built to adapt.",
    desc: "Our ML models nurture your capital with the same care a gardener tends to a new sprout.",
    stats: [
      { value: '50+', label: 'ML Models' },
      { value: '<12ms', label: 'Latency' },
      { value: '24/7', label: 'Nurturing' },
    ]
  },
];

const EmployeeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    mobile: '',
    otp: '',
  });

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setOtpSent(false);
  };

  const updateField = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const goToDashboard = () => {
    localStorage.setItem('loggedIn', 'true');
    window.setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 850);
  };

  const showToast = (nextToast: Omit<NonNullable<ToastState>, 'id'>) => {
    const id = Date.now();
    setToast({ ...nextToast, id });

    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'password') {
        const response = await loginWithUsernamePassword(formValues.username, formValues.password);
        if (response?.status === 200) {
          showToast({
            type: 'success',
            title: 'Login successful',
            message: 'Redirecting to employee dashboard.',
          });
          goToDashboard();
        } else {
          showToast({
            type: 'error',
            title: 'Login failed',
            message: response?.message || 'Invalid username or password.',
          });
        }
        return;
      }

      if (!otpSent) {
        const response = await requestLoginOtp(formValues.mobile);
        if (response?.status === 200) {
          setOtpSent(true);
          showToast({
            type: 'success',
            title: 'OTP sent',
            message: 'Enter the OTP sent to your registered mobile number.',
          });
        } else {
          showToast({
            type: 'error',
            title: 'OTP request failed',
            message: response?.message || 'Unable to send OTP right now.',
          });
        }
        return;
      }

      const response = await validateMobileOtp(formValues.mobile, formValues.otp);
      if (response?.status === 200) {
        showToast({
          type: 'success',
          title: 'OTP verified',
          message: 'Redirecting to employee dashboard.',
        });
        goToDashboard();
      } else {
        showToast({
          type: 'error',
          title: 'OTP verification failed',
          message: response?.message || 'Please check the OTP and try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-[#060608] text-white selection:bg-brand-saffron selection:text-white">
      <div className="absolute inset-0 z-100">
        <ShapeGrid
          speed={0.4}
          squareSize={55}
          direction="diagonal"
          borderColor="rgba(255,255,255,0.06)"
          hoverFillColor="#F97316"
          shape="square"
          hoverTrailAmount={3}
        />
      </div>
      <div className="fixed right-3 top-3 z-120 w-[calc(100vw-1.5rem)] max-w-sm sm:right-5 sm:top-5">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, y: -10, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${toast.type === 'success'
                  ? 'border-green-400/25 bg-green-500/12'
                  : 'border-red-400/25 bg-red-500/12'
                }`}
            >
              <div
                className={`mt-0.5 ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{toast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decor (Grid & Radials) */}
      {/* <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.055) 1px,transparent 1px)', backgroundSize: 'clamp(32px, 6vw, 44px) clamp(32px, 6vw, 44px)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(249,115,22,0.12) 0%,transparent 65%)' }} /> */}

      <div className="relative  flex min-h-svh flex-col px-3 py-3 min-[380px]:px-4 sm:px-6 lg:px-10">
        {/* Nav */}
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3  pb-3 sm:pb-4">
          <button type="button" onClick={() => { navigate('/'); }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/60 backdrop-blur-md transition-colors hover:border-brand-saffron/40 hover:text-white z-101">
            <ArrowLeft size={14} /> Home
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-saffron/20 bg-brand-saffron/10">
              <img src={Logo} alt="AlphaMatrix" className="h-5 w-5 object-contain" />
            </div>
            <span className="truncate text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.22em]">AlphaMatrix</span>
          </div>
        </header>

        {/* Split layout */}
        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-5 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid w-full max-w-[460px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl md:max-w-none md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.1fr_0.9fr]"
          >

            {/* ── Left panel (The Nature Slider) ── */}
            <div className="hidden md:flex min-h-[560px] flex-col justify-between p-7 lg:p-12 relative overflow-hidden z-101">

              {/* Background Image Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={SLIDE_DATA[currentSlide].image}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${SLIDE_DATA[currentSlide].image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </AnimatePresence>

              {/* Dark Overlay for Text Legibility */}
              <div className="absolute inset-0 bg-black/40 bg-linear-to-t from-black/90 via-black/20 to-[#060608]/40 z-1" />

              {/* Content Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex h-full min-w-0 flex-col justify-between"
                >
                  <div>
                    <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.24em] lg:tracking-[0.3em] text-brand-saffron drop-shadow-md">
                      {SLIDE_DATA[currentSlide].label}
                    </p>
                    <h2 className="text-[clamp(1.85rem,3vw,2.5rem)] font-extralight text-white leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
                      {SLIDE_DATA[currentSlide].title.split('. ')[0]}.<br />
                      <span className="font-extrabold">{SLIDE_DATA[currentSlide].title.split('. ')[1]}</span>
                    </h2>
                    <p className="text-sm text-white/80 font-light leading-relaxed max-w-[320px] drop-shadow-md">
                      {SLIDE_DATA[currentSlide].desc}
                    </p>
                  </div>

                  <div className="my-8 grid grid-cols-3 gap-2 lg:gap-3">
                    {SLIDE_DATA[currentSlide].stats.map((s) => (
                      <div key={s.label} className="min-w-0 rounded-xl p-3 flex flex-col gap-1 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="truncate text-lg lg:text-xl font-bold text-white tracking-tight">{s.value}</span>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    {SLIDE_DATA.map((_, idx) => (
                      <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-brand-saffron' : 'w-2 bg-white/20'}`} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Right panel (Login Form) ── */}
            <div className="flex min-w-0 flex-col bg-[#07070b]/95 p-5 min-[380px]:p-6 sm:p-8 lg:p-9 backdrop-blur-xl z-101">
              <div className="mb-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-brand-saffron/20 bg-brand-saffron/10 text-brand-saffron">
                <ShieldCheck size={22} />
              </div>
              <h1 className="text-[clamp(1.55rem,7vw,2rem)] font-light text-white mb-1">Employee Login</h1>
              <p className="text-xs text-white/35 font-light mb-6 sm:mb-7 leading-relaxed">Restricted to authorized AlphaMatrix personnel.</p>

              {/* Toggle */}
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/7 bg-black/40 p-1">
                {[{ id: 'password' as const, label: 'Password', icon: User }, { id: 'phone' as const, label: 'Phone', icon: Phone }].map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => switchMode(id)} className={`relative flex min-h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-2 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase transition-colors ${mode === id ? 'text-white' : 'text-white/45'}`}>
                    {mode === id && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-brand-saffron shadow-[0_0_20px_rgba(249,115,22,0.3)]" />}
                    <Icon size={13} className="relative z-10" /><span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                <motion.form key={mode} onSubmit={handleLoginSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
                  {mode === 'password' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">User ID</span>
                        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 focus-within:border-brand-saffron/50 transition-all">
                          <User size={14} className="shrink-0 text-white/30" />
                          {/* Added placeholder:text-white/30 below */}
                          <input type="text" autoComplete="username" placeholder="username" value={formValues.username} onChange={(event) => updateField('username', event.target.value)} className="login-input min-w-0 bg-transparent text-sm text-white outline-none w-full placeholder:text-white/35" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Password</span>
                        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 focus-within:border-brand-saffron/50 transition-all">
                          <Lock size={14} className="shrink-0 text-white/30" />
                          {/* Added placeholder:text-white/30 below */}
                          <input type="password" autoComplete="current-password" placeholder="password" value={formValues.password} onChange={(event) => updateField('password', event.target.value)} className="login-input min-w-0 bg-transparent text-sm text-white outline-none w-full placeholder:text-white/35" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Mobile</span>
                        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 focus-within:border-brand-saffron/50 transition-all">
                          <Phone size={14} className="shrink-0 text-white/30" />
                          {/* Added placeholder:text-white/30 below */}
                          <input type="tel" autoComplete="tel" placeholder="+91 00000 00000" value={formValues.mobile} onChange={(event) => updateField('mobile', event.target.value)} className="login-input min-w-0 bg-transparent text-sm text-white outline-none w-full placeholder:text-white/35" />
                        </div>
                      </div>
                      <AnimatePresence>
                        {otpSent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -8 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -8 }}
                            transition={{ duration: 0.28 }}
                            className="flex flex-col gap-1.5 overflow-hidden"
                          >
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">OTP</span>
                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 focus-within:border-brand-saffron/50 transition-all">
                              <KeyRound size={14} className="shrink-0 text-white/30" />
                              <input type="text" inputMode="numeric" maxLength={6} placeholder="6 digit code" value={formValues.otp} onChange={(event) => updateField('otp', event.target.value)} className="login-input min-w-0 bg-transparent text-sm text-white outline-none w-full placeholder:text-white/35" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                  <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-brand-saffron py-3.5 px-4 text-[11px] font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-lg shadow-brand-saffron/20 disabled:cursor-wait disabled:opacity-70">
                    {isSubmitting ? 'Please Wait...' : mode === 'password' || otpSent ? 'Access Platform →' : 'Send OTP →'}
                  </button>
                </motion.form>
              </AnimatePresence>

              <p className="mt-6 sm:mt-8 text-center text-[10px] leading-relaxed text-white/25">Authorized access only. All activity is logged.</p>
            </div>
          </motion.div>
        </section>
      </div>

    </main>
  );
};

export default EmployeeLoginPage;
