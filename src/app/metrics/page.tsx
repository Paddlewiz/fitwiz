import type { Metadata } from 'next';
import { MetricsPageClient } from './client';

export const metadata: Metadata = {
  title: '身体数据记录 - FitWiz',
  description: '记录和追踪您的身体数据，包括体重、体脂率、BMI、肌肉量等指标。',
  robots: {
    index: false,
    follow: true,
  },
};

export default function MetricsPage() {
  return <MetricsPageClient />;
}