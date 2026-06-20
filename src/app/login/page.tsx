import type { Metadata } from 'next';
import { LoginPageClient } from './client';

export const metadata: Metadata = {
  title: '登录 - FitWiz',
  description: '登录 FitWiz，开启您的健康之旅，追踪身体指标，实现健身目标。',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}