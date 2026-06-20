import Link from 'next/link';

export function Footer() {
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
              <span className="font-semibold text-xl text-gray-900">FitWiz</span>
            </div>
            <p className="text-gray-600 text-sm">
              Your free health and weight loss tracking companion. Track your progress, achieve your goals.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Free Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculators/tdee" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  TDEE Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/bmi" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  BMI Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/metrics" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">
                  Body Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">Privacy Policy</li>
              <li className="text-gray-600 text-sm">Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>© 2024 FitWiz. Free health tracking for everyone.</p>
        </div>
      </div>
    </footer>
  );
}