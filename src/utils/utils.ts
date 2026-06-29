export const companyDetails = [
  { label: 'CIN Number', value: 'U67120MH2008PTC185004' },
  { label: 'GST Number', value: '27AAFCM6712K1Z9' },
  { label: 'NSE Membership', value: '90415' },
  { label: 'BSE Membership', value: '6879' },
  { label: 'SEBI Registration', value: 'INZ000318637' },
];

export const regulatoryLinks = [
  { label: 'SEBI', href: 'https://www.sebi.gov.in' },
  { label: 'NSE', href: 'https://www.nseindia.com' },
  { label: 'BSE', href: 'https://www.bseindia.com' },
  { label: 'SEBI SCORES', href: 'https://scores.sebi.gov.in' },
];


export const IMPORTANT_LINKS = [
  { label: 'Advisory for Investors', href: 'https://www.sebi.gov.in/sebi_data/commondocs/aug-2021/InvestorAdvisory_p.pdf' },
  { label: 'SCORES', href: 'https://scores.sebi.gov.in' },
  { label: 'NSE Circulars', href: 'https://www.nseindia.com/resources/exchange-communication-circulars' },
  { label: 'BSE Circulars', href: 'https://www.bseindia.com/static/about/circular.aspx' },
  { label: 'CDSL Circulars', href: 'https://www.cdslindia.com/Publications/circulars.aspx' },
  { label: "CDSL's e-Voting Facility", href: 'https://evoting.cdslindia.com/Evoting/EvotingLogin' },
  { label: 'ODR Portal', href: 'https://smartodr.in' },
];

// NEW: 3-level escalation matrix data
export const escalationLevels = [
  {
    level: '01',
    title: 'Broker',
    subtitle: 'AlphaMatrix',
    description:
      'Raise your complaint directly with us via email or our Compliance Officer. We aim to resolve all grievances within the SEBI-prescribed timeline.',
    linkLabel: 'grievances@alphamatrix.in',
    href: 'mailto:grievances@alphamatrix.in',
  },
  {
    level: '02',
    title: 'Exchange',
    subtitle: 'NSE / BSE',
    description:
      'If unresolved at the broker level, escalate to the Investor Grievance Redressal Cell of NSE or BSE, the exchanges AlphaMatrix is a member of.',
    linkLabel: 'Exchange Investor Services',
    href: 'https://www.nseindia.com',
  },
  {
    level: '03',
    title: 'SCORES / SEBI',
    subtitle: 'Regulator',
    description:
      'If still unresolved, file your complaint directly with SEBI through the SCORES portal, or pursue resolution via the SEBI ODR platform.',
    linkLabel: 'scores.sebi.gov.in',
    href: 'https://scores.sebi.gov.in',
  },
];


export const attentionInvestorPoints: string[] = [
  'Stock Brokers can accept securities as margin from clients only by way of pledge in the depository system w.e.f. September 1, 2020.',
  'Update your mobile number & email Id with your stock broker/depository participant and receive OTP directly from depository on your email id and/or mobile number to create pledge.',
  'Investors may please refer to the Exchange\u2019s Frequently Asked Questions (FAQs) issued vide circular reference NSE/INSP/45191 dated July 31, 2020 and NSE/INSP/45534 dated August 31, 2020 and other guidelines issued from time to time in this regard.',
  'Check your Securities /MF/ Bonds in the consolidated account statement issued by NSDL/CDSL every month.',
];

export const attentionInvestorQuotes: string[] = [
  'Prevent un-authorized transactions in your account. Update your mobile numbers/email ids with your stock brokers and depository participants. Receive information of your transactions directly from the exchange or depository on your mobile/email at the end of the day. Issued in the interest of investors.',
  'KYC is one-time exercise while dealing in securities markets \u2013 once KYC is done through a SEBI registered intermediary (broker, DP, mutual fund, etc.), you need not undergo the same process again when you approach another intermediary.',
  'No need to issue cheques by investors while subscribing to IPO. Just write the bank account number and sign in the application form to authorise your bank to make payment in case of allotment. No worries for refund as the money remains in the investor\u2019s account.',
];