'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  position: number; // percentage position on scale (0-100)
}

const bmiRanges = [
  { min: 0, max: 18.5, label: 'Underweight', color: '#3B82F6' }, // blue
  { min: 18.5, max: 25, label: 'Normal', color: '#22C55E' }, // green
  { min: 25, max: 30, label: 'Overweight', color: '#F59E0B' }, // amber
  { min: 30, max: 40, label: 'Obese', color: '#EF4444' }, // red
];

export function BMICalculatorClient() {
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<BMIResult | null>(null);

  const convertToKg = (lbs: number): number => lbs * 0.453592;
  const convertToMeters = (inches: number): number => inches * 0.0254;

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6' };
    if (bmi < 25) return { category: 'Normal Weight', color: '#22C55E' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B' };
    return { category: 'Obese', color: '#EF4444' };
  };

  const calculatePosition = (bmi: number): number => {
    // Scale from BMI 15 to 40 (25 range)
    // Position = ((bmi - 15) / 25) * 100, clamped to 0-100
    const position = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
    return position;
  };

  const calculateBMI = () => {
    let weightKg = parseFloat(weight);
    let heightM = parseFloat(height);

    if (unitSystem === 'imperial') {
      weightKg = convertToKg(weightKg);
      heightM = convertToMeters(heightM);
    } else {
      heightM = heightM / 100; // convert cm to meters
    }

    const bmi = weightKg / (heightM * heightM);
    const { category, color } = getBMICategory(bmi);
    const position = calculatePosition(bmi);

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      color,
      position,
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculate Your BMI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Unit System Toggle */}
          <div className="flex gap-4">
            <Button
              variant={unitSystem === 'metric' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUnitSystem('metric')}
              className={unitSystem === 'metric' ? 'bg-teal-500 hover:bg-teal-600' : ''}
            >
              Metric (kg/cm)
            </Button>
            <Button
              variant={unitSystem === 'imperial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUnitSystem('imperial')}
              className={unitSystem === 'imperial' ? 'bg-teal-500 hover:bg-teal-600' : ''}
            >
              Imperial (lb/in)
            </Button>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unitSystem === 'metric' ? '70' : '150'}
              min="1"
              step="0.1"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unitSystem === 'metric' ? '175' : '70'}
              min="1"
            />
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateBMI}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3"
          >
            Calculate BMI
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
              {/* BMI Value */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Your BMI</p>
                <p className="text-4xl font-bold" style={{ color: result.color }}>
                  {result.bmi}
                </p>
                <p className="text-lg font-semibold mt-2" style={{ color: result.color }}>
                  {result.category}
                </p>
              </div>

              {/* Visual Scale */}
              <div className="relative mt-6">
                {/* Scale Bar */}
                <div className="h-8 rounded-full overflow-hidden flex">
                  {bmiRanges.map((range, index) => (
                    <div
                      key={index}
                      className="h-full flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        backgroundColor: range.color,
                        width: `${((range.max - range.min) / 25) * 100}%`,
                      }}
                    >
                      {range.label}
                    </div>
                  ))}
                </div>

                {/* Marker */}
                <div
                  className="absolute top-0 h-8 w-1 bg-gray-900 rounded shadow-lg"
                  style={{
                    left: `${result.position}%`,
                    transform: 'translateX(-50%)',
                  }}
                />

                {/* Scale Labels */}
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              {/* Health Advice */}
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${result.color}15` }}>
                <p className="font-medium" style={{ color: result.color }}>
                  {result.category === 'Underweight' &&
                    'Consider consulting a healthcare provider about healthy weight gain strategies.'}
                  {result.category === 'Normal Weight' &&
                    'Great! You are at a healthy weight. Maintain your current lifestyle.'}
                  {result.category === 'Overweight' &&
                    'Consider lifestyle changes like balanced diet and regular exercise to reach a healthy weight.'}
                  {result.category === 'Obese' &&
                    'Consult a healthcare provider for personalized advice on weight management.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}