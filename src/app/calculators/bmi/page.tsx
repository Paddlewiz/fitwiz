import type { Metadata } from 'next';
import { BMICalculatorClient } from './client';

export const metadata: Metadata = {
  title: 'BMI计算器 - 体质指数计算',
  description:
    '免费BMI体质指数计算器，配有可视化量表。快速计算您的BMI，了解体重健康状况，获取个性化健康建议。',
  keywords: ['BMI计算器', '体质指数', '体重计算器', '健康检查', 'BMI量表', '肥胖评估', '体重管理'],
  openGraph: {
    title: 'BMI计算器 - FitWiz',
    description: '使用我们免费的BMI计算器，配有可视化量表，快速评估您的体重健康状况。',
  },
};

export default function BMICalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          BMI体质指数计算器
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          快速计算您的BMI体质指数，查看您在健康量表上的位置。
          BMI是判断体重是否健康的重要指标。
        </p>
      </div>

      {/* Calculator */}
      <BMICalculatorClient />

      {/* SEO Content */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">什么是BMI？</h2>
        <p className="text-gray-600 mb-4">
          BMI（体质指数）是使用身高和体重进行的简单计算。
          公式为 BMI = kg/m²，其中kg是以千克为单位的体重，m²是以米为单位的身高平方。
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">BMI分类标准</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 font-semibold">偏瘦</p>
            <p className="text-blue-600">BMI &lt; 18.5</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700 font-semibold">正常</p>
            <p className="text-green-600">BMI 18.5 - 24.9</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 font-semibold">超重</p>
            <p className="text-amber-600">BMI 25 - 29.9</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">肥胖</p>
            <p className="text-red-600">BMI ≥ 30</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
          <p className="text-amber-800 text-sm">
            <strong>亚洲人群注意</strong>：亚洲人群的BMI标准略有不同，BMI 23-24.9已属于超重风险区间，
            建议亚洲人群以BMI 18.5-22.9为正常范围。
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">BMI的局限性</h3>
        <p className="text-gray-600 mb-4">
          BMI虽然是有用的筛查工具，但也有一定局限性：
        </p>
        <ul className="text-gray-600 space-y-2">
          <li>• 无法区分肌肉量和脂肪量</li>
          <li>• 运动员可能因肌肉量高而BMI偏高，但并非肥胖</li>
          <li>• 对老年人的健康评估可能不够准确</li>
          <li>• 无法反映体脂分布情况</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">BMI计算公式</h2>
        <div className="bg-teal-50 p-4 rounded-lg">
          <p className="text-teal-800 font-medium">
            BMI = 体重(kg) / 身高²(m²)
          </p>
          <p className="text-teal-700 mt-2">
            示例：体重70kg、身高1.75m的人，BMI = 70 / (1.75 × 1.75) = 22.9
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">健康建议</h3>
        <div className="space-y-3 text-gray-600">
          <p><strong>偏瘦人群</strong>：建议适当增加营养摄入，均衡饮食，适量运动增强体质。</p>
          <p><strong>正常体重</strong>：继续保持健康的生活方式，均衡饮食，规律运动。</p>
          <p><strong>超重人群</strong>：建议控制饮食热量，增加运动量，每周减重0.5-1kg为宜。</p>
          <p><strong>肥胖人群</strong>：建议寻求专业医疗建议，制定科学的减重计划。</p>
        </div>
      </div>
    </div>
  );
}