'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ isLoggedIn = false, userName, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, toggleLanguage } = useI18n();

  // Complete navigation links - always visible on all pages
  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/calculators/tdee', label: t('nav.tdeeCalculator') },
    { href: '/calculators/bmi', label: t('nav.bmiCalculator') },
    { href: '/dashboard', label: t('nav.dashboard') },
  ];

  // Additional auth-related links
  const authLinks = isLoggedIn
    ? [{ href: '/metrics', label: t('nav.metrics') }]
    : [{ href: '/login', label: t('nav.login') }];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Click to return home */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-semibold text-xl text-gray-900">FitWiz</span>
        </Link>

        {/* Desktop Navigation - Complete menu always visible */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-teal-600 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-teal-600 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section: Language Switch + User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switch Button - More visible with icon + text */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all text-sm font-medium shadow-sm hover:shadow"
            title={language === 'zh-CN' ? '切换到英文' : 'Switch to Chinese'}
          >
            <Globe className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700 font-semibold">
              {language === 'zh-CN' ? '中文' : 'EN'}
            </span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                {t('login.createAccount')}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden bg-white border-b border-gray-100',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-3">
          {/* Language Switch in Mobile - More visible */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 py-3 px-4 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-semibold w-full"
          >
            <Globe className="w-5 h-5 text-teal-600" />
            <span>
              {language === 'zh-CN' ? '🌐 中文 (点击切换英文)' : '🌐 EN (点击切换中文)'}
            </span>
          </button>

          {/* All navigation links in mobile menu */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-600 hover:text-teal-600 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-600 hover:text-teal-600 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout?.();
              }}
              className="block py-2 text-red-600 hover:text-red-700 transition-colors font-medium w-full text-left"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              {t('nav.logout')}
            </button>
          )}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="block py-2 text-teal-600 hover:text-teal-700 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('login.createAccount')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}