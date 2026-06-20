import type { Metadata } from 'next';
import { TDEECalculatorClient } from './client';

export const metadata: Metadata = {
  title: 'TDEE Calculator - Calculate Your Daily Calorie Needs',
  description:
    'Free TDEE calculator using the Mifflin-St Jeor formula. Calculate your Total Daily Energy Expenditure to plan your weight loss or gain journey accurately.',
  keywords: ['TDEE calculator', 'calorie calculator', 'daily energy expenditure', 'Mifflin-St Jeor', 'weight loss calculator'],
  openGraph: {
    title: 'TDEE Calculator - FitWiz',
    description: 'Calculate your Total Daily Energy Expenditure (TDEE) with our free, accurate calculator.',
  },
};

export default function TDEECalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          TDEE Calculator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate your Total Daily Energy Expenditure (TDEE) using the accurate Mifflin-St Jeor formula.
          Know exactly how many calories you need to maintain, lose, or gain weight.
        </p>
      </div>

      {/* Calculator */}
      <TDEECalculatorClient />

      {/* SEO Content */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is TDEE?</h2>
        <p className="text-gray-600 mb-4">
          TDEE (Total Daily Energy Expenditure) is the total number of calories you burn each day.
          It includes your Basal Metabolic Rate (BMR) plus the calories burned through physical activity and digestion.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Mifflin-St Jeor Formula</h3>
        <p className="text-gray-600 mb-4">
          The Mifflin-St Jeor equation is considered the most accurate formula for calculating BMR. It takes into account
          your weight, height, age, and gender to provide a personalized estimate of your calorie needs.
        </p>
        
        <div className="bg-teal-50 p-4 rounded-lg mb-4">
          <p className="text-teal-800 font-medium">
            For Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
          </p>
          <p className="text-teal-800 font-medium mt-2">
            For Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">Activity Levels</h3>
        <ul className="text-gray-600 space-y-2">
          <li><strong>Sedentary:</strong> Little or no exercise (BMR × 1.2)</li>
          <li><strong>Lightly Active:</strong> Light exercise 1-3 days/week (BMR × 1.375)</li>
          <li><strong>Moderately Active:</strong> Moderate exercise 3-5 days/week (BMR × 1.55)</li>
          <li><strong>Very Active:</strong> Hard exercise 6-7 days/week (BMR × 1.725)</li>
          <li><strong>Extra Active:</strong> Very hard exercise & physical job (BMR × 1.9)</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Use Your TDEE</h2>
        <p className="text-gray-600 mb-4">
          Once you know your TDEE, you can plan your calorie intake to achieve your goals:
        </p>
        <ul className="text-gray-600 space-y-2">
          <li><strong>Maintain Weight:</strong> Eat at your TDEE</li>
          <li><strong>Lose Weight:</strong> Eat 500 calories below TDEE for ~1 lb/week loss</li>
          <li><strong>Gain Weight:</strong> Eat 500 calories above TDEE for ~1 lb/week gain</li>
        </ul>
      </div>
    </div>
  );
}