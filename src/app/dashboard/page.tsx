import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - FitWiz',
  description: 'View your health dashboard with weight trends, calorie balance, and progress tracking.',
  robots: {
    index: false,
    follow: true,
  },
};

// Dynamically import the entire client component to avoid SSR issues
const DashboardPageClient = dynamic(
  () => import('./client').then(mod => mod.default),
  { ssr: false, loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">加载中...</div></div> }
);

export default function DashboardPage() {
  return <DashboardPageClient />;
}