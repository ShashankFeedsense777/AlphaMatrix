import { Helmet } from 'react-helmet-async';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AlphaMatrix',
  alternateName: ['Alpha Matrix', 'AlphaMatrix Securities', 'Alpha Matrix Securities', 'AlphaMatrix Securities Pvt Ltd'],
  url: 'https://alphamatrixsecurities.com/',
  logo: 'https://alphamatrixsecurities.com/favicon.svg',
  description:
    'AlphaMatrix is a next-generation quantitative trading platform combining AI, machine learning, and real-time market intelligence to deliver systematic trading strategies across global markets.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://alphamatrixsecurities.com/',
  },
  sameAs: [
    'https://twitter.com/alphamatrixsecurities',
    'https://linkedin.com/company/alphamatrixsecurities',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AlphaMatrix',
  alternateName: ['Alpha Matrix', 'AlphaMatrix Securities', 'Alpha Matrix Securities'],
  url: 'https://alphamatrixsecurities.com/',
  description:
    'AlphaMatrix is a next-generation quantitative trading platform combining AI, machine learning, and real-time market intelligence to deliver systematic trading strategies across global markets.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://alphamatrixsecurities.com/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function StructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
}
