import type { Metadata } from 'next';
import { MetricsPageClient } from './client';

export const metadata: Metadata = {
  title: 'Body Metrics - FitWiz',
  description: 'Track your body metrics including weight, body fat percentage, BMI, muscle mass, and more with FitWiz.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function MetricsPage() {
  return <MetricsPageClient />;
}