import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, LineChart, Target, UserPlus, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: 'Free Calculators',
      description: 'TDEE and BMI calculators using scientific formulas. No sign-up required.',
      href: '/calculators/tdee',
    },
    {
      icon: LineChart,
      title: 'Body Tracking',
      description: 'Track weight, body fat %, BMI, and more with beautiful charts and history.',
      href: '/metrics',
    },
    {
      icon: TrendingUp,
      title: 'Progress Dashboard',
      description: 'See your 30-day trends, calorie balance, and progress toward your goals.',
      href: '/dashboard',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set your target weight and track your progress with visual indicators.',
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
            Your Free Health & Weight Loss Companion
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
            Track your body metrics, calculate your calorie needs, and achieve your fitness goals.
            All completely free, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculators/tdee">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-8">
                <Calculator className="w-5 h-5 mr-2" />
                Try TDEE Calculator
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-teal-700 text-white hover:bg-teal-800 font-semibold px-8">
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything You Need for Your Health Journey
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  TDEE Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Calculate your Total Daily Energy Expenditure using the Mifflin-St Jeor formula.
                  Know exactly how many calories you need to maintain, lose, or gain weight.
                </p>
                <Link href="/calculators/tdee">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Calculate Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  BMI Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Check your Body Mass Index with a visual scale showing where you stand.
                  Understand your weight category and get personalized health advice.
                </p>
                <Link href="/calculators/bmi">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Calculate Now
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
          <h2 className="text-3xl font-bold mb-4">Start Your Health Journey Today</h2>
          <p className="text-lg mb-8 opacity-80">
            Sign up for free and get personalized tracking, progress charts, and goal setting.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}