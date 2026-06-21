'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Footprints, Plus } from 'lucide-react';

interface StepsSyncProps {
  onSave?: (steps: number, calories: number) => Promise<void> | void;
  initialSteps?: number;
}

export function StepsSync({ onSave, initialSteps = 0 }: StepsSyncProps) {
  const [steps, setSteps] = useState(initialSteps);

  // Calculate calories from steps (approx 0.04 kcal per step)
  const calculateCalories = useCallback((stepCount: number) => {
    return Math.round(stepCount * 0.04);
  }, []);

  // Handle steps change (only updates display state, does NOT auto-save)
  const handleStepsChange = useCallback((newSteps: number) => {
    setSteps(newSteps);
  }, []);

  // Manual input handler
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    handleStepsChange(Math.max(0, value));
  };

  const calories = calculateCalories(steps);

  return (
    <Card className="bg-white shadow-md border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Footprints className="w-5 h-5 text-teal-500" />
          今日步数
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steps display/input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">步数</Label>
            <Input
              type="number"
              value={steps || ''}
              onChange={handleManualInput}
              placeholder="输入步数"
              min={0}
              className="text-2xl font-semibold h-12"
            />
          </div>
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">消耗热量</Label>
            <div className="text-2xl font-semibold text-teal-500 py-3 border-b border-gray-200">
              {calories} kcal
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => onSave?.(steps, calories)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
            disabled={steps <= 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            保存步数记录
          </Button>
        </div>

        {/* Future integration hint */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          后续将支持 Apple Health / Google Fit 自动同步
        </div>
      </CardContent>
    </Card>
  );
}
