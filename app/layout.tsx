import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }     from '@/contexts/AuthContext';
import { CartProvider }     from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReduxProvider }    from '@/components/providers/ReduxProvider';
import PublicLayout from '@/components/layout/PublicLayout';
import './globals.css';
// Fonts are loaded via @import in globals.css and defined as CSS variables
// (--font-inter, --font-playfair, --font-dm-sans) — no next/font needed.

/* ─── Metadata ───────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default:  'Bangui est Doux – Le meilleur de Bangui',
    template: '%s | Bangui est Doux',
  },
  description:
    'Découvrez le meilleur de Bangui : événements, restaurants, nightlife, culture et lifestyle en République Centrafricaine.',
  keywords: [
    'Bangui', 'RCA', 'République Centrafricaine', 'événements Bangui',
    'restaurants Bangui', 'nightlife Bangui', 'culture africaine', 'lifestyle',
    'Bangui est Doux',
  ],
  authors: [{ name: 'Bangui est Doux', url: 'https://banguiestdoux.com' }],
  creator: 'Bangui est Doux',
  metadataBase: new URL('https://banguiestdoux.com'),
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    siteName:    'Bangui est Doux',
    title:       'Bangui est Doux – Le meilleur de Bangui',
    description: 'Événements, restaurants, nightlife et culture à Bangui, RCA.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Bangui est Doux',
    description: 'Le meilleur de Bangui',
    images:      ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon:  [{ url: '/favicon.ico' }, { url: '/icon-192.png', sizes: '192x192' }],
    apple: [{ url: '/apple-icon.png' }],
  },
};

export const viewport: Viewport = {
  themeColor:    '#16A34A',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,
};

/* ─── Root Layout ────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className=""
    >
      <body className="bg-white dark:bg-night text-night dark:text-beige antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReduxProvider>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <PublicLayout>
                    {children}
                  </PublicLayout>

                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#141414',
                        color:      '#F5F0E8',
                        border:     '1px solid rgba(201,168,76,0.3)',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-inter)',
                        fontSize:   '14px',
                      },
                      success: { iconTheme: { primary: '#16a34a', secondary: '#FFFFFF' } },
                      error:   { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
                    }}
                  />
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
