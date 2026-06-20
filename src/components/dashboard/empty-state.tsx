'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useRouter } from 'next/navigation';
import { Scale, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  type: 'no-weight' | 'no-calorie' | 'no-goal' | 'welcome';
  onRecordClick?: () => void;
  onGoalClick?: () => void;
}

export function EmptyState({ type, onRecordClick, onGoalClick }: EmptyStateProps) {
  const { t } = useI18n();
  const router = useRouter();
  
  const handleRecordWeight = () => {
    if (onRecordClick) {
      onRecordClick();
    } else {
      router.push('/metrics');
    }
  };
  
  const handleSetGoal = () => {
    if (onGoalClick) {
      onGoalClick();
    } else {
      router.push('/dashboard');
    }
  };
  
  if (type === 'welcome') {
    return (
      <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-100">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t('emptyState.welcomeTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('emptyState.welcomeDesc')}
          </p>
          <Button 
            onClick={handleRecordWeight}
            className="bg-teal-500 hover:bg-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('emptyState.startRecording')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (type === 'no-weight') {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('emptyState.noWeightTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('emptyState.noWeightDesc')}
          </p>
          <Button 
            onClick={handleRecordWeight}
            className="bg-teal-500 hover:bg-teal-600"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {t('emptyState.recordFirstWeight')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (type === 'no-calorie') {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {t('emptyState.noCalorieDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (type === 'no-goal') {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            {t('emptyState.noGoalDesc')}
          </p>
          <Button 
            onClick={handleSetGoal}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {t('emptyState.setGoal')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}