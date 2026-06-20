import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';

export const metadata: Metadata = {
  title: {
    default: 'FitWiz - Free Health & Weight Loss Tracker',
    template: '%s | FitWiz',
  },
  description:
    'FitWiz is a free web-based health and weight loss tracking app. Calculate your TDEE, BMI, track body metrics, and achieve your fitness goals with our easy-to-use tools.',
  keywords: [
    'FitWiz',
    'health tracker',
    'weight loss',
    'TDEE calculator',
    'BMI calculator',
    'body metrics',
    'fitness tracking',
    'calorie tracking',
    'weight tracking',
    'health app',
    'free fitness tools',
  ],
  authors: [{ name: 'FitWiz Team' }],
  generator: 'FitWiz',
  openGraph: {
    title: 'FitWiz - Free Health & Weight Loss Tracker',
    description:
      'Track your health journey with FitWiz. Free TDEE & BMI calculators, body metrics tracking, and personalized insights to help you achieve your fitness goals.',
    url: 'https://fitwiz.co',
    siteName: 'FitWiz',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitWiz - Free Health & Weight Loss Tracker',
    description:
      'Track your health journey with FitWiz. Free TDEE & BMI calculators, body metrics tracking, and personalized insights.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased bg-gray-50`}>
        {isDev && <Inspector />}
        <SupabaseConfigProvider>
          {children}
        </SupabaseConfigProvider>
      </body>
    </html>
  );
}