import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Target,
  Briefcase,
  Scale,
  Clock,
  ListChecks,
  MessageSquareWarning,
  ShieldAlert,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   Animation helpers (reuse if you already have these globally —
   delete this block and import from your shared variants file
   if `fadeUp` / `staggerContainer` already exist elsewhere)
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
   Content data — extracted from the Investor Charter for
   Stock Brokers (SEBI-prescribed format)
   ────────────────────────────────────────────────────────── */

const mission = [
  'To provide high quality and dependable service through innovation, capacity enhancement and use of technology.',
  'To establish and maintain a relationship of trust and ethics with the investors.',
  'To observe highest standard of compliances and transparency.',
  'To always keep \u2018protection of investors\u2019 interest\u2019 as goal while providing service.',
  'To ensure confidentiality of information shared by investors unless such information is required to be provided in furtherance of discharging legal obligations or investors have provided specific consent to share such information.',
];

const services = [
  'Execution of trades on behalf of investors.',
  'Issuance of Contract Notes.',
  'Issuance of intimations regarding margin due payments.',
  'Facilitate execution of early pay-in obligation instructions.',
  'Periodic Settlement of client\u2019s funds.',
  'Issuance of retention statement of funds at the time of settlement.',
  'Risk management systems to mitigate operational and market risk.',
  'Facilitate client profile changes in the system as instructed by the client.',
  'Information sharing with the client w.r.t. relevant Market Infrastructure Institutions (MII) circulars.',
  'Provide a copy of Rights & Obligations document to the client.',
  'Communicating Most Important Terms and Conditions (MITC) to the client.',
  'Redressal of Investor\u2019s grievances.',
];

const rights: { lead: string; text: string }[] = [
  { lead: 'Ask', text: 'for and receive information from a firm about the work history and background of the person handling your account, as well as information about the firm itself (including website providing mandatory information).' },
  { lead: 'Receive', text: 'complete information about the risks, obligations, and costs of any investment before investing.' },
  { lead: 'Receive', text: 'a copy of all completed account forms and rights & obligation document.' },
  { lead: 'Receive', text: 'a copy of \u2018Most Important Terms & Conditions\u2019 (MITC).' },
  { lead: 'Receive', text: 'account statements that are accurate and understandable.' },
  { lead: 'Understand', text: 'the terms and conditions of transactions you undertake.' },
  { lead: 'Access', text: 'your funds in a prescribed manner and receive information about any restrictions or limitations on access.' },
  { lead: 'Receive', text: 'complete information about maintenance or service charges, transaction or redemption fees, and penalties in form of tariff sheet.' },
  { lead: 'Discuss', text: 'your grievances with compliance officer / compliance team / dedicated grievance redressal team of the firm and receive prompt attention to and fair consideration of your concerns.' },
  { lead: 'Close', text: 'your zero balance accounts online with minimal documentation.' },
  { lead: 'Get', text: 'the copies of all policies (including Most Important Terms and Conditions) of the broker related to dealings of your account.' },
  { lead: 'Not', text: 'be discriminated against in terms of services offered to equivalent clients.' },
  { lead: 'Get', text: 'only those advertisement materials from the broker which adhere to Code of Advertisement norms in place.' },
  { lead: 'In case', text: 'of broker defaults, be compensated from the Exchange Investor Protection Fund as per the norms in place.' },
  { lead: 'Trade', text: 'in derivatives after submission of relevant financial documents to the broker subject to brokers\u2019 adequate due diligence.' },
  { lead: 'Get', text: 'warnings on the trading systems while placing orders in securities where surveillance measures are in place.' },
  { lead: 'Get', text: 'access to products and services in a suitable manner even if differently abled.' },
  { lead: 'Get', text: 'access to educational materials of the MIIs and brokers.' },
  { lead: 'Get', text: 'access to all the exchanges of a particular segment you wish to deal with unless opted out specifically as per Broker norms.' },
  { lead: 'Deal', text: 'with one or more stockbrokers of your choice without any compulsion of minimum business.' },
  { lead: 'Have', text: 'access to the escalation matrix for communication with the broker.' },
  { lead: 'Not', text: 'be bound by any clause prescribed by the Brokers which are contravening the Regulatory provisions.' },
];

const activityTimelines: { sno: string; activity: string; timeline: string }[] = [
  { sno: '1', activity: 'KYC entered into KRA System and CKYCR', timeline: '3 working days of account opening' },
  { sno: '2', activity: 'Client Onboarding', timeline: 'Immediate, but not later than one week' },
  { sno: '3', activity: 'Order execution', timeline: 'Immediate on receipt of order, but not later than the same day' },
  { sno: '4', activity: 'Allocation of Unique Client Code', timeline: 'Before trading' },
  { sno: '5', activity: 'Copy of duly completed Client Registration Documents to clients', timeline: '7 days from the date of upload of Unique Client Code to the Exchange by the trading member' },
  { sno: '6', activity: 'Issuance of contract notes', timeline: '24 hours of execution of trades' },
  { sno: '7', activity: 'Collection of upfront margin from client', timeline: 'Before initiation of trade' },
  { sno: '8', activity: 'Issuance of intimations regarding other margin due payments', timeline: 'At the end of the T day' },
  { sno: '9', activity: 'Settlement of client funds', timeline: 'First Friday/Saturday of the month / quarter as per Exchange preannounced schedule.' },
  { sno: '10', activity: '\u2018Statement of Accounts\u2019 for Funds, Securities and Commodities', timeline: 'Monthly basis' },
  { sno: '11', activity: 'Issuance of retention statement of funds/commodities', timeline: '5 days from the date of settlement' },
  { sno: '12', activity: 'Issuance of Annual Global Statement', timeline: '30 days from the end of the financial year' },
  { sno: '13', activity: 'Investor grievances redressal', timeline: '21 days from the receipt of the complaint' },
];

const dosDonts: { dos: string; donts: string }[] = [
  { dos: 'Read all documents and conditions being agreed before signing the account opening form.', donts: 'Do not deal with unregistered stock broker.' },
  { dos: 'Receive a copy of KYC, copy of account opening documents and Unique Client Code.', donts: 'Do not forget to strike off blanks in your account opening and KYC.' },
  { dos: 'Read the product / operational framework / timelines related to various Trading and Clearing & Settlement processes.', donts: 'Do not submit an incomplete account opening and KYC form.' },
  { dos: 'Receive all information about brokerage, fees and other charges levied.', donts: 'Do not forget to inform any change in information linked to trading account and obtain confirmation of updation in the system.' },
  { dos: 'Register your mobile number and email ID in your trading, demat and bank accounts to get regular alerts on your transactions.', donts: 'Do not transfer funds, for the purposes of trading, to anyone other than a stock broker. No payment should be made in the name of an employee of the stock broker.' },
  { dos: 'If executed, receive a copy of Power of Attorney. However, Power of Attorney is not a mandatory requirement as per SEBI / Stock Exchanges. Before granting Power of Attorney, carefully examine the scope and implications of powers being granted.', donts: 'Do not ignore any emails / SMSs received with regards to trades done, from the Stock Exchange and raise a concern, if discrepancy is observed.' },
  { dos: 'Receive contract notes for trades executed, showing transaction price, brokerage, GST and STT etc. as applicable, separately, within 24 hours of execution of trades.', donts: 'Do not opt for digital contracts, if not familiar with computers.' },
  { dos: 'Receive funds and securities / commodities on time within 24 hours from pay-out.', donts: 'Do not share trading password.' },
  { dos: 'Verify details of trades, contract notes and statement of account and approach relevant authority for any discrepancies. Verify trade details on the Exchange websites from the trade verification facility provided by the Exchanges.', donts: 'Do not fall prey to fixed / guaranteed returns schemes.' },
  { dos: 'Receive statement of accounts periodically. If opted for running account settlement, account has to be settled by the stock broker as per the option given by the client (30 or 90 days).', donts: 'Do not fall prey to fraudsters sending emails and SMSs luring you to trade in stocks / securities promising huge profits.' },
  { dos: 'In case of any grievances, approach stock broker or Stock Exchange or SEBI for getting the same resolved within prescribed timelines.', donts: 'Do not follow herd mentality for investments. Seek expert and professional advice for your investments.' },
  { dos: 'Retain documents for trading activity as it helps in resolving disputes, if they arise.', donts: '' },
];

const defaultSteps = [
  'Circular is issued to inform about declaration of Stock Broker as Defaulter.',
  'Information of defaulter stock broker is disseminated on Stock Exchange website.',
  'Public Notice is issued informing declaration of a stock broker as defaulter and inviting claims within specified period.',
  'Intimation to clients of defaulter stock brokers via emails and SMS for facilitating lodging of claims within the specified period.',
];

const defaultInfo = [
  'Norms for eligibility of claims for compensation from IPF.',
  'Claim form for lodging claim against defaulter stock broker.',
  'FAQ on processing of investors\u2019 claims against Defaulter stock broker.',
  'Provision to check online status of client\u2019s claim.',
  'Standard Operating Procedure (SOP) for handling of Claims of Investors in the Cases of Default by Brokers.',
  'Claim processing policy against Defaulter/Expelled members.',
  'List of Defaulter/Expelled members and public notice issued.',
];

/* ──────────────────────────────────────────────────────────
   Reusable primitives
   ────────────────────────────────────────────────────────── */

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
          Section {index}
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

const BulletList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <motion.ul
    variants={staggerContainer(0.05)}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    className="space-y-0.5"
  >
    {items.map((item, i) => (
      <Bullet key={i}>{item}</Bullet>
    ))}
  </motion.ul>
);

/* ──────────────────────────────────────────────────────────
   Investor Charter Page
   ────────────────────────────────────────────────────────── */

const InvestorCharter: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Hero */}
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
              SEBI Mandated Disclosure
            </span>
          </div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-light text-gray-900 leading-tight mb-3">
            Investor Charter <span className="font-bold">for Stock Brokers</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
            Published in accordance with SEBI circular requirements to inform investors of
            AlphaMatrix&rsquo;s vision, services, your rights, and the grievance redressal process.
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        {/* 1. Vision */}
        <SectionShell index={1} title="Vision" icon={<Compass size={18} />}>
          <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed">
            To follow highest standards of ethics and compliances while facilitating the trading
            by clients in securities in a fair and transparent manner, so as to contribute in
            creation of wealth for investors.
          </p>
        </SectionShell>

        {/* 2. Mission */}
        <SectionShell index={2} title="Mission" icon={<Target size={18} />}>
          <BulletList items={mission} />
        </SectionShell>

        {/* 3. Services */}
        <SectionShell
          index={3}
          title="Services provided to Investors by stockbrokers include"
          icon={<Briefcase size={18} />}
        >
          <BulletList items={services} />
        </SectionShell>

        {/* 4. Rights */}
        <SectionShell index={4} title="Rights of Investors" icon={<Scale size={18} />}>
          <motion.ul
            variants={staggerContainer(0.04)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="space-y-0.5"
          >
            {rights.map((r, i) => (
              <Bullet key={i}>
                <span className="font-semibold text-gray-900">{r.lead}</span> {r.text}
              </Bullet>
            ))}
          </motion.ul>
        </SectionShell>

        {/* 5. Activities with timelines */}
        <SectionShell
          index={5}
          title="Various activities of Stock Brokers with timelines"
          icon={<Clock size={18} />}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {/* header row — hidden on mobile */}
            <div className="hidden sm:grid grid-cols-[48px_1.4fr_1fr] gap-4 bg-white shadow-sm px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>No.</span>
              <span>Activity</span>
              <span>Expected Timeline</span>
            </div>
            <div className="divide-y divide-gray-200">
              {activityTimelines.map((row) => (
                <div
                  key={row.sno}
                  className="grid grid-cols-[28px_1fr] sm:grid-cols-[48px_1.4fr_1fr] gap-2 sm:gap-4 px-4 py-3.5"
                >
                  <span className="text-[11px] sm:text-xs font-semibold text-brand-saffron/80">
                    {row.sno}.
                  </span>
                  <span className="text-[12.5px] sm:text-[13px] text-gray-800 leading-relaxed">
                    {row.activity}
                  </span>
                  <span className="col-span-2 sm:col-span-1 text-[12px] sm:text-[13px] text-gray-500 leading-relaxed pl-9 sm:pl-0">
                    {row.timeline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* 6. DOs and DON'Ts */}
        <SectionShell index={6} title="DOs and DON&rsquo;Ts for Investors" icon={<ListChecks size={18} />}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/80 mb-3">
                Do
              </p>
              <ul className="space-y-3">
                {dosDonts.map((row, i) => (
                  <li key={i} className="text-[12px] sm:text-[12.5px] text-gray-700 leading-relaxed flex gap-2">
                    <span className="text-emerald-600/60 font-mono shrink-0">{i + 1}.</span>
                    <span>{row.dos}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/80 mb-3">
                Don&rsquo;t
              </p>
              <ul className="space-y-3">
                {dosDonts.map((row, i) =>
                  row.donts ? (
                    <li key={i} className="text-[12px] sm:text-[12.5px] text-gray-700 leading-relaxed flex gap-2">
                      <span className="text-red-600/60 font-mono shrink-0">{i + 1}.</span>
                      <span>{row.donts}</span>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">
            Additionally, investors may refer to the Dos and Don&rsquo;ts issued by Market
            Infrastructure Institutions (MIIs) on their respective websites from time to time.
          </p>
        </SectionShell>

        {/* 7. Grievance Redressal Mechanism */}
        <SectionShell
          index={7}
          title="Grievance Redressal Mechanism"
          icon={<MessageSquareWarning size={18} />}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-saffron/80 mb-2">
                1. Investor complaint / grievance
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed mb-3">
                Investor can lodge a complaint/grievance against a stock broker in the following ways:
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                Mode of filing with the stock broker
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed mb-3">
                Approach the Stock Broker at the designated Investor Grievance e-mail ID. The
                Stock Broker will strive to redress the grievance immediately, but not later than{' '}
                <span className="text-gray-900 font-medium">21 days</span> of receipt.
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                Mode of filing with stock exchanges
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
                SCORES 2.0 &mdash; a web-based centralized grievance redressal system of SEBI:{' '}
                <a
                  href="https://scores.sebi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  scores.sebi.gov.in
                </a>
              </p>
              <div className="mt-2 ml-1 space-y-1">
                <p className="text-[12px] text-gray-600">Two-level review for complaints against a stock broker:</p>
                <ul className="space-y-1 pl-3">
                  <li className="text-[12px] text-gray-600 flex gap-2">
                    <span className="text-brand-saffron/60">&bull;</span> First review by Designated body / Exchange
                  </li>
                  <li className="text-[12px] text-gray-600 flex gap-2">
                    <span className="text-brand-saffron/60">&bull;</span> Second review by SEBI
                  </li>
                </ul>
              </div>
              <p className="mt-2 text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
                Complaints can also be raised via the designated email IDs of the Exchange.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-saffron/80 mb-2">
                2. Online Dispute Resolution (ODR)
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
                If unsatisfied with the resolution provided by Market Participants, investors may
                file the complaint/grievance on the{' '}
                <a
                  href="https://smartodr.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-saffron/90 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
                >
                  SMARTODR
                </a>{' '}
                platform for resolution through online conciliation or arbitration.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-saffron/80 mb-3">
                3. Steps in ODR &mdash; review, conciliation &amp; arbitration
              </p>
              <ol className="space-y-2.5">
                {[
                  'Investor approaches the Market Participant for redressal of the complaint.',
                  'If unsatisfied, the investor may escalate the complaint on the SEBI SCORES portal, or file a complaint on the SMARTODR portal for resolution through online conciliation and arbitration.',
                  'On receipt of a complaint on SMARTODR, the relevant MII reviews the matter and endeavours to resolve it between the Market Participant and investor within 21 days.',
                  'If not amicably resolved, the matter is referred for conciliation \u2014 the conciliator endeavours to settle the dispute within 21 days, extendable by 10 days with consent of both parties.',
                  'If conciliation is unsuccessful, the investor may request the matter be referred for arbitration. The arbitration process concludes within 30 days, extendable by 30 days with consent of the parties to the dispute.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-saffron/10 text-[10px] font-bold text-brand-saffron mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </SectionShell>

        {/* 8. Handling of Investor's claims in case of default */}
        <SectionShell
          index={8}
          title="Handling of Investor's claims / complaints in case of default of a Trading Member / Clearing Member (TM/CM)"
          icon={<ShieldAlert size={18} />}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Default of TM/CM
          </p>
          <p className="text-[12.5px] sm:text-[13px] text-gray-700 leading-relaxed mb-4">
            The following steps are carried out by the Stock Exchange for the benefit of
            investors, in case a stock broker defaults:
          </p>
          <BulletList items={defaultSteps} />

          <p className="mt-6 mb-3 text-[12.5px] sm:text-[13px] font-medium text-gray-800">
            The following information is available on the Stock Exchange website for the
            information of investors:
          </p>
          <BulletList items={defaultInfo} />
        </SectionShell>

        {/* Footer note */}
        <div className="py-8 sm:py-10">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            This Investor Charter is published by AlphaMatrix in compliance with SEBI&rsquo;s
            circular on Investor Charter for Stock Brokers. For grievances, write to{' '}
            <a
              href="mailto:grievances@alphamatrix.in"
              className="text-brand-saffron/80 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors"
            >
              grievances@alphamatrix.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestorCharter;