import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Mail,
  Search,
  ShieldAlert,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const staggerContainer = (gap = 0.06) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

const SectionShell: React.FC<{
  index: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ index, title, icon, children }) => (
  <motion.section
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    className="py-8 sm:py-10 border-b border-gray-200 last:border-b-0"
  >
    <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-brand-saffron/20 bg-brand-saffron/10 text-brand-saffron">
        {icon}
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-saffron/80 mb-0.5">
          Step {index}
        </p>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
          {title}
        </h2>
      </div>
    </div>
    <div className="pl-0 sm:pl-[52px]">{children}</div>
  </motion.section>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.li variants={fadeUp} className="flex gap-3 py-1.5">
    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-saffron/70" />
    <span className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
      {children}
    </span>
  </motion.li>
);

const NumberedStep: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
  <motion.li variants={fadeUp} className="flex gap-3 py-2">
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-saffron/10 text-[10px] font-bold text-brand-saffron mt-0.5">
      {number}
    </span>
    <span className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
      {children}
    </span>
  </motion.li>
);

const FileComplaint: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-saffron/[0.04] to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-saffron/20 bg-brand-saffron/10 px-3 py-1.5 mb-5">
            <ShieldAlert size={13} className="text-brand-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-saffron">
              Grievance Filing Procedure
            </span>
          </div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-light text-gray-900 leading-tight mb-3">
            How to File a <span className="font-bold">Complaint</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
            We care about our investors and their grievances. Follow the steps below to file
            a complaint and track its resolution.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <SectionShell index={1} title="Filing a Complaint" icon={<FileText size={18} />}>
          <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed mb-4">
            We have created a dedicated e-mail for you to reach out to us with any issues or
            queries. Please use the dedicated e-mail ID{' '}
            <a
              href="mailto:compliance@alphamatrix.in"
              className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors font-medium"
            >
              compliance@alphamatrix.in
            </a>{' '}
            only for investor complaints and queries.
          </p>

          <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed mb-3 font-medium">
            When you send us a complaint, please include the following details:
          </p>
          <motion.ul
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <Bullet>Your registered e-mail ID</Bullet>
            <Bullet>Your name and client code</Bullet>
            <Bullet>A brief summary of your complaint</Bullet>
          </motion.ul>
        </SectionShell>

        <SectionShell index={2} title="How to Track Complaints" icon={<Search size={18} />}>
          <motion.ol
            variants={staggerContainer(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-1"
          >
            <NumberedStep number={1}>
              You will receive a <strong className="text-gray-900">Ticket ID</strong> when you file
              a complaint. You can use this Ticket ID to check the status of your complaint by
              calling us at{' '}
              <a
                href="tel:022-40000000"
                className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors font-medium"
              >
                022-4000 0000
              </a>
              .
            </NumberedStep>
            <NumberedStep number={2}>
              We will send you a resolution of your complaint to your registered e-mail ID. If you
              are not satisfied with the resolution, you can re-open the complaint using the same
              Ticket ID and provide additional information.
            </NumberedStep>
            <NumberedStep number={3}>
              If you are still not satisfied with the resolution or the feedback, you can escalate
              the complaint to higher levels. You can find the contact details of the higher
              authorities in the &ldquo;Escalation Matrix&rdquo; on the Contact Us page of our
              website.
            </NumberedStep>
          </motion.ol>
        </SectionShell>

        <div className="py-8 sm:py-10">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            For any queries regarding the complaint filing process, write to us at{' '}
            <a
              href="mailto:compliance@alphamatrix.in"
              className="text-brand-saffron/80 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
            >
              compliance@alphamatrix.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;
