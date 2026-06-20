import type { Metadata } from 'next';
import { TDEECalculatorClient } from './client';

export const metadata: Metadata = {
  title: 'TDEE计算器 - 每日总能量消耗计算',
  description:
    '免费TDEE计算器，使用Mifflin-St Jeor公式精准计算每日总能量消耗。科学规划减重或增重，了解维持体重所需的准确热量。',
  keywords: ['TDEE计算器', '热量计算器', '每日能量消耗', 'Mifflin-St Jeor', '基础代谢率', '减重计算器', 'BMR计算', '卡路里需求'],
  openGraph: {
    title: 'TDEE计算器 - FitWiz',
    description: '使用我们免费精准的TDEE计算器，计算您的每日总能量消耗。',
  },
};

export default function TDEECalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          TDEE计算器
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          使用Mifflin-St Jeor公式精准计算您的每日总能量消耗(TDEE)。
          了解维持、减重或增重所需的准确热量摄入。
        </p>
      </div>

      {/* Calculator */}
      <TDEECalculatorClient />

      {/* SEO Content */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">什么是TDEE？</h2>
        <p className="text-gray-600 mb-4">
          TDEE（每日总能量消耗）是您每天燃烧的总卡路里数量。
          它包括您的BMR（基础代谢率）加上通过体力活动和消化燃烧的卡路里。
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Mifflin-St Jeor公式</h3>
        <p className="text-gray-600 mb-4">
          Mifflin-St Jeor方程被认为是计算BMR最准确的公式。它考虑了
          您的体重、身高、年龄和性别，提供个性化的热量需求估算。
        </p>
        
        <div className="bg-teal-50 p-4 rounded-lg mb-4">
          <p className="text-teal-800 font-medium">
            男性: BMR = (10 × 体重kg) + (6.25 × 身高cm) - (5 × 年龄) + 5
          </p>
          <p className="text-teal-800 font-medium mt-2">
            女性: BMR = (10 × 体重kg) + (6.25 × 身高cm) - (5 × 年龄) - 161
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">活动水平系数</h3>
        <div className="space-y-2 text-gray-600">
          <p>• <strong>久坐不动</strong> (很少或没有运动): BMR × 1.2</p>
          <p>• <strong>轻度活动</strong> (每周轻度运动1-3天): BMR × 1.375</p>
          <p>• <strong>中度活动</strong> (每周中度运动3-5天): BMR × 1.55</p>
          <p>• <strong>高度活动</strong> (每周高强度运动6-7天): BMR × 1.725</p>
          <p>• <strong>极度活动</strong> (体力劳动或每天两次训练): BMR × 1.9</p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">如何使用TDEE？</h3>
        <p className="text-gray-600 mb-4">
          了解您的TDEE可以帮助您制定合理的饮食计划：
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li><strong>维持体重</strong>: 每日摄入热量 ≈ TDEE</li>
          <li><strong>减重</strong>: 每日摄入热量 = TDEE - 500 (每周减重约0.5kg)</li>
          <li><strong>增重</strong>: 每日摄入热量 = TDEE + 500 (每周增重约0.5kg)</li>
        </ul>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-6">
          <p className="text-amber-800 text-sm">
            <strong>注意</strong>: 减重时不建议将摄入热量降低到BMR以下，这可能对健康产生负面影响。
            建议每周减重不超过0.5-1kg，循序渐进更健康。
          </p>
        </div>
      </div>
    </div>
  );
}