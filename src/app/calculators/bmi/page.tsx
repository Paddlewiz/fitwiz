import type { Metadata } from 'next';
import { BMICalculatorClient } from './client';

export const metadata: Metadata = {
  title: 'BMI Calculator - Check Your Body Mass Index',
  description:
    'Free BMI calculator with visual scale. Calculate your Body Mass Index and understand your weight category. Track your health journey with FitWiz.',
  keywords: ['BMI calculator', 'body mass index', 'weight calculator', 'health check', 'BMI scale'],
  openGraph: {
    title: 'BMI Calculator - FitWiz',
    description: 'Calculate your Body Mass Index (BMI) with our free calculator featuring a visual scale.',
  },
};

export default function BMICalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          BMI Calculator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate your Body Mass Index (BMI) and see where you stand on the health scale.
          BMI is a useful indicator of whether you're at a healthy weight for your height.
        </p>
      </div>

      {/* Calculator */}
      <BMICalculatorClient />

      {/* SEO Content */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is BMI?</h2>
        <p className="text-gray-600 mb-4">
          Body Mass Index (BMI) is a simple calculation using a person's height and weight.
          The formula is BMI = kg/m² where kg is a person's weight in kilograms and m² is
          their height in meters squared.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">BMI Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 font-semibold">Underweight</p>
            <p className="text-blue-600">BMI below 18.5</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700 font-semibold">Normal Weight</p>
            <p className="text-green-600">BMI 18.5 - 24.9</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 font-semibold">Overweight</p>
            <p className="text-amber-600">BMI 25 - 29.9</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">Obese</p>
            <p className="text-red-600">BMI 30 and above</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">BMI Limitations</h3>
        <p className="text-gray-600 mb-4">
          While BMI is a useful screening tool, it has some limitations:
        </p>
        <ul className="text-gray-600 space-y-2">
          <li>• It doesn't distinguish between muscle and fat mass</li>
          <li>• Athletes may have high BMI due to muscle mass, not fat</li>
          <li>• It may not accurately reflect health in older adults</li>
          <li>• It doesn't account for body fat distribution</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">BMI Formula</h2>
        <div className="bg-teal-50 p-4 rounded-lg">
          <p className="text-teal-800 font-medium">
            BMI = weight (kg) / height² (m²)
          </p>
          <p className="text-teal-700 mt-2">
            Example: A person weighing 70 kg with a height of 1.75 m has a BMI of 22.9
          </p>
        </div>
      </div>
    </div>
  );
}