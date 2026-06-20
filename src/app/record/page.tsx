import { Metadata } from 'next';
import { RecordPageClient } from './client';

export const metadata: Metadata = {
  title: '记录数据 - FitWiz',
  description: '记录您的身体数据、饮食和运动信息',
};

export default function RecordPage() {
  return <RecordPageClient />;
}