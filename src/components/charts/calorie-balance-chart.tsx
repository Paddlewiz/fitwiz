'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useI18n } from '@/lib/i18n-context';

interface CalorieDataPoint {
  date: string;
  displayDate: string;
  intake: number;
  target: number;
  balance: number; // negative = deficit (good), positive = surplus (bad)
}

interface CalorieBalanceChartProps {
  data: CalorieDataPoint[];
}

// Custom tooltip - defined outside component
function CalorieTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: CalorieDataPoint }>; label?: string }) {
  const { t } = useI18n();
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const isSurplus = dataPoint.balance > 0;
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
        <p className="text-gray-600 text-sm">{label}</p>
        <div className="flex gap-4 mt-1">
          <div>
            <p className="text-xs text-gray-500">{t('dashboard.intake')}</p>
            <p className="font-medium">{dataPoint.intake} kcal</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('dashboard.target')}</p>
            <p className="font-medium">{dataPoint.target} kcal</p>
          </div>
        </div>
        <p className={`mt-2 font-medium ${isSurplus ? 'text-red-500' : 'text-green-500'}`}>
          {isSurplus 
            ? `${t('dashboard.surplus')} ${dataPoint.balance} kcal`
            : `${t('dashboard.deficit')} ${Math.abs(dataPoint.balance)} kcal`
          }
        </p>
      </div>
    );
  }
  return null;
}

export function CalorieBalanceChart({ data }: CalorieBalanceChartProps) {
  const { t } = useI18n();
  
  // Get bar color based on balance
  const getBarColor = (balance: number) => {
    if (balance > 100) return '#EF4444'; // Red for large surplus
    if (balance > 0) return '#F59E0B'; // Orange for small surplus
    return '#10B981'; // Green for deficit (good)
  };
  
  // Calculate totals
  const totalDeficit = data.reduce((sum, d) => sum + (d.balance < 0 ? Math.abs(d.balance) : 0), 0);
  const totalSurplus = data.reduce((sum, d) => sum + (d.balance > 0 ? d.balance : 0), 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">{t('dashboard.calorieBalance')}</h3>
        <div className="flex gap-4 mt-1 text-sm">
          {totalDeficit > 0 && (
            <span className="text-green-500">
              {t('dashboard.totalDeficit')}: {totalDeficit} kcal
            </span>
          )}
          {totalSurplus > 0 && (
            <span className="text-red-500">
              {t('dashboard.totalSurplus')}: {totalSurplus} kcal
            </span>
          )}
        </div>
      </div>
      
      {/* Chart */}
      {data.length > 0 ? (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CalorieTooltip />} />
              <Bar 
                dataKey="balance" 
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.balance)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-400">{t('common.noData')}</p>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600">{t('dashboard.underTarget')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-gray-600">{t('dashboard.slightlyOver')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600">{t('dashboard.overTarget')}</span>
        </div>
      </div>
    </div>
  );
}