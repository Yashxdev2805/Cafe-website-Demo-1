import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "The Artisanal Roast & Co. | Digital QR Menu & Table Ordering",
  description: "Browse single-origin specialty brews, artisan sourdough toasts, and healthy bowls. Order directly to your table via WhatsApp without downloading an app.",
  metadataBase: new URL("https://theartisanalroast.in"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "The Artisanal Roast & Co. | Digital QR Menu",
    description: "Craft Coffee, Sourdough Bakes & Calm Vibes. Instant WhatsApp Table Ordering.",
    url: "https://theartisanalroast.in",
    siteName: "The Artisanal Roast & Co.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "The Artisanal Roast & Co. Cafe Ambiance",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Artisanal Roast & Co. | Digital QR Menu",
    description: "Craft Coffee, Sourdough Bakes & Calm Vibes. Instant WhatsApp Table Ordering.",
    images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  keywords: [
    "specialty coffee",
    "artisan sourdough",
    "QR menu",
    "Indiranagar cafe",
    "Bangalore coffee",
    "digital menu",
    "WhatsApp ordering",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#c27803",
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "The Artisanal Roast & Co.",
  "image": [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24"
  ],
  "url": "https://theartisanalroast.in",
  "telephone": "+919876543210",
  "priceRange": "₹₹",
  "servesCuisine": [
    "Specialty Coffee",
    "Artisan Bakery",
    "Continental",
    "Healthy Bowls"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "42, 100ft Road, Indiranagar",
    "addressLocality": "Bengaluru",
    "addressRegion": "Karnataka",
    "postalCode": "560038",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 12.9716,
    "longitude": 77.6412
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "08:00",
      "closes": "23:00"
    }
  ],
  "hasMenu": {
    "@type": "Menu",
    "name": "The Artisanal Roast Digital QR Menu",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Specialty Coffee",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Melbourne Flat White",
            "description": "Double ristretto shot with velvety micro-foam milk and subtle cocoa notes.",
            "offers": {
              "@type": "Offer",
              "price": "240",
              "priceCurrency": "INR"
            },
            "suitableForDiet": "https://schema.org/VegetarianDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Spanish Iced Latte",
            "description": "Slow-dripped espresso blended with condensed milk over crystal clear ice.",
            "offers": {
              "@type": "Offer",
              "price": "270",
              "priceCurrency": "INR"
            },
            "suitableForDiet": "https://schema.org/VegetarianDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Pour Over V60 Single Origin",
            "description": "Light roast Chikmagalur beans with floral jasmine and stone fruit aroma.",
            "offers": {
              "@type": "Offer",
              "price": "280",
              "priceCurrency": "INR"
            },
            "suitableForDiet": "https://schema.org/VeganDiet"
          }
        ]
      },
      {
        "@type": "MenuSection",
        "name": "Sourdough & Artisanal Bakes",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Truffle Scrambled Egg Toast",
            "description": "Creamy pasture-raised eggs on grilled country sourdough with white truffle oil.",
            "offers": {
              "@type": "Offer",
              "price": "340",
              "priceCurrency": "INR"
            }
          },
          {
            "@type": "MenuItem",
            "name": "Wild Mushroom Melt",
            "description": "Sauteed shiitake and button mushrooms with smoked cheddar on seeded loaf.",
            "offers": {
              "@type": "Offer",
              "price": "320",
              "priceCurrency": "INR"
            },
            "suitableForDiet": "https://schema.org/VegetarianDiet"
          }
        ]
      }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
