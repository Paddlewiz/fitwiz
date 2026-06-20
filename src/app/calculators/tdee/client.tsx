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
import { Calculator, TrendingDown, TrendingUp, Scale, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

interface TDEEResult {
  bmr: number;
  tdee: number;
  maintain: number;
  mildLoss: number;
  weightLoss: number;
  extremeLoss: number;
  mildGain: number;
  weightGain: number;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function TDEECalculatorClient() {
  const { t } = useI18n();
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('25');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<TDEEResult | null>(null);

  const convertToKg = (lbs: number): number => lbs * 0.453592;
  const convertToCm = (inches: number): number => inches * 2.54;

  const getActivityLabel = (level: ActivityLevel): string => {
    return `${t(`tdee.activityLevels.${level}`)} - ${t(`tdee.activityLevels.${level}Desc`)}`;
  };

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
      maintain: tdee,
      mildLoss: Math.round(tdee - 250),
      weightLoss: Math.round(tdee - 500),
      extremeLoss: Math.round(tdee - 1000),
      mildGain: Math.round(tdee + 250),
      weightGain: Math.round(tdee + 500),
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('tdee.subtitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Formula Note */}
          <p className="text-sm text-gray-500 text-center">
            {t('tdee.formulaNote')}
          </p>

          {/* Unit System Toggle */}
          <div className="flex gap-4 justify-center">
            <Button
              variant={unitSystem === 'metric' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUnitSystem('metric')}
              className={unitSystem === 'metric' ? 'bg-teal-500 hover:bg-teal-600' : ''}
            >
              {t('common.kg')}/{t('common.cm')}
            </Button>
            <Button
              variant={unitSystem === 'imperial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUnitSystem('imperial')}
              className={unitSystem === 'imperial' ? 'bg-teal-500 hover:bg-teal-600' : ''}
            >
              lb/in
            </Button>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">{t('tdee.gender')}</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('tdee.male')}</SelectItem>
                <SelectItem value="female">{t('tdee.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">{t('tdee.age')}</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t('tdee.agePlaceholder')}
              min="1"
              max="120"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              {t('tdee.weight')} ({unitSystem === 'metric' ? t('common.kg') : 'lbs'})
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={t('tdee.weightPlaceholder')}
              min="1"
              step="0.1"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              {t('tdee.height')} ({unitSystem === 'metric' ? t('common.cm') : 'inches'})
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={t('tdee.heightPlaceholder')}
              min="1"
            />
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activity">{t('tdee.activityLevel')}</Label>
            <Select
              value={activityLevel}
              onValueChange={(v) => setActivityLevel(v as ActivityLevel)}
            >
              <SelectTrigger id="activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(activityMultipliers).map((key) => (
                  <SelectItem key={key} value={key}>
                    {getActivityLabel(key as ActivityLevel)}
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
            {t('tdee.calculate')}
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">{t('tdee.results')}</h3>
              
              {/* BMR */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <p className="text-sm text-gray-600">{t('tdee.bmr')}</p>
                </div>
                <p className="text-3xl font-bold text-teal-600">{result.bmr} {t('common.calories')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('tdee.bmrDesc')}</p>
              </div>

              {/* TDEE */}
              <div className="text-center bg-teal-100 rounded-lg py-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calculator className="w-4 h-4 text-teal-700" />
                  <p className="text-sm text-teal-800">{t('tdee.tdee')}</p>
                </div>
                <p className="text-4xl font-bold text-teal-700">{result.tdee} {t('tdee.caloriesPerDay')}</p>
                <p className="text-xs text-teal-600 mt-1">{t('tdee.tdeeDesc')}</p>
              </div>

              {/* Calorie Goals */}
              <h4 className="text-md font-semibold text-gray-900 text-center mt-4">{t('tdee.calorieGoals')}</h4>
              
              {/* Maintenance */}
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <Scale className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-800 mb-1">{t('tdee.maintain')}</p>
                <p className="text-xl font-bold text-amber-700">{result.maintain} {t('tdee.caloriesPerDay')}</p>
              </div>

              {/* Weight Loss Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-800 mb-1">{t('tdee.mildLoss')}</p>
                  <p className="text-lg font-bold text-green-700">{result.mildLoss}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-800 mb-1">{t('tdee.weightLoss')}</p>
                  <p className="text-lg font-bold text-green-700">{result.weightLoss}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-orange-800 mb-1">{t('tdee.extremeLoss')}</p>
                  <p className="text-lg font-bold text-orange-700">{result.extremeLoss}</p>
                </div>
              </div>

              {/* Weight Gain Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 mb-1">{t('tdee.mildGain')}</p>
                  <p className="text-lg font-bold text-blue-700">{result.mildGain}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 mb-1">{t('tdee.weightGain')}</p>
                  <p className="text-lg font-bold text-blue-700">{result.weightGain}</p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('tdee.tip1')}</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {t('tdee.tip2')}</li>
                  <li>• {t('tdee.tip3')}</li>
                  <li>• {t('tdee.tip4')}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}