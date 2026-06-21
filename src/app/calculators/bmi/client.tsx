'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface BMIResult {
  bmi: number;
  category: string;
  categoryKey: string;
  color: string;
  position: number;
  idealWeightMin: number;
  idealWeightMax: number;
}

const bmiRanges = [
  { min: 0, max: 18.5, labelKey: 'bmi.categories.underweight', color: '#3B82F6' },
  { min: 18.5, max: 25, labelKey: 'bmi.categories.normal', color: '#22C55E' },
  { min: 25, max: 30, labelKey: 'bmi.categories.overweight', color: '#F59E0B' },
  { min: 30, max: 40, labelKey: 'bmi.categories.obese', color: '#EF4444' },
];

export function BMICalculatorClient() {
  const { t } = useI18n();
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<BMIResult | null>(null);

  const convertToKg = (lbs: number): number => lbs * 0.453592;
  const convertToMeters = (inches: number): number => inches * 0.0254;

  const getBMICategory = (bmi: number): { category: string; categoryKey: string; color: string } => {
    if (bmi < 18.5) return { category: t('bmi.categories.underweight'), categoryKey: 'underweight', color: '#3B82F6' };
    if (bmi < 25) return { category: t('bmi.categories.normal'), categoryKey: 'normal', color: '#22C55E' };
    if (bmi < 30) return { category: t('bmi.categories.overweight'), categoryKey: 'overweight', color: '#F59E0B' };
    return { category: t('bmi.categories.obese'), categoryKey: 'obese', color: '#EF4444' };
  };

  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'underweight': return <AlertCircle className="w-5 h-5" />;
      case 'normal': return <CheckCircle className="w-5 h-5" />;
      case 'overweight': return <AlertTriangle className="w-5 h-5" />;
      case 'obese': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const calculatePosition = (bmi: number): number => {
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
      heightM = heightM / 100;
    }

    const bmi = weightKg / (heightM * heightM);
    const { category, categoryKey, color } = getBMICategory(bmi);
    const position = calculatePosition(bmi);

    // Calculate ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = Math.round(18.5 * heightM * heightM);
    const idealWeightMax = Math.round(24.9 * heightM * heightM);

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      categoryKey,
      color,
      position,
      idealWeightMin,
      idealWeightMax,
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('bmi.subtitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Formula Note */}
          <p className="text-sm text-gray-500 text-center">
            {t('bmi.formulaNote')}
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
              磅/英寸
            </Button>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              {t('bmi.weight')} ({unitSystem === 'metric' ? t('common.kg') : '磅'})
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={t('bmi.weightPlaceholder')}
              min="1"
              step="0.1"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              {t('bmi.height')} ({unitSystem === 'metric' ? t('common.cm') : '英寸'})
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={t('bmi.heightPlaceholder')}
              min="1"
            />
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateBMI}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3"
          >
            {t('bmi.calculate')}
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
              {/* BMI Value */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">{t('bmi.yourBMI')}</p>
                <p className="text-4xl font-bold" style={{ color: result.color }}>
                  {result.bmi}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {getCategoryIcon(result.categoryKey)}
                  <p className="text-lg font-semibold" style={{ color: result.color }}>
                    {result.category}
                  </p>
                </div>
              </div>

              {/* Visual Scale */}
              <div className="relative mt-6">
                <p className="text-xs text-gray-500 mb-2 text-center">{t('bmi.bmiScale')}</p>
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
                      {t(range.labelKey)}
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
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(result.categoryKey)}
                  <p className="font-semibold" style={{ color: result.color }}>
                    {t(`bmi.healthAdvice.${result.categoryKey}Title`)}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {t(`bmi.healthAdvice.${result.categoryKey}Desc`)}
                </p>
              </div>

              {/* Ideal Weight Range */}
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <p className="text-sm text-teal-700 mb-1">{t('bmi.idealWeight')}</p>
                <p className="text-lg font-bold text-teal-600">
                  {result.idealWeightMin} - {result.idealWeightMax} {t('common.kg')}
                </p>
                <p className="text-xs text-teal-500 mt-1">
                  {t('bmi.idealWeightDesc')}
                </p>
              </div>

              {/* Note */}
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  {t('bmi.weightNote')}
                </p>
              </div>

              {/* Tips */}
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('bmi.tip1')}</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {t('bmi.tip2')}</li>
                  <li>• {t('bmi.tip3')}</li>
                  <li>• {t('bmi.tip4')}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}