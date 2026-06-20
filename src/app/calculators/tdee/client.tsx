'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, TrendingDown, TrendingUp, Scale } from 'lucide-react';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

interface TDEEResult {
  bmr: number;
  tdee: number;
  weightLoss: number;
  weightGain: number;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly Active (1-3 days/week)',
  moderate: 'Moderately Active (3-5 days/week)',
  active: 'Very Active (6-7 days/week)',
  very_active: 'Extra Active (physical job)',
};

export function TDEECalculatorClient() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('25');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<TDEEResult | null>(null);

  const convertToKg = (lbs: number): number => lbs * 0.453592;
  const convertToCm = (inches: number): number => inches * 2.54;

  const calculateTDEE = () => {
    let weightKg = parseFloat(weight);
    let heightCm = parseFloat(height);
    const ageNum = parseInt(age);

    if (unitSystem === 'imperial') {
      weightKg = convertToKg(weightKg);
      heightCm = convertToCm(heightCm);
    }

    // Mifflin-St Jeor Formula
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    const multiplier = activityMultipliers[activityLevel];
    const tdee = Math.round(bmr * multiplier);
    const bmrRounded = Math.round(bmr);

    setResult({
      bmr: bmrRounded,
      tdee: tdee,
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 500),
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculate Your TDEE
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

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="1"
              max="120"
            />
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

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activity">Activity Level</Label>
            <Select
              value={activityLevel}
              onValueChange={(v) => setActivityLevel(v as ActivityLevel)}
            >
              <SelectTrigger id="activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(activityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateTDEE}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3"
          >
            Calculate TDEE
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Basal Metabolic Rate (BMR)</p>
                <p className="text-3xl font-bold text-teal-600">{result.bmr} kcal</p>
              </div>

              <div className="text-center bg-teal-100 rounded-lg py-4">
                <p className="text-sm text-teal-800 mb-1">Total Daily Energy Expenditure (TDEE)</p>
                <p className="text-4xl font-bold text-teal-700">{result.tdee} kcal/day</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <TrendingDown className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 mb-1">Weight Loss (-1 lb/week)</p>
                  <p className="text-xl font-bold text-green-700">{result.weightLoss} kcal</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 mb-1">Weight Gain (+1 lb/week)</p>
                  <p className="text-xl font-bold text-blue-700">{result.weightGain} kcal</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <Scale className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-800 mb-1">Maintenance</p>
                <p className="text-xl font-bold text-amber-700">{result.tdee} kcal</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}