'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, UtensilsCrossed, Activity, Plus, Save, Footprints, Search, Dumbbell } from 'lucide-react';
import { StepsSync as StepsSyncComponent } from '@/components/steps';
import { FOOD_DATABASE, FoodItem, searchFoods, calculateNutrition } from '@/data/foods';

// ============ 身体数据表单 ============
export interface BodyData {
  weight: number;
  bodyFat?: number;
  bmi?: number;
  bodyAge?: number;
  visceralFat?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercentage?: number;
  bmr?: number; // 基础代谢率
}

export function BodyDataForm({ onSave }: { onSave: (data: BodyData) => void }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<BodyData>({
    weight: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.weight > 0) {
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

          {/* 基础代谢 + 身体年龄（突出显示） */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
            <div>
              <label className="text-xs font-medium text-teal-700 mb-1 block">
                {t('record.bmr') || '基础代谢率'} <span className="text-gray-400">(kcal)</span>
              </label>
              <Input
                type="number"
                step="1"
                placeholder="健康秤测量值"
                value={formData.bmr || ''}
                onChange={(e) => setFormData({ ...formData, bmr: parseFloat(e.target.value) || undefined })}
                className="border-teal-200"
              />
              <p className="text-xs text-gray-400 mt-0.5">部分体脂秤可测代谢值</p>
            </div>
            <div>
              <label className="text-xs font-medium text-teal-700 mb-1 block">
                {t('record.bodyAge') || '身体年龄'} <span className="text-gray-400">(岁)</span>
              </label>
              <Input
                type="number"
                step="1"
                placeholder="健康秤测量值"
                value={formData.bodyAge || ''}
                onChange={(e) => setFormData({ ...formData, bodyAge: parseFloat(e.target.value) || undefined })}
                className="border-teal-200"
              />
              <p className="text-xs text-gray-400 mt-0.5">反映代谢水平的估算年龄</p>
            </div>
          </div>

          {/* 其他可选数据 */}
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

// ============ 饮食记录表单 ============
export interface DietRecord {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number; // 钠盐 mg
  portionSize?: number; // 重量 g
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
    sodium: 0,
    portionSize: 100,
    mealType: 'breakfast',
  });

  // 食物搜索
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // 搜索食物
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFormData({ ...formData, foodName: query });
    if (query.trim().length > 0) {
      const results = searchFoods(query, 8);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // 选择食物
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setShowResults(false);
    // 按当前重量自动计算
    updateNutrition(food, formData.portionSize || 100);
  };

  // 更新营养（根据食物和重量）
  const updateNutrition = (food: FoodItem | null, weight: number) => {
    if (!food || weight <= 0) return;
    const nutrition = calculateNutrition(food, weight);
    setFormData(prev => ({
      ...prev,
      foodName: food.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      sodium: nutrition.sodium,
    }));
  };

  // 重量变化
  const handleWeightChange = (weight: number) => {
    setFormData(prev => ({ ...prev, portionSize: weight }));
    if (selectedFood) {
      updateNutrition(selectedFood, weight);
    }
  };

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
        sodium: 0,
        portionSize: 100,
        mealType: formData.mealType,
      });
      setSearchQuery('');
      setSelectedFood(null);
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

          {/* 食物名称（带搜索） */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t('record.foodName') || '食物名称'} *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索食物，如：鸡胸肉、米饭"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="border-teal-200 focus:border-teal-500 pl-9"
                required
              />
            </div>
            {/* 搜索结果下拉 */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onMouseDown={() => handleSelectFood(food)}
                    className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{food.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{food.category}</span>
                      </div>
                      <span className="text-xs text-gray-500">{food.caloriesPer100g} kcal/100g</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedFood && (
              <p className="text-xs text-teal-600 mt-1">
                ✓ 已匹配「{selectedFood.name}」· 每100g: {selectedFood.caloriesPer100g}kcal | 蛋白{selectedFood.proteinPer100g}g | 钠{selectedFood.sodiumPer100g}mg
              </p>
            )}
          </div>

          {/* 食物重量 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t('record.portionSize') || '食物重量'} <span className="text-gray-400">(g)</span>
            </label>
            <Input
              type="number"
              step="1"
              placeholder="输入重量，如：200"
              value={formData.portionSize || ''}
              onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
              className="border-teal-200"
            />
            <p className="text-xs text-gray-400 mt-0.5">输入实际重量后自动计算营养</p>
          </div>

          {/* 营养数据（自动计算，可手动修改） */}
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
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* 钠盐显示 */}
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('record.sodium') || '钠盐摄入'}</span>
              <span className={`font-medium ${formData.sodium > 800 ? 'text-red-600' : 'text-orange-500'}`}>
                {formData.sodium} mg
              </span>
            </div>
            {formData.sodium > 800 && (
              <p className="text-xs text-red-500 mt-1">⚠ 单次摄入钠盐较高，注意控制</p>
            )}
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

// ============ 运动记录表单 ============
export interface ExerciseRecord {
  exerciseType: string;
  duration: number; // 分钟（按时间模式）
  caloriesBurned: number;
  steps?: number;
  weight?: number; // 负重重量 kg
  sets?: number; // 组数
  reps?: number; // 每组次数
  recordMode?: 'time' | 'quantity';
}

// 运动类型定义
interface ExerciseTypeDef {
  id: string;
  label: string;
  mode: 'time' | 'quantity';
  caloriesPerMin?: number; // 按时间模式的每分钟消耗
  caloriesPerSet?: number; // 按数量模式的每组消耗
  hasWeight?: boolean; // 是否支持负重
}

const EXERCISE_TYPES: ExerciseTypeDef[] = [
  // 有氧运动（按时间）
  { id: 'walking', label: '步行', mode: 'time', caloriesPerMin: 4 },
  { id: 'running', label: '跑步', mode: 'time', caloriesPerMin: 10 },
  { id: 'cycling', label: '骑行', mode: 'time', caloriesPerMin: 7 },
  { id: 'swimming', label: '游泳', mode: 'time', caloriesPerMin: 8 },
  { id: 'yoga', label: '瑜伽', mode: 'time', caloriesPerMin: 3 },
  { id: 'football', label: '足球', mode: 'time', caloriesPerMin: 7 },
  { id: 'basketball', label: '篮球', mode: 'time', caloriesPerMin: 6 },
  { id: 'badminton', label: '羽毛球', mode: 'time', caloriesPerMin: 5 },
  { id: 'table_tennis', label: '乒乓球', mode: 'time', caloriesPerMin: 4 },
  { id: 'hiit', label: 'HIIT高强度间歇', mode: 'time', caloriesPerMin: 13 },
  { id: 'jump_rope', label: '跳绳', mode: 'time', caloriesPerMin: 13 },
  { id: 'elliptical', label: '椭圆机', mode: 'time', caloriesPerMin: 7 },
  { id: 'rowing_machine', label: '划船机', mode: 'time', caloriesPerMin: 8 },
  // 力量训练（按数量）
  { id: 'deadlift', label: '硬拉', mode: 'quantity', caloriesPerSet: 8, hasWeight: true },
  { id: 'squat', label: '深蹲', mode: 'quantity', caloriesPerSet: 7, hasWeight: true },
  { id: 'bench_press', label: '卧推', mode: 'quantity', caloriesPerSet: 6, hasWeight: true },
  { id: 'barbell_row', label: '杠铃划船', mode: 'quantity', caloriesPerSet: 6, hasWeight: true },
  { id: 'shoulder_press', label: '推举', mode: 'quantity', caloriesPerSet: 5, hasWeight: true },
  { id: 'pull_up', label: '引体向上', mode: 'quantity', caloriesPerSet: 8 },
  { id: 'lat_pulldown', label: '高位下拉', mode: 'quantity', caloriesPerSet: 5, hasWeight: true },
  { id: 'leg_press', label: '腿举', mode: 'quantity', caloriesPerSet: 7, hasWeight: true },
  { id: 'bicep_curl', label: '二头弯举', mode: 'quantity', caloriesPerSet: 4, hasWeight: true },
  { id: 'tricep_pushdown', label: '三头下压', mode: 'quantity', caloriesPerSet: 4, hasWeight: true },
  { id: 'plank', label: '平板支撑', mode: 'time', caloriesPerMin: 4 },
  // 通用
  { id: 'gym_other', label: '健身房（其他）', mode: 'time', caloriesPerMin: 6 },
  { id: 'other', label: '其他运动', mode: 'time', caloriesPerMin: 5 },
];

export function ExerciseForm({ onSave }: { onSave: (data: ExerciseRecord) => void }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ExerciseRecord>({
    exerciseType: '',
    duration: 0,
    caloriesBurned: 0,
    recordMode: 'time',
  });
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ExerciseTypeDef | null>(null);

  // 选择运动类型
  const handleTypeChange = (typeId: string) => {
    const selected = EXERCISE_TYPES.find(e => e.id === typeId);
    if (selected) {
      setSelectedTypeId(typeId);
      setSelectedType(selected);
      setFormData({
        ...formData,
        exerciseType: selected.label,
        recordMode: selected.mode,
        duration: 0,
        caloriesBurned: 0,
        weight: selected.hasWeight ? formData.weight : undefined,
        sets: selected.mode === 'quantity' ? 0 : undefined,
        reps: selected.mode === 'quantity' ? 0 : undefined,
      });
    }
  };

  // 计算消耗热量
  const calculateCalories = (): number => {
    if (!selectedType) return 0;
    if (selectedType.mode === 'time') {
      return (selectedType.caloriesPerMin || 5) * (formData.duration || 0);
    } else {
      // 按数量：每组消耗 × 组数
      const baseCalories = (selectedType.caloriesPerSet || 5) * (formData.sets || 0);
      // 如果有负重，加权（负重越高消耗越大，每10kg加5%）
      const weightBonus = formData.weight ? Math.min(formData.weight / 10 * 0.05, 0.5) : 0;
      return Math.round(baseCalories * (1 + weightBonus));
    }
  };

  // 时长变化
  const handleDurationChange = (duration: number) => {
    const selected = EXERCISE_TYPES.find(e => e.label === formData.exerciseType);
    const caloriesPerMin = selected?.caloriesPerMin || 5;
    setFormData({
      ...formData,
      duration,
      caloriesBurned: caloriesPerMin * duration,
    });
  };

  // 组数/次数变化
  const handleSetsChange = (sets: number) => {
    const newFormData = { ...formData, sets };
    const selected = EXERCISE_TYPES.find(e => e.label === formData.exerciseType);
    const baseCalories = (selected?.caloriesPerSet || 5) * sets;
    const weightBonus = formData.weight ? Math.min(formData.weight / 10 * 0.05, 0.5) : 0;
    newFormData.caloriesBurned = Math.round(baseCalories * (1 + weightBonus));
    setFormData(newFormData);
  };

  const handleRepsChange = (reps: number) => {
    setFormData({ ...formData, reps });
  };

  const handleWeightChange = (weight: number) => {
    const newFormData = { ...formData, weight };
    // 重新计算
    const selected = EXERCISE_TYPES.find(e => e.label === formData.exerciseType);
    if (selected?.mode === 'quantity') {
      const baseCalories = (selected.caloriesPerSet || 5) * (formData.sets || 0);
      const weightBonus = weight ? Math.min(weight / 10 * 0.05, 0.5) : 0;
      newFormData.caloriesBurned = Math.round(baseCalories * (1 + weightBonus));
    }
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exerciseType) {
      const isTimeMode = selectedType?.mode === 'time';
      if (isTimeMode && formData.duration > 0) {
        onSave(formData);
        setFormData({ exerciseType: '', duration: 0, caloriesBurned: 0, recordMode: 'time' });
        setSelectedTypeId('');
        setSelectedType(null);
      } else if (!isTimeMode && (formData.sets || 0) > 0) {
        onSave(formData);
        setFormData({ exerciseType: '', duration: 0, caloriesBurned: 0, recordMode: 'quantity' });
        setSelectedTypeId('');
        setSelectedType(null);
      }
    }
  };

  const isTimeMode = selectedType?.mode === 'time';
  const canSubmit = isTimeMode ? formData.duration > 0 : (formData.sets || 0) > 0;

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
            <Select value={selectedTypeId} onValueChange={handleTypeChange}>
              <SelectTrigger className="border-teal-200">
                <SelectValue placeholder={t('record.selectExercise') || '选择运动'} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {/* 有氧运动 */}
                <div className="px-2 py-1 text-xs font-medium text-gray-400">有氧运动</div>
                {EXERCISE_TYPES.filter(e => e.mode === 'time' && !['gym_other', 'other'].includes(e.id)).map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
                {/* 力量训练 */}
                <div className="px-2 py-1 text-xs font-medium text-gray-400 border-t mt-1">力量训练</div>
                {EXERCISE_TYPES.filter(e => e.mode === 'quantity').map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
                {/* 其他 */}
                <div className="px-2 py-1 text-xs font-medium text-gray-400 border-t mt-1">其他</div>
                {EXERCISE_TYPES.filter(e => ['gym_other', 'other'].includes(e.id)).map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 按时间模式 */}
          {isTimeMode && (
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
          )}

          {/* 按数量模式 */}
          {!isTimeMode && selectedType && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">组数</label>
                  <Input
                    type="number"
                    placeholder="如: 4"
                    value={formData.sets || ''}
                    onChange={(e) => handleSetsChange(parseInt(e.target.value) || 0)}
                    className="border-teal-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">每组次数</label>
                  <Input
                    type="number"
                    placeholder="如: 12"
                    value={formData.reps || ''}
                    onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
                    className="border-teal-200"
                  />
                </div>
              </div>
              {/* 负重 */}
              {selectedType.hasWeight && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t('record.weight') || '负重'} <span className="text-gray-400">(kg)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="如: 80"
                    value={formData.weight || ''}
                    onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
                    className="border-teal-200"
                  />
                </div>
              )}
            </>
          )}

          {/* 消耗热量（自动计算） */}
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('record.caloriesBurned') || '消耗热量'}</span>
              <span className="font-medium text-teal-600">{formData.caloriesBurned} kcal</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isTimeMode
                ? (t('record.autoCalculated') || '根据运动类型和时长自动计算')
                : '根据运动类型、组数和负重自动计算'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500"
        disabled={!formData.exerciseType || !canSubmit}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('record.addExercise') || '添加运动记录'}
      </Button>
    </form>
  );
}

// ============ 主数据录入组件（带Tabs）============
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
