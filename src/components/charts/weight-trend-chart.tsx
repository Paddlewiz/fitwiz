'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';

interface WeightDataPoint {
  date: string;
  weight: number;
  displayDate: string;
}

interface WeightTrendChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  currentWeight?: number;
}

// Custom tooltip - defined outside component to avoid recreation on each render
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-teal-600 font-bold text-lg">
          {payload[0].value.toFixed(1)} kg
        </p>
      </div>
    );
  }
  return null;
}

export function WeightTrendChart({ data, targetWeight, currentWeight }: WeightTrendChartProps) {
  const { t } = useI18n();
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  
  // Filter data based on period
  const filteredData = data.slice(-parseInt(period));
  
  // Calculate min/max for Y axis with padding
  const weights = filteredData.map(d => d.weight);
  const minWeight = Math.min(...weights, targetWeight || currentWeight || 0) - 2;
  const maxWeight = Math.max(...weights, targetWeight || currentWeight || 0) + 2;
  
  // Calculate trend (last vs first)
  const firstWeight = filteredData[0]?.weight || 0;
  const lastWeight = filteredData[filteredData.length - 1]?.weight || 0;
  const trend = lastWeight - firstWeight;
  const trendColor = trend < 0 ? 'text-green-500' : trend > 0 ? 'text-red-500' : 'text-gray-500';
  const trendText = trend < 0 
    ? `${t('dashboard.downFromLast')} ${Math.abs(trend).toFixed(1)} kg` 
    : trend > 0 
    ? `${t('dashboard.upFromLast')} ${trend.toFixed(1)} kg`
    : t('common.noChange');
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{t('dashboard.weightTrend')}</h3>
          {filteredData.length > 1 && (
            <p className={`text-sm ${trendColor}`}>{trendText}</p>
          )}
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1">
          {(['7', '30', '90'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              className={`h-8 px-3 ${period === p ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p} {t('dashboard.days')}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      {filteredData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target Line */}
              {targetWeight && (
                <ReferenceLine 
                  y={targetWeight} 
                  stroke="#10B981" 
                  strokeDasharray="5 5"
                  label={{ value: t('dashboard.target'), position: 'right', fill: '#10B981', fontSize: 12 }}
                />
              )}
              
              {/* Area fill */}
              <Area 
                type="monotone" 
                dataKey="weight" 
                fill="url(#weightGradient)" 
                stroke="none"
              />
              
              {/* Line */}
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400">{t('common.noData')}</p>
        </div>
      )}
    </div>
  );
}