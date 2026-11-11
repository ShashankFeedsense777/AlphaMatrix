import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   Animation helpers — reuse your shared `fadeUp` / `staggerContainer`
   from SectionReveal if already defined elsewhere; delete this
   block and import from there instead to avoid duplication.
   ────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const staggerContainer = (gap = 0.06) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

/* ──────────────────────────────────────────────────────────
   Content data — sourced from AlphaMatrix's Grievance Redressal
   & Escalation Mechanism document. Fields still pending from the
   source doc (Contact Person, Email Id) are marked rather than
   guessed at — fill these in before publishing.
   ────────────────────────────────────────────────────────── */

type EscalationRow = {
  role: string;
  contactPerson: string | null; // null = pending
  address: string;
  contactNo: string | null; // null = pending
  email: string | null; // null = pending
  hours: string;
};

const escalationMatrix: EscalationRow[] = [
  {
    role: 'Customer Care',
    contactPerson: null,
    address: '17, 1st Floor, Mahavir Majesty, Near BMC Swimming Pool, M.G. Road, Kandivali West, Mumbai \u2013 400067',
    contactNo: '022-2089 2008',
    email: null,
    hours: '9:00 AM \u2013 6:00 PM (Mon \u2013 Fri)',
  },
  {
    role: 'COO & Head of Customer Care',
    contactPerson: null,
    address: '17, 1st Floor, Mahavir Majesty, Near BMC Swimming Pool, M.G. Road, Kandivali West, Mumbai \u2013 400067',
    contactNo: '022-2089 2008',
    email: null,
    hours: '9:00 AM \u2013 6:00 PM (Mon \u2013 Fri)',
  },
  {
    role: 'Compliance Officer',
    contactPerson: 'Mr. Sadanand Mishra',
    address: '17, 1st Floor, Mahavir Majesty, Near BMC Swimming Pool, M.G. Road, Kandivali West, Mumbai \u2013 400067',
    contactNo: '022-4000 0001',
    email: 'compliance@alphamatrix.in',
    hours: '9:00 AM \u2013 6:00 PM (Mon \u2013 Fri)',
  },
  {
    role: 'Chief Executive Officer (CEO)',
    contactPerson: 'Mr. Shailendra Singh',
    address: '17, 1st Floor, Mahavir Majesty, Near BMC Swimming Pool, M.G. Road, Kandivali West, Mumbai \u2013 400067',
    contactNo: null,
    email: null,
    hours: '9:00 AM \u2013 6:00 PM (Mon \u2013 Fri)',
  },
];

// Pending field placeholder
const Pending: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-amber-600/70 text-[11px] italic">
    <AlertCircle size={11} /> Pending
  </span>
);

/* ──────────────────────────────────────────────────────────
   Reusable primitives
   ────────────────────────────────────────────────────────── */

const SectionShell: React.FC<{
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, icon, subtitle, children }) => (
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
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-gray-500 font-bold mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="pl-0 sm:pl-[52px]">{children}</div>
  </motion.section>
);

const InfoLine: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 text-brand-saffron/60 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-wider text-gray-700 font-bold mb-0.5">{label}</p>
      <p className="text-[12px] sm:text-[12.5px] text-gray-600 leading-relaxed break-words">
        {value}
      </p>
    </div>
  </div>
);

const EscalationCard: React.FC<{ row: EscalationRow; index: number }> = ({ row, index }) => (
  <motion.div
    variants={fadeUp}
    className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 transition-colors hover:border-brand-saffron/25"
  >
    <div className="flex items-center gap-2.5 mb-4">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-saffron/10 text-[10px] font-bold text-brand-saffron">
        {index + 1}
      </span>
      <p className="text-[13px] font-semibold text-black">{row.role}</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <InfoLine
        icon={<User size={13} />}
        label="Contact Person"
        value={row.contactPerson ?? <Pending />}
      />
      <InfoLine
        icon={<Clock size={13} />}
        label="Working Hours"
        value={row.hours}
      />
      <InfoLine
        icon={<Phone size={13} />}
        label="Contact No."
        value={row.contactNo ?? <Pending />}
      />
      <InfoLine
        icon={<Mail size={13} />}
        label="Email Id"
        value={
          row.email ? (
            <a
              href={`mailto:${row.email}`}
              className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
            >
              {row.email}
            </a>
          ) : (
            <Pending />
          )
        }
      />
      <InfoLine
        icon={<MapPin size={13} />}
        label="Address"
        value={row.address}
      />
    </div>
  </motion.div>
);

/* ──────────────────────────────────────────────────────────
   Investor Grievance Page
   ────────────────────────────────────────────────────────── */

const InvestorGrievance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative border-b  border-gray-200 px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
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
              Grievance Redressal &amp; Escalation Mechanism
            </span>
          </div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-light text-gray-900 leading-tight mb-3">
            Investor <span className="font-bold">Grievance</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
            We&rsquo;re sorry you&rsquo;ve had reason to raise a concern. Here&rsquo;s exactly who to
            contact, in escalating order, and how SEBI&rsquo;s SCORES portal can help if you need
            it resolved further.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        {/* Escalation Matrix */}
        <SectionShell
          title="Investor Grievance Escalation Matrix"
          subtitle="Stock Broker & Depository Participant — in order of escalation"
          icon={<Building2 size={18} />}
        >
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-3"
          >
            {escalationMatrix.map((row, i) => (
              <EscalationCard key={row.role} row={row} index={i} />
            ))}
          </motion.div>
        </SectionShell>

        {/* Direct grievance email + segment-wise compliance contacts */}
        <SectionShell
          title="Write to Us Directly"
          icon={<Mail size={18} />}
        >
          <p className="text-[12.5px] sm:text-sm text-gray-700 leading-relaxed mb-1">
            We are extremely sorry that you&rsquo;ve had a reason to complain. For any kind of
            grievance, you may write to us at:
          </p>
          <a
            href="mailto:grievances@alphamatrix.in"
            className="inline-block text-sm sm:text-base font-semibold text-brand-saffron hover:text-orange-400 underline-offset-2 hover:underline transition-colors mb-2"
          >
            grievances@alphamatrix.in
          </a>
          <p className="text-[12.5px] sm:text-sm text-gray-700 leading-relaxed mb-5">
            We shall have your complaint properly investigated and dealt with efficiently.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { segment: 'Depository Participant' },
              { segment: 'Securities / Commodities' },
            ].map(({ segment }) => (
              <div
                key={segment}
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-saffron/80 mb-3">
                  {segment}
                </p>
                <p className="text-[12.5px] text-gray-800 font-medium mb-1.5">
                  Compliance Officer: Mr. Sadanand Mishra
                </p>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-600 mb-1">
                  <Phone size={12} className="text-brand-saffron/60" />
                  <span>022-4000 0001</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                  <Mail size={12} className="text-brand-saffron/60" />
                  <a
                    href="mailto:compliance@alphamatrix.in"
                    className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors break-all"
                  >
                    compliance@alphamatrix.in
                  </a>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        {/* Investor Complaints Data / SCORES */}
        <SectionShell
          title="Investor Complaints Data"
          subtitle="Filing of complaints on SCORES — easy & quick"
          icon={<AlertCircle size={18} />}
        >
          <p className="text-[12.5px] sm:text-sm text-gray-700 leading-relaxed mb-4">
            Visit the SCORES website:{' '}
            <a
              href="https://scores.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors font-medium"
            >
              scores.sebi.gov.in
            </a>
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-semibold text-gray-800 mb-2">
                Register on the SCORES portal
              </p>
            </div>

            <div>
              <p className="text-[12px] font-semibold text-gray-800 mb-2">
                Mandatory details for filing complaints on SCORES
              </p>
              <ul className="grid grid-cols-2 gap-1.5">
                {['Name', 'PAN', 'Address', 'Mobile Number & Email ID'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                    <span className="h-1 w-1 rounded-full bg-brand-saffron/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[12px] font-semibold text-gray-800 mb-2">Benefits</p>
              <ul className="space-y-1">
                {['Effective communication', 'Speedy redressal of grievances'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                    <span className="h-1 w-1 rounded-full bg-brand-saffron/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionShell>

        {/* Footer note */}
        <div className="py-8 sm:py-10">
          <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
            All escalation timelines follow SEBI/Exchange-prescribed norms. If your grievance
            remains unresolved after escalation through the above channels, you may approach
            SEBI SCORES or the SEBI Online Dispute Resolution (ODR) portal at{' '}
            <a
              href="https://smartodr.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-saffron/80 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
            >
              smartodr.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestorGrievance;