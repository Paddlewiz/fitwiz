// 常见食物营养数据库（每100g）
// 数据来源：中国食物成分表（第6版）+ USDA Food Database
// calories: kcal, protein/carbs/fat: g, sodium: mg

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  sodiumPer100g: number;
}

export const FOOD_CATEGORIES = [
  '主食', '肉类', '禽蛋', '水产', '蔬菜', '水果', '豆制品', '奶制品', '坚果', '饮品', '调味品', '零食'
];

export const FOOD_DATABASE: FoodItem[] = [
  // 主食
  { id: 'rice', name: '米饭', category: '主食', caloriesPer100g: 116, proteinPer100g: 2.6, carbsPer100g: 25.9, fatPer100g: 0.3, sodiumPer100g: 2 },
  { id: 'mantou', name: '馒头', category: '主食', caloriesPer100g: 223, proteinPer100g: 7.0, carbsPer100g: 47.0, fatPer100g: 1.1, sodiumPer100g: 165 },
  { id: 'noodles', name: '面条', category: '主食', caloriesPer100g: 110, proteinPer100g: 3.5, carbsPer100g: 22.0, fatPer100g: 0.6, sodiumPer100g: 188 },
  { id: 'oatmeal', name: '燕麦', category: '主食', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9, sodiumPer100g: 2 },
  { id: 'sweet_potato', name: '红薯', category: '主食', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20.0, fatPer100g: 0.1, sodiumPer100g: 55 },
  { id: 'corn', name: '玉米', category: '主食', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19.0, fatPer100g: 1.2, sodiumPer100g: 3 },
  { id: 'bread', name: '面包', category: '主食', caloriesPer100g: 313, proteinPer100g: 8.3, carbsPer100g: 58.6, fatPer100g: 5.1, sodiumPer100g: 400 },
  { id: 'baozi', name: '包子', category: '主食', caloriesPer100g: 227, proteinPer100g: 7.0, carbsPer100g: 38.0, fatPer100g: 4.5, sodiumPer100g: 230 },
  { id: 'jiaozi', name: '饺子', category: '主食', caloriesPer100g: 240, proteinPer100g: 8.0, carbsPer100g: 30.0, fatPer100g: 8.5, sodiumPer100g: 350 },
  { id: 'congee', name: '白粥', category: '主食', caloriesPer100g: 46, proteinPer100g: 1.1, carbsPer100g: 9.8, fatPer100g: 0.1, sodiumPer100g: 2 },
  { id: 'rice_noodle', name: '米粉', category: '主食', caloriesPer100g: 110, proteinPer100g: 3.0, carbsPer100g: 23.0, fatPer100g: 0.5, sodiumPer100g: 150 },

  // 肉类
  { id: 'chicken_breast', name: '鸡胸肉', category: '肉类', caloriesPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0, fatPer100g: 3.6, sodiumPer100g: 74 },
  { id: 'pork', name: '猪肉（瘦）', category: '肉类', caloriesPer100g: 143, proteinPer100g: 20.3, carbsPer100g: 0, fatPer100g: 6.2, sodiumPer100g: 57 },
  { id: 'pork_belly', name: '五花肉', category: '肉类', caloriesPer100g: 395, proteinPer100g: 13.0, carbsPer100g: 0, fatPer100g: 37.0, sodiumPer100g: 50 },
  { id: 'beef', name: '牛肉（瘦）', category: '肉类', caloriesPer100g: 125, proteinPer100g: 20.2, carbsPer100g: 0, fatPer100g: 4.2, sodiumPer100g: 53 },
  { id: 'lamb', name: '羊肉（瘦）', category: '肉类', caloriesPer100g: 118, proteinPer100g: 20.5, carbsPer100g: 0, fatPer100g: 3.9, sodiumPer100g: 69 },
  { id: 'pork_ribs', name: '排骨', category: '肉类', caloriesPer100g: 278, proteinPer100g: 18.3, carbsPer100g: 0, fatPer100g: 22.0, sodiumPer100g: 62 },
  { id: 'ham', name: '火腿', category: '肉类', caloriesPer100g: 330, proteinPer100g: 16.0, carbsPer100g: 1.0, fatPer100g: 27.0, sodiumPer100g: 1086 },
  { id: 'bacon', name: '培根', category: '肉类', caloriesPer100g: 541, proteinPer100g: 37.0, carbsPer100g: 1.4, fatPer100g: 42.0, sodiumPer100g: 1717 },
  { id: 'sausage', name: '香肠', category: '肉类', caloriesPer100g: 508, proteinPer100g: 24.1, carbsPer100g: 11.2, fatPer100g: 40.7, sodiumPer100g: 2309 },

  // 禽蛋
  { id: 'chicken_leg', name: '鸡腿', category: '禽蛋', caloriesPer100g: 181, proteinPer100g: 20.2, carbsPer100g: 0, fatPer100g: 10.8, sodiumPer100g: 64 },
  { id: 'egg', name: '鸡蛋', category: '禽蛋', caloriesPer100g: 147, proteinPer100g: 12.6, carbsPer100g: 1.1, fatPer100g: 9.5, sodiumPer100g: 131 },
  { id: 'egg_white', name: '蛋白', category: '禽蛋', caloriesPer100g: 48, proteinPer100g: 11.0, carbsPer100g: 0.7, fatPer100g: 0.2, sodiumPer100g: 166 },
  { id: 'duck', name: '鸭肉', category: '禽蛋', caloriesPer100g: 240, proteinPer100g: 15.5, carbsPer100g: 0, fatPer100g: 19.7, sodiumPer100g: 69 },

  // 水产
  { id: 'salmon', name: '三文鱼', category: '水产', caloriesPer100g: 208, proteinPer100g: 20.0, carbsPer100g: 0, fatPer100g: 13.0, sodiumPer100g: 59 },
  { id: 'grass_carp', name: '草鱼', category: '水产', caloriesPer100g: 113, proteinPer100g: 16.6, carbsPer100g: 0, fatPer100g: 5.2, sodiumPer100g: 46 },
  { id: 'shrimp', name: '虾仁', category: '水产', caloriesPer100g: 87, proteinPer100g: 18.6, carbsPer100g: 0, fatPer100g: 0.8, sodiumPer100g: 165 },
  { id: 'hairtail', name: '带鱼', category: '水产', caloriesPer100g: 127, proteinPer100g: 17.7, carbsPer100g: 0, fatPer100g: 4.9, sodiumPer100g: 150 },
  { id: 'squid', name: '鱿鱼', category: '水产', caloriesPer100g: 92, proteinPer100g: 15.6, carbsPer100g: 3.0, fatPer100g: 0.9, sodiumPer100g: 134 },
  { id: 'crab', name: '螃蟹', category: '水产', caloriesPer100g: 103, proteinPer100g: 17.5, carbsPer100g: 2.3, fatPer100g: 2.6, sodiumPer100g: 260 },

  // 蔬菜
  { id: 'cabbage', name: '白菜', category: '蔬菜', caloriesPer100g: 17, proteinPer100g: 1.5, carbsPer100g: 3.2, fatPer100g: 0.1, sodiumPer100g: 73 },
  { id: 'spinach', name: '菠菜', category: '蔬菜', caloriesPer100g: 24, proteinPer100g: 2.6, carbsPer100g: 4.5, fatPer100g: 0.3, sodiumPer100g: 85 },
  { id: 'tomato', name: '西红柿', category: '蔬菜', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 4.0, fatPer100g: 0.2, sodiumPer100g: 5 },
  { id: 'cucumber', name: '黄瓜', category: '蔬菜', caloriesPer100g: 15, proteinPer100g: 0.8, carbsPer100g: 2.9, fatPer100g: 0.2, sodiumPer100g: 5 },
  { id: 'eggplant', name: '茄子', category: '蔬菜', caloriesPer100g: 21, proteinPer100g: 1.1, carbsPer100g: 4.9, fatPer100g: 0.2, sodiumPer100g: 5 },
  { id: 'potato', name: '土豆', category: '蔬菜', caloriesPer100g: 77, proteinPer100g: 2.0, carbsPer100g: 17.2, fatPer100g: 0.2, sodiumPer100g: 6 },
  { id: 'carrot', name: '胡萝卜', category: '蔬菜', caloriesPer100g: 39, proteinPer100g: 1.0, carbsPer100g: 8.8, fatPer100g: 0.2, sodiumPer100g: 71 },
  { id: 'pepper', name: '青椒', category: '蔬菜', caloriesPer100g: 22, proteinPer100g: 1.0, carbsPer100g: 5.4, fatPer100g: 0.2, sodiumPer100g: 3 },
  { id: 'cauliflower', name: '花菜', category: '蔬菜', caloriesPer100g: 24, proteinPer100g: 2.1, carbsPer100g: 4.6, fatPer100g: 0.2, sodiumPer100g: 32 },
  { id: 'lettuce', name: '生菜', category: '蔬菜', caloriesPer100g: 13, proteinPer100g: 1.4, carbsPer100g: 2.0, fatPer100g: 0.2, sodiumPer100g: 33 },
  { id: 'mushroom', name: '蘑菇', category: '蔬菜', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, sodiumPer100g: 8 },
  { id: 'winter_melon', name: '冬瓜', category: '蔬菜', caloriesPer100g: 12, proteinPer100g: 0.4, carbsPer100g: 2.6, fatPer100g: 0.2, sodiumPer100g: 2 },
  { id: 'broccoli', name: '西兰花', category: '蔬菜', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7.0, fatPer100g: 0.4, sodiumPer100g: 18 },
  { id: 'onion', name: '洋葱', category: '蔬菜', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.0, fatPer100g: 0.2, sodiumPer100g: 4 },

  // 水果
  { id: 'apple', name: '苹果', category: '水果', caloriesPer100g: 54, proteinPer100g: 0.3, carbsPer100g: 13.5, fatPer100g: 0.2, sodiumPer100g: 1 },
  { id: 'banana', name: '香蕉', category: '水果', caloriesPer100g: 93, proteinPer100g: 1.4, carbsPer100g: 22.2, fatPer100g: 0.2, sodiumPer100g: 1 },
  { id: 'orange', name: '橙子', category: '水果', caloriesPer100g: 48, proteinPer100g: 0.8, carbsPer100g: 11.1, fatPer100g: 0.2, sodiumPer100g: 1 },
  { id: 'grape', name: '葡萄', category: '水果', caloriesPer100g: 44, proteinPer100g: 0.5, carbsPer100g: 10.3, fatPer100g: 0.2, sodiumPer100g: 1 },
  { id: 'watermelon', name: '西瓜', category: '水果', caloriesPer100g: 26, proteinPer100g: 0.6, carbsPer100g: 5.8, fatPer100g: 0.1, sodiumPer100g: 2 },
  { id: 'pear', name: '梨', category: '水果', caloriesPer100g: 51, proteinPer100g: 0.4, carbsPer100g: 13.3, fatPer100g: 0.2, sodiumPer100g: 1 },
  { id: 'peach', name: '桃子', category: '水果', caloriesPer100g: 48, proteinPer100g: 0.9, carbsPer100g: 12.2, fatPer100g: 0.1, sodiumPer100g: 1 },
  { id: 'strawberry', name: '草莓', category: '水果', caloriesPer100g: 32, proteinPer100g: 1.0, carbsPer100g: 7.1, fatPer100g: 0.2, sodiumPer100g: 4 },

  // 豆制品
  { id: 'tofu', name: '豆腐', category: '豆制品', caloriesPer100g: 81, proteinPer100g: 8.1, carbsPer100g: 4.2, fatPer100g: 3.7, sodiumPer100g: 7 },
  { id: 'soy_milk', name: '豆浆', category: '豆制品', caloriesPer100g: 31, proteinPer100g: 3.0, carbsPer100g: 1.2, fatPer100g: 1.6, sodiumPer100g: 3 },
  { id: 'soybean', name: '黄豆', category: '豆制品', caloriesPer100g: 390, proteinPer100g: 35.0, carbsPer100g: 34.0, fatPer100g: 16.0, sodiumPer100g: 2 },

  // 奶制品
  { id: 'milk', name: '牛奶', category: '奶制品', caloriesPer100g: 54, proteinPer100g: 3.0, carbsPer100g: 3.4, fatPer100g: 3.2, sodiumPer100g: 37 },
  { id: 'yogurt', name: '酸奶', category: '奶制品', caloriesPer100g: 72, proteinPer100g: 2.5, carbsPer100g: 9.3, fatPer100g: 2.7, sodiumPer100g: 39 },
  { id: 'cheese', name: '奶酪', category: '奶制品', caloriesPer100g: 328, proteinPer100g: 25.7, carbsPer100g: 3.5, fatPer100g: 23.5, sodiumPer100g: 584 },

  // 坚果
  { id: 'peanut', name: '花生', category: '坚果', caloriesPer100g: 567, proteinPer100g: 25.8, carbsPer100g: 16.1, fatPer100g: 49.2, sodiumPer100g: 18 },
  { id: 'walnut', name: '核桃', category: '坚果', caloriesPer100g: 654, proteinPer100g: 14.9, carbsPer100g: 19.1, fatPer100g: 58.8, sodiumPer100g: 2 },
  { id: 'almond', name: '杏仁', category: '坚果', caloriesPer100g: 579, proteinPer100g: 21.0, carbsPer100g: 22.0, fatPer100g: 50.0, sodiumPer100g: 1 },

  // 饮品
  { id: 'coffee', name: '黑咖啡', category: '饮品', caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, sodiumPer100g: 2 },
  { id: 'tea', name: '茶水', category: '饮品', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, sodiumPer100g: 0 },
  { id: 'juice', name: '果汁', category: '饮品', caloriesPer100g: 45, proteinPer100g: 0.5, carbsPer100g: 11.0, fatPer100g: 0.1, sodiumPer100g: 3 },
  { id: 'cola', name: '可乐', category: '饮品', caloriesPer100g: 43, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0, sodiumPer100g: 4 },
  { id: 'beer', name: '啤酒', category: '饮品', caloriesPer100g: 32, proteinPer100g: 0.4, carbsPer100g: 2.5, fatPer100g: 0, sodiumPer100g: 4 },

  // 调味品
  { id: 'soy_sauce', name: '酱油', category: '调味品', caloriesPer100g: 63, proteinPer100g: 5.6, carbsPer100g: 10.1, fatPer100g: 0.1, sodiumPer100g: 5757 },
  { id: 'sugar', name: '白糖', category: '调味品', caloriesPer100g: 387, proteinPer100g: 0, carbsPer100g: 99.9, fatPer100g: 0, sodiumPer100g: 1 },
  { id: 'honey', name: '蜂蜜', category: '调味品', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82.0, fatPer100g: 0, sodiumPer100g: 5 },
  { id: 'oil', name: '食用油', category: '调味品', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100.0, sodiumPer100g: 0 },

  // 零食
  { id: 'chips', name: '薯片', category: '零食', caloriesPer100g: 547, proteinPer100g: 7.0, carbsPer100g: 50.0, fatPer100g: 36.0, sodiumPer100g: 526 },
  { id: 'chocolate', name: '巧克力', category: '零食', caloriesPer100g: 546, proteinPer100g: 7.0, carbsPer100g: 58.0, fatPer100g: 31.0, sodiumPer100g: 24 },
  { id: 'biscuit', name: '饼干', category: '零食', caloriesPer100g: 433, proteinPer100g: 7.0, carbsPer100g: 70.0, fatPer100g: 14.0, sodiumPer100g: 300 },
];

// 烹饪方式定义：不同烹饪方式对热量和钠盐的影响（每100g食材）
// 热量增幅：烹饪用油/糖带来的额外热量
// 额外钠盐：盐、酱油等调味料带来的额外钠（mg/100g）
export interface CookingMethod {
  id: string;
  label: string;
  calorieMultiplier: number; // 热量倍率（1.0=不变，1.15=增加15%）
  extraSodiumPer100g: number; // 额外钠盐 mg/100g
}

export const COOKING_METHODS: CookingMethod[] = [
  { id: 'raw', label: '生食/凉菜', calorieMultiplier: 1.0, extraSodiumPer100g: 80 },
  { id: 'boil', label: '水煮/焯水', calorieMultiplier: 1.0, extraSodiumPer100g: 120 },
  { id: 'steam', label: '清蒸', calorieMultiplier: 1.0, extraSodiumPer100g: 150 },
  { id: 'stir_fry', label: '炒', calorieMultiplier: 1.15, extraSodiumPer100g: 350 },
  { id: 'pan_fry', label: '煎', calorieMultiplier: 1.20, extraSodiumPer100g: 280 },
  { id: 'deep_fry', label: '炸', calorieMultiplier: 1.45, extraSodiumPer100g: 200 },
  { id: 'braise', label: '红烧/卤', calorieMultiplier: 1.10, extraSodiumPer100g: 500 },
  { id: 'grill', label: '烤', calorieMultiplier: 1.05, extraSodiumPer100g: 250 },
];

// 搜索食物：支持名称模糊匹配
export function searchFoods(query: string, limit = 10): FoodItem[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase().trim();
  return FOOD_DATABASE
    .filter(f => f.name.toLowerCase().includes(lower) || f.id.toLowerCase().includes(lower))
    .slice(0, limit);
}

// 根据食材 + 重量 + 烹饪方式计算营养
// 钠盐 = 食材自带钠 × (重量/100) + 烹饪方式额外钠 × (重量/100)
export function calculateNutrition(food: FoodItem, weightGrams: number, cookingMethod?: CookingMethod) {
  const ratio = weightGrams / 100;
  const extraSodium = cookingMethod ? cookingMethod.extraSodiumPer100g * ratio : 0;
  const calorieMult = cookingMethod ? cookingMethod.calorieMultiplier : 1.0;
  return {
    calories: Math.round(food.caloriesPer100g * ratio * calorieMult),
    protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(food.fatPer100g * ratio * calorieMult * 10) / 10,
    sodium: Math.round(food.sodiumPer100g * ratio + extraSodium),
  };
}
