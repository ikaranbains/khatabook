import { JetBrains_Mono, Kodchasan } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const kodchasan = Kodchasan({
  variable: "--font-kodchasan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "KhataBook - Brabar Hisaab | Personal Finance Management",
  description: "Complete financial management for Indian households. Track income, expenses, and budgets with an elegant modern interface. Free personal finance app for money management.",
  keywords: "personal finance, budget tracker, expense manager, finance app, money management, financial planning, khata, hisaab, Indian finance, expense tracking",
  authors: [{ name: "KhataBook Team" }],
  creator: "KhataBook",
  publisher: "KhataBook",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://khatabook.app",
    siteName: "KhataBook",
    title: "KhataBook - Brabar Hisaab | Personal Finance Management",
    description: "Complete financial management for Indian households. Track income, expenses, and budgets with an elegant modern interface.",
    emails: ["support@khatabook.app"],
    images: [
      {
        url: "https://khatabook.app/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KhataBook - Brabar Hisaab",
        type: "image/svg+xml",
      },
      {
        url: "https://khatabook.app/og-image-square.svg",
        width: 800,
        height: 800,
        alt: "KhataBook Logo",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KhataBook - Brabar Hisaab",
    description: "Track your finances with an elegant and modern interface. Free personal finance app for money management.",
    images: ["https://khatabook.app/twitter-image.svg"],
    creator: "@khatabook",
    site: "@khatabook",
  },
  alternates: {
    canonical: "https://khatabook.app",
    languages: {
      "en-IN": "https://khatabook.app/en-IN",
    },
  },
  category: "Finance",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KhataBook",
  },
  appLinks: [
    {
      url: "https://khatabook.app",
      should_fallback: true,
    },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": "https://khatabook.app/#webapp",
      url: "https://khatabook.app",
      name: "KhataBook",
      alternateName: "Brabar Hisaab",
      description: "Complete financial management for Indian households. Track income, expenses, and budgets with an elegant modern interface.",
      applicationCategory: "FinanceApplication",
      applicationSubCategory: "BudgetingApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      operatingSystem: "Web, Android, iOS",
      creator: {
        "@type": "Organization",
        name: "KhataBook",
        url: "https://khatabook.app",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        ratingCount: "100",
        reviewCount: "50",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://khatabook.app/#organization",
      name: "KhataBook",
      alternateName: "Brabar Hisaab",
      url: "https://khatabook.app",
      sameAs: [
        "https://twitter.com/khatabook",
        "https://github.com/khatabook",
      ],
      logo: {
        "@type": "ImageObject",
        "@id": "https://khatabook.app/#logo",
        inLanguage: "en-IN",
        url: "https://khatabook.app/logo.png",
        contentUrl: "https://khatabook.app/logo.png",
        width: 512,
        height: 512,
        caption: "KhataBook",
      },
      image: {
        "@id": "https://khatabook.app/#logo",
      },
      description: "Complete financial management for Indian households.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-XXX-XXX-XXXX",
        contactType: "Customer Support",
        email: "support@khatabook.app",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://khatabook.app/#website",
      url: "https://khatabook.app",
      name: "KhataBook",
      inLanguage: "en-IN",
      description: "Complete financial management for Indian households. Track income, expenses, and budgets.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://khatabook.app/search?q={search_term_string}",
        },
        query_input: "required name=search_term_string",
      },
      isPartOf: {
        "@id": "https://khatabook.app/#organization",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": "https://khatabook.app/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://khatabook.app",
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for address bar */}
        <meta name="theme-color" content="#ff5f34" />
        <meta name="msapplication-TileColor" content="#ff5f34" />

        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${jetbrainsMono.variable} ${kodchasan.variable} antialiased`}
      >
        {children}

        {/* Noscript fallback */}
        <noscript>
          <p>
            This application requires JavaScript to function. Please enable
            JavaScript in your browser.
          </p>
        </noscript>
      </body>
    </html>
  );
}
