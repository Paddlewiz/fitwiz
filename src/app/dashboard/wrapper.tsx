'use client';

import dynamic from 'next/dynamic';

// Dynamically import the dashboard client component to avoid SSR issues with Recharts
const DashboardClient = dynamic(
  () => import('./client').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    ),
  }
);

export default function DashboardWrapper() {
  return <DashboardClient />;
}