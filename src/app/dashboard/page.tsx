import type { Metadata } from 'next';
import DashboardWrapper from './wrapper';

export const metadata: Metadata = {
  title: '仪表盘 - FitWiz',
  description: '查看您的健康数据概览、体重趋势图表、热量平衡和目标进度。',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return <DashboardWrapper />;
}