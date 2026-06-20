import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';
import { I18nProvider } from '@/lib/i18n-context';
import { OnboardingProvider } from '@/lib/onboarding-context';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';

export const metadata: Metadata = {
  title: {
    default: 'FitWiz - 免费健康管理追踪',
    template: '%s | FitWiz',
  },
  description:
    'FitWiz是一款免费的健康管理追踪应用。计算TDEE、BMI，追踪身体数据，达成您的健康目标。',
  keywords: [
    'FitWiz',
    '健康管理',
    '体重追踪',
    'TDEE计算器',
    'BMI计算器',
    '体脂率',
    '健身追踪',
    '热量追踪',
    '体重管理',
    '健康应用',
    '免费健身工具',
    '基础代谢率',
    '体质指数',
  ],
  authors: [{ name: 'FitWiz Team' }],
  generator: 'FitWiz',
  openGraph: {
    title: 'FitWiz - 免费健康管理追踪',
    description:
      '使用FitWiz追踪您的健康旅程。免费TDEE和BMI计算器，身体数据追踪，个性化建议助您达成健身目标。',
    url: 'https://fitwiz.co',
    siteName: 'FitWiz',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitWiz - 免费健康管理追踪',
    description:
      '使用FitWiz追踪您的健康旅程。免费TDEE和BMI计算器，身体数据追踪，个性化建议。',
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
    <html lang="zh-CN">
      <body className={`antialiased bg-gray-50`}>
        {isDev && <Inspector />}
        <I18nProvider>
          <OnboardingProvider>
            <SupabaseConfigProvider>
              <OnboardingModal />
              {children}
            </SupabaseConfigProvider>
          </OnboardingProvider>
        </I18nProvider>
      </body>
    </html>
  );
}