import React, { useEffect, useRef } from 'react';
import SectionReveal, { fadeUp, staggerContainer } from './SectionReveal';
import { Logo } from '../assets/index';
import { motion } from 'framer-motion';
import { getCachedVideoUrl } from '../utils/videoCache';
import { attentionInvestorPoints, attentionInvestorQuotes, companyDetails, escalationLevels, IMPORTANT_LINKS, regulatoryLinks } from '../utils/utils';
import { ArrowUpRight } from 'lucide-react';



// Tiny inline icons — avoids pulling in an icon library for two glyphs
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const MailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

// NEW: arrow icon used between escalation steps
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);


const FOOTER_VIDEO = 'https://res.cloudinary.com/drverjcjf/video/upload/v1780914015/Footer_rrbhuu.mp4';

const CompanyFooter: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getCachedVideoUrl(FOOTER_VIDEO).then(blobUrl => {
      if (videoRef.current) {
        videoRef.current.src = blobUrl;
      }
    });
  }, []);

  return (
    <footer className="relative overflow-hidden px-4 sm:px-6 py-14 sm:py-16 lg:py-20 border-t border-white/10">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = 0.75;
        }}
      />

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
              <img src={Logo} alt="AlphaMatrix" className="h-12 w-12 sm:h-14 sm:w-14" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-[0.2em] text-white">
                  AlphaMatrix
                </h2>
              </div>
            </div>

            <div className="space-y-5 text-sm sm:text-base text-white/65 leading-relaxed">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white mb-2">
                  Registered Office Address
                </p>
                <p className="text-[11px] sm:text-xs">
                  Flat No. 17, 1st Floor, Mahavir Majesty, M.G Road, Near BMC
                  Swimming Pool, Kandivali West, Mumbai, Mumbai Suburban,
                  Maharashtra 400067
                </p>
              </div>
            </div>

            {/* Contact & Compliance Officer — dummy data, replace before launch */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className="
              rounded-xl
              backdrop-blur-xl
              px-3 py-2.5
              transition-all duration-300
              hover:border-brand-saffron/40
              hover:bg-white/[0.07]
            "
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-saffron mb-1.5">
                  Contact
                </p>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px] sm:text-xs">
                  <PhoneIcon />
                  <span>+91 22 4000 0000</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px] sm:text-xs mt-1">
                  <MailIcon />
                  <span className="wrap-break-word">support@alphamatrix.in</span>
                </div>
              </div>

              <div
                className="
              rounded-xl
              backdrop-blur-xl
              px-3 py-2.5
              transition-all duration-300
              hover:border-brand-saffron/40
              hover:bg-white/[0.07]
            "
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-saffron mb-1.5">
                  Compliance Officer
                </p>
                <p className="text-[11px] sm:text-xs text-white font-medium mb-1">
                  Mr. Sadanand Mishra
                </p>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px] sm:text-xs">
                  <PhoneIcon />
                  <span>+91 22 4000 0001</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px] sm:text-xs mt-1">
                  <MailIcon />
                  <span className="wrap-break-word">compliance@alphamatrix.in</span>
                </div>
              </div>
            </div>

            {/* Regulatory quick links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {regulatoryLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                rounded-full
                border border-white/10
                bg-white/10
                px-3.5 py-1.5
                text-[11px] font-semibold uppercase tracking-[0.18em]
                text-white/50
                transition-all duration-300
                hover:text-brand-saffron
                hover:border-brand-saffron/40
                hover:bg-white/[0.07]
              "
                >
                  {link.label}
                </a>
              ))}
            </div>
          </SectionReveal>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {companyDetails.map((detail) => (
              <motion.div
                key={detail.label}
                variants={fadeUp}
                className="
                rounded-xl
                border border-white/10
                bg-white/5
                backdrop-blur-xl
                px-3 py-2
                transition-all
                duration-300
                hover:border-brand-saffron/40
                hover:bg-white/[0.07]
                "
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-saffron mb-1">
                  {detail.label}
                </p>
                <p className="font-mono text-xs text-white wrap-break-word">
                  {detail.value}
                </p>
              </motion.div>
            ))}

            {/* USCNBA Bank Details integrated as a wide card */}
            <motion.div
                variants={fadeUp}
                className="
                col-span-2 sm:col-span-3
                rounded-xl
                border border-white/10
                bg-white/5
                backdrop-blur-xl
                px-4 py-3
                transition-all
                duration-300
                hover:border-brand-saffron/40
                hover:bg-white/[0.07]
                flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3
                mt-1
                "
            >
                <div>
                   <p className="text-[10px] uppercase tracking-[0.18em] text-brand-saffron mb-0.5">
                     Active USCNBA (Nodal Bank A/c)
                   </p>
                   <p className="text-[9px] text-white/50">As reported to Exchange</p>
                </div>
                <div className="flex gap-x-6 gap-y-2">
                   <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Bank</p>
                      <p className="font-mono text-xs text-white">ICICI</p>
                   </div>
                   <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">A/C No.</p>
                      <p className="font-mono text-xs text-white">405158611</p>
                   </div>
                   <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">IFSC</p>
                      <p className="font-mono text-xs text-white">ICIC0000004</p>
                   </div>
                </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Grievance Redressal Escalation Matrix */}
        <SectionReveal variants={fadeUp}>
          <div className="mt-8 pt-6 border-t border-white/8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white mb-3">
              Grievance Redressal Mechanism
            </p>

            <div className="flex flex-col sm:flex-row sm:items-start gap-0">
              {escalationLevels.map((step, idx) => (
                <React.Fragment key={step.level}>
                  <div className="group relative flex-1">
                    <div className="
                      relative z-10
                      rounded-xl  backdrop-blur-xl
                      px-3.5 py-3
                      transition-all duration-300
                      hover:border-brand-saffron/30 hover:bg-white/8
                    ">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-saffron/10 text-[8px] font-bold text-brand-saffron">
                          {step.level}
                        </span>
                        <span className="text-[11px] font-semibold text-white/80">{step.title}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/65 leading-relaxed mb-2">
                        {step.description}
                      </p>
                      <a
                        href={step.href}
                        target={step.href.startsWith('http') ? '_blank' : undefined}
                        rel={step.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-saffron/70 hover:text-brand-saffron transition-colors"
                      >
                        {step.linkLabel}
                      </a>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* NEW: Attention Investors — mandatory verbatim message per NSE/BSE circulars */}
<SectionReveal variants={fadeUp}>
  <div className="mt-4 pt-6 border-t border-white/8">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-saffron" />
      <p className="text-[11px] uppercase tracking-[0.24em] text-white">
        Attention Investors
      </p>
    </div>
    <p className="text-[11px] text-white/55 mb-4 max-w-2xl">
      Mandatory advisory as prescribed by NSE/BSE circulars on investor protection.
    </p>

    {/* Numbered points */}
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-x-6"
    >
      {attentionInvestorPoints.map((point, idx) => (
        <motion.div key={idx} variants={fadeUp} className="flex gap-3 py-1">
          <span className="shrink-0 flex items-center justify-center h-5 w-5 mt-0.5 rounded-full bg-brand-saffron/10 text-[10px] font-bold text-brand-saffron">
            {idx + 1}
          </span>
          <p className="text-[11px] sm:text-xs text-white/65 leading-relaxed">
            {point}
          </p>
        </motion.div>
      ))}
    </motion.div>

    {/* Quoted advisory lines */}
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="mt-5 space-y-3 border-t border-white/8 pt-5"
    >
      {attentionInvestorQuotes.map((quote, idx) => (
        <motion.p
          key={idx}
          variants={fadeUp}
          className="text-[11px] sm:text-xs text-white/60 italic leading-relaxed border-l-2 border-brand-saffron/25 pl-3"
        >
          “{quote}”
        </motion.p>
      ))}
    </motion.div>

    {/* PSPL / AlphaMatrix compliance paragraph */}
    <motion.p
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="mt-5 border-t border-white/8 pt-5 text-[11px] sm:text-xs text-white/60 leading-relaxed"
    >
      AlphaMatrix does not offer any product pertaining to “portfolio management” or
      any “fixed return scheme” of any kind. AlphaMatrix does not accept cash for
      opening or operating a trading account under any circumstances. All pay-in and
      pay-out activities are through banking channels only. AlphaMatrix does not
      provide “guaranteed,” “assured,” or “fixed” returns to any of its clients for
      trading in the securities market. AlphaMatrix, and its directors, employees,
      and authorised persons, do not promote or allow any of the aforesaid activities
      or any other activity in contravention of the rules, regulations, or bye-laws
      of the NSE/SEBI.
    </motion.p>
  </div>
</SectionReveal>

        {/* Compliance & Disclosures */}
        <SectionReveal variants={fadeUp}>
          {/* <div className="mt-4 sm:mt-4 pt-8 border-t border-white/8 ">
            <p className="text-xs uppercase tracking-[0.24em] text-white mb-4">
              Compliance &amp; Disclosures
            </p>
            <div className="space-y-4 text-[11px] sm:text-xs text-white/65 leading-relaxed">
              <p>
                AlphaMatrix (CIN: U67120MH2008PTC185004, GSTIN: 27AAFCM6712K1Z9) is a
                member of NSE &amp; BSE with SEBI Registration No: INZ000318637.
                Registered Office: Flat No. 17, 1st Floor, Mahavir Majesty, M.G Road,
                Near BMC Swimming Pool, Kandivali West, Mumbai, Mumbai Suburban,
                Maharashtra 400067. For any grievances related to stock broking, please
                write to{' '}
                <a
                  href="mailto:grievances@alphamatrix.in"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  grievances@alphamatrix.in
                </a>
                . Please ensure you carefully read the Risk Disclosure Document as
                prescribed by SEBI before investing.
              </p>

              <p>
                Procedure to file a complaint on SEBI SCORES: Register on the{' '}
                <a
                  href="https://scores.sebi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  SCORES
                </a>{' '}
                portal. Mandatory details for filing complaints on SCORES:
                Name, PAN, Address, Mobile Number, E-mail ID. Benefits:
                Effective communication, speedy redressal of grievances. You
                may also escalate disputes through the SEBI{' '}
                <a
                  href="https://smartodr.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  Online Dispute Resolution (ODR)
                </a>{' '}
                portal.
              </p>

              <p>
                AlphaMatrix makes no warranties or representations, express or
                implied, on products or strategies offered through the
                platform, and accepts no liability for any damages or losses,
                however caused, arising from the use of or reliance on its
                products or related services. Unless otherwise specified, all
                returns, performance data and back-tested results are
                historical and for illustrative purposes only; future
                performance will vary and depends on personal and market
                circumstances. Information provided is educational only and
                does not constitute investment advice.
              </p>

              <p className="text-white/50">
                Investment in securities market are subject to market risks,
                read all the related documents carefully before investing.
              </p>

              <p>
                For exchange-validated membership details, refer to{' '}
                <a
                  href="https://www.nseindia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  nseindia.com
                </a>{' '}
                and{' '}
                <a
                  href="https://www.bseindia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  bseindia.com
                </a>
                . Terms and conditions of the website/app are applicable.
                Privacy policy of the website is applicable.
              </p>
            </div>
          </div> */}
                        {/* Important Links */}
            <div className="mt-6  border-t border-white/8 flex justify-center py-4">
              <p className="text-[11px] sm:text-xs leading-relaxed">
                <span className="font-semibold text-white">Important Links: </span>
                {IMPORTANT_LINKS.map((link, idx) => (
                  <React.Fragment key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                    {idx < IMPORTANT_LINKS.length - 1 && (
                      <span className="text-white/25 mx-2">|</span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
        </SectionReveal>

        <div className="mt-1 sm:mt-1 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-xs sm:text-sm text-white/50">
            &copy; 2026 AlphaMatrix. All rights reserved.

          </p>
          <p className="text-xs sm:text-sm text-white/50">
            Design, development & deployment by Feedsense AI
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-white/65">
            NSE: 90415&nbsp;&nbsp;•&nbsp;&nbsp;BSE: 6879
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CompanyFooter;