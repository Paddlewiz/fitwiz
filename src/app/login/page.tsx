import type { Metadata } from 'next';
import { LoginPageClient } from './client';

export const metadata: Metadata = {
  title: 'Login - FitWiz',
  description: 'Sign in to FitWiz to track your health journey, body metrics, and achieve your fitness goals.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}