'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, UtensilsCrossed, Activity, Plus, Save, Footprints } from 'lucide-react';
import { StepsSync as StepsSyncComponent } from '@/components/steps';

interface BodyDataFormProps {
  onSave: (data: BodyData) => void;
}

export interface BodyData {
  weight: number;
  bodyFat?: number;
  bmi?: number;
  bodyAge?: number;
  visceralFat?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercentage?: number;
}

export function BodyDataForm({ onSave }: BodyDataFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<BodyData>({
    weight: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.weight > 0) {
      // 自动计算BMI（如果有身高数据）
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-500" />
            {t('record.bodyData') || '身体数据'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 必填：体重 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t('record.weight')} * <span className="text-gray-400">(kg)</span>
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="例如: 65.5"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="border-teal-200 focus:border-teal-500"
              required
            />
          </div>

          {/* 可选数据 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.bodyFat')} <span className="text-gray-400">(%)</span>
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="可选"
                value={formData.bodyFat || ''}
                onChange={(e) => setFormData({ ...formData, bodyFat: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.muscleMass')} <span className="text-gray-400">(kg)</span>
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="可选"
                value={formData.muscleMass || ''}
                onChange={(e) => setFormData({ ...formData, muscleMass: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.waterPercentage')} <span className="text-gray-400">(%)</span>
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="可选"
                value={formData.waterPercentage || ''}
                onChange={(e) => setFormData({ ...formData, waterPercentage: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.visceralFat')} <span className="text-gray-400">等级</span>
              </label>
              <Input
                type="number"
                step="1"
                placeholder="可选"
                value={formData.visceralFat || ''}
                onChange={(e) => setFormData({ ...formData, visceralFat: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        disabled={formData.weight <= 0}
      >
        <Save className="w-4 h-4 mr-2" />
        {t('record.saveBodyData') || '保存身体数据'}
      </Button>
    </form>
  );
}

export interface DietRecord {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function DietForm({ onSave }: { onSave: (data: DietRecord) => void }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<DietRecord>({
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: 'breakfast',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.foodName && formData.calories > 0) {
      onSave(formData);
      // 重置表单
      setFormData({
        foodName: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealType: 'breakfast',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-teal-500" />
            {t('record.dietRecord') || '饮食记录'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 餐次选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t('record.mealType') || '餐次'}
            </label>
            <Select
              value={formData.mealType}
              onValueChange={(value) => setFormData({ ...formData, mealType: value as DietRecord['mealType'] })}
            >
              <SelectTrigger className="border-teal-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t('record.breakfast') || '早餐'}</SelectItem>
                <SelectItem value="lunch">{t('record.lunch') || '午餐'}</SelectItem>
                <SelectItem value="dinner">{t('record.dinner') || '晚餐'}</SelectItem>
                <SelectItem value="snack">{t('record.snack') || '加餐'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 食物名称 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t('record.foodName') || '食物名称'} *
            </label>
            <Input
              placeholder="例如: 牛奶燕麦"
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              className="border-teal-200 focus:border-teal-500"
              required
            />
          </div>

          {/* 营养数据 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('record.calories')} * <span className="text-gray-400">(kcal)</span>
              </label>
              <Input
                type="number"
                placeholder="热量"
                value={formData.calories || ''}
                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                className="border-teal-200"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.protein')} <span className="text-gray-400">(g)</span>
              </label>
              <Input
                type="number"
                placeholder="蛋白质"
                value={formData.protein || ''}
                onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.carbs')} <span className="text-gray-400">(g)</span>
              </label>
              <Input
                type="number"
                placeholder="碳水"
                value={formData.carbs || ''}
                onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t('record.fat')} <span className="text-gray-400">(g)</span>
              </label>
              <Input
                type="number"
                placeholder="脂肪"
                value={formData.fat || ''}
                onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500"
        disabled={!formData.foodName || formData.calories <= 0}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('record.addDiet') || '添加饮食记录'}
      </Button>
    </form>
  );
}

export interface ExerciseRecord {
  exerciseType: string;
  duration: number; // 分钟
  caloriesBurned: number;
  steps?: number; // 可选，步数
}

export function ExerciseForm({ onSave }: { onSave: (data: ExerciseRecord) => void }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ExerciseRecord>({
    exerciseType: '',
    duration: 0,
    caloriesBurned: 0,
  });

  // 常见运动类型
  const exerciseTypes = [
    { id: 'walking', label: t('record.walking') || '步行', caloriesPerMin: 4 },
    { id: 'running', label: t('record.running') || '跑步', caloriesPerMin: 10 },
    { id: 'swimming', label: t('record.swimming') || '游泳', caloriesPerMin: 8 },
    { id: 'cycling', label: t('record.cycling') || '骑行', caloriesPerMin: 6 },
    { id: 'yoga', label: t('record.yoga') || '瑜伽', caloriesPerMin: 3 },
    { id: 'gym', label: t('record.gym') || '健身房', caloriesPerMin: 7 },
    { id: 'other', label: t('record.otherExercise') || '其他', caloriesPerMin: 5 },
  ];

  // 自动计算消耗热量
  const handleTypeChange = (type: string) => {
    const selected = exerciseTypes.find(e => e.id === type);
    if (selected) {
      const estimated = selected.caloriesPerMin * formData.duration;
      setFormData({
        ...formData,
        exerciseType: selected.label,
        caloriesBurned: estimated,
      });
    }
  };

  const handleDurationChange = (duration: number) => {
    const selected = exerciseTypes.find(e => e.label === formData.exerciseType);
    const caloriesPerMin = selected?.caloriesPerMin || 5;
    setFormData({
      ...formData,
      duration,
      caloriesBurned: caloriesPerMin * duration,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exerciseType && formData.duration > 0) {
      onSave(formData);
      setFormData({ exerciseType: '', duration: 0, caloriesBurned: 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            {t('record.exerciseRecord') || '运动记录'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 运动类型 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t('record.exerciseType') || '运动类型'}
            </label>
            <Select onValueChange={handleTypeChange}>
              <SelectTrigger className="border-teal-200">
                <SelectValue placeholder={t('record.selectExercise') || '选择运动'} />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时长 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t('record.duration') || '时长'} <span className="text-gray-400">(分钟)</span>
            </label>
            <Input
              type="number"
              placeholder="例如: 30"
              value={formData.duration || ''}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
              className="border-teal-200"
            />
          </div>

          {/* 消耗热量（自动计算） */}
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('record.caloriesBurned') || '消耗热量'}</span>
              <span className="font-medium text-teal-600">{formData.caloriesBurned} kcal</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t('record.autoCalculated') || '根据运动类型和时长自动计算'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500"
        disabled={!formData.exerciseType || formData.duration <= 0}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('record.addExercise') || '添加运动记录'}
      </Button>
    </form>
  );
}

// 主数据录入组件（带Tabs）
export interface UnifiedRecordFormProps {
  onSaveBodyData: (data: BodyData) => Promise<void>;
  onSaveDietRecord: (data: DietRecord) => Promise<void>;
  onSaveExerciseRecord: (data: ExerciseRecord) => Promise<void>;
  onSaveSteps?: (steps: number, calories: number) => Promise<void>;
  isSaving?: boolean;
  height?: number;
}

export function UnifiedRecordForm({
  onSaveBodyData,
  onSaveDietRecord,
  onSaveExerciseRecord,
  onSaveSteps,
  isSaving,
  height,
}: UnifiedRecordFormProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('body');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4 bg-teal-50/50">
        <TabsTrigger value="body" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
          <Scale className="w-4 h-4 mr-1.5" />
          {t('record.tabBody') || '身体'}
        </TabsTrigger>
        <TabsTrigger value="diet" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
          <UtensilsCrossed className="w-4 h-4 mr-1.5" />
          {t('record.tabDiet') || '饮食'}
        </TabsTrigger>
        <TabsTrigger value="exercise" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
          <Activity className="w-4 h-4 mr-1.5" />
          {t('record.tabExercise') || '运动'}
        </TabsTrigger>
        <TabsTrigger value="steps" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
          <Footprints className="w-4 h-4 mr-1.5" />
          {t('record.tabSteps') || '步数'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="body">
        <BodyDataForm onSave={onSaveBodyData} />
      </TabsContent>
      <TabsContent value="diet">
        <DietForm onSave={onSaveDietRecord} />
      </TabsContent>
      <TabsContent value="exercise">
        <ExerciseForm onSave={onSaveExerciseRecord} />
      </TabsContent>
      <TabsContent value="steps">
        <StepsSyncComponent onSave={onSaveSteps} />
      </TabsContent>
    </Tabs>
  );
}