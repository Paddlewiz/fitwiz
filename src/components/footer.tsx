'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">{t('footer.brand')}</span>
            </div>
            <p className="text-gray-600 text-sm">
              {t('footer.tagline')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('footer.aboutDesc')}
            </p>
          </div>

          {/* Calculators */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.calculators')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculators/tdee" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  {t('footer.tdeeCalculator')}
                </Link>
              </li>
              <li>
                <Link href="/calculators/bmi" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  {t('footer.bmiCalculator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.features')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  {t('footer.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/metrics" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  {t('footer.metricsTracking')}
                </Link>
              </li>
              <li className="text-gray-600 text-sm">
                {t('footer.progressTracking')}
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.about')}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('footer.aboutDesc')}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}