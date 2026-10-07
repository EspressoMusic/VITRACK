import type { Lang } from './lang'

interface FoodGuardStrings {
  /** One new guard: "New guard: Cucumber Guard 🥒". */
  arrived: (name: string, icon: string) => string
  arrivedMany: (n: number) => string
  /** Which logged food it came from. */
  ateIt: (food: string) => string
  stays: string
  power: string
  servings: (n: number) => string
  healthierHint: string
}

export const FOOD_GUARD_STRINGS: Record<Lang, FoodGuardStrings> = {
  en: {
    arrived: (name, icon) => `New guard: ${name} ${icon}`,
    arrivedMany: (n) => `${n} new guards came from the food you ate 🛡️`,
    ateIt: (food) => `Here because you ate: ${food}`,
    stays: 'Guards the city till the end of the week',
    power: 'Power',
    servings: (n) => `You ate it ${n} times, so it shoots faster`,
    healthierHint: 'Healthier food makes stronger guards',
  },
  he: {
    arrived: (name, icon) => `שומר חדש: ${name} ${icon}`,
    arrivedMany: (n) => `${n} שומרים חדשים הגיעו מהאוכל שאכלת 🛡️`,
    ateIt: (food) => `הגיע כי אכלת: ${food}`,
    stays: 'שומר על העיר עד סוף השבוע',
    power: 'כוח',
    servings: (n) => `אכלת את זה ${n} פעמים, אז הוא יורה מהר יותר`,
    healthierHint: 'אוכל בריא יותר = שומר חזק יותר',
  },
  ar: {
    arrived: (name, icon) => `حارس جديد: ${name} ${icon}`,
    arrivedMany: (n) => `${n} حراس جدد جاؤوا من الطعام الذي أكلته 🛡️`,
    ateIt: (food) => `جاء لأنك أكلت: ${food}`,
    stays: 'يحرس المدينة حتى نهاية الأسبوع',
    power: 'القوة',
    servings: (n) => `أكلته ${n} مرات، لذلك يرمي أسرع`,
    healthierHint: 'الطعام الصحي أكثر يصنع حارسًا أقوى',
  },
}
