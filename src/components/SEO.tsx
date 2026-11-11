import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://alphamatrixsecurities.com';
const DEFAULT_TITLE = 'AlphaMatrix — Quantitative Trading & AI-Driven Market Intelligence';
const DEFAULT_DESCRIPTION =
  'AlphaMatrix is a next-generation quantitative trading platform combining AI, machine learning, and real-time market intelligence to deliver systematic trading strategies across global markets.';
const DEFAULT_KEYWORDS =
  'AlphaMatrix, Alpha Matrix, AlphaMatrix Securities, Alpha Matrix Securities, quantitative trading, AI trading, algorithmic trading, machine learning trading, market intelligence, automated trading systems, quantitative research, global markets, derivatives trading, quant firm, hedge fund';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl = BASE_URL,
  canonical = BASE_URL,
  noIndex = false,
}: SEOProps) {
  const pageTitle = title ? `${title} | AlphaMatrix` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="application-name" content="AlphaMatrix" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
    </Helmet>
  );
}
