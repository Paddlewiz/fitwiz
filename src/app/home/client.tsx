'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, LineChart, Target, UserPlus, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export function HomeClient() {
  const { t } = useI18n();

  const features = [
    {
      icon: Calculator,
      title: t('home.feature1Title'),
      description: t('home.feature1Desc'),
      href: '/calculators/tdee',
    },
    {
      icon: LineChart,
      title: t('home.feature2Title'),
      description: t('home.feature2Desc'),
      href: '/metrics',
    },
    {
      icon: TrendingUp,
      title: t('home.feature3Title'),
      description: t('home.feature3Desc'),
      href: '/dashboard',
    },
    {
      icon: Target,
      title: t('home.feature4Title'),
      description: t('home.feature4Desc'),
      href: '/dashboard',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">F</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">FitWiz</h1>
          </div>
          <p className="text-xl md:text-2xl mb-4 opacity-90">
            {t('home.heroTitle')}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculators/tdee">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-8">
                <Calculator className="w-5 h-5 mr-2" />
                {t('home.getStarted')}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-teal-700 text-white hover:bg-teal-800 font-semibold px-8">
                <UserPlus className="w-5 h-5 mr-2" />
                {t('login.createAccount')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('home.featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={feature.href}>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
                      <feature.icon className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('home.calculatorsSection')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t('home.tdeeCardTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  {t('home.tdeeCardDesc')}
                </p>
                <Link href="/calculators/tdee">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    {t('home.tryCalculator')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t('home.bmiCardTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  {t('home.bmiCardDesc')}
                </p>
                <Link href="/calculators/bmi">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    {t('home.tryCalculator')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.heroTitle')}</h2>
          <p className="text-lg mb-8 opacity-80">
            {t('home.dashboardDesc')}
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8">
              {t('login.createAccount')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}