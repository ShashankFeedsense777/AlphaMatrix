export const companyDetails = [
  { label: 'CIN Number', value: 'U67120MH2008PTC185004' },
  { label: 'GST Number', value: '27AAFCM6712K1Z9' },
  { label: 'PAN', value: 'AAFCM6712K' },
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
