import type { Metadata } from 'next';
import DashboardPageClient from './client';

export const metadata: Metadata = {
  title: 'Dashboard - FitWiz',
  description: 'View your health dashboard with weight trends, calorie balance, and progress tracking.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}