import type { Lang } from './i18n/lang'

export type WorkoutTemplateId = 'legDay' | 'pushDay' | 'pullDay' | 'fullBody' | 'core' | 'cardio'

export const WORKOUT_TEMPLATE_IDS: WorkoutTemplateId[] = ['legDay', 'pushDay', 'pullDay', 'fullBody', 'core', 'cardio']

export interface WorkoutTemplateExercise {
  name: string
  sets?: number
  reps?: number
}

export interface WorkoutTemplate {
  emoji: string
  label: string
  exercises: WorkoutTemplateExercise[]
}

export const WORKOUT_TEMPLATES: Record<Lang, Record<WorkoutTemplateId, WorkoutTemplate>> = {
  en: {
    legDay: {
      emoji: '🦵',
      label: 'Leg Day',
      exercises: [
        { name: 'Squats', sets: 4, reps: 10 },
        { name: 'Lunges', sets: 3, reps: 12 },
        { name: 'Romanian Deadlift', sets: 3, reps: 10 },
        { name: 'Leg Press', sets: 3, reps: 12 },
        { name: 'Calf Raises', sets: 4, reps: 15 },
      ],
    },
    pushDay: {
      emoji: '💪',
      label: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Overhead Press', sets: 3, reps: 10 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
        { name: 'Triceps Dips', sets: 3, reps: 12 },
        { name: 'Lateral Raises', sets: 3, reps: 15 },
      ],
    },
    pullDay: {
      emoji: '🏋️',
      label: 'Pull Day',
      exercises: [
        { name: 'Pull-Ups', sets: 4, reps: 8 },
        { name: 'Barbell Rows', sets: 4, reps: 10 },
        { name: 'Lat Pulldown', sets: 3, reps: 12 },
        { name: 'Face Pulls', sets: 3, reps: 15 },
        { name: 'Bicep Curls', sets: 3, reps: 12 },
      ],
    },
    fullBody: {
      emoji: '🔥',
      label: 'Full Body',
      exercises: [
        { name: 'Squats', sets: 3, reps: 10 },
        { name: 'Push-Ups', sets: 3, reps: 15 },
        { name: 'Bent-Over Rows', sets: 3, reps: 10 },
        { name: 'Deadlifts', sets: 3, reps: 8 },
        { name: 'Plank' },
      ],
    },
    core: {
      emoji: '🧘',
      label: 'Core',
      exercises: [
        { name: 'Plank' },
        { name: 'Crunches', sets: 3, reps: 20 },
        { name: 'Russian Twists', sets: 3, reps: 20 },
        { name: 'Leg Raises', sets: 3, reps: 15 },
        { name: 'Mountain Climbers', sets: 3, reps: 20 },
      ],
    },
    cardio: {
      emoji: '🏃',
      label: 'Cardio',
      exercises: [
        { name: 'Running' },
        { name: 'Jump Rope', sets: 3 },
        { name: 'Burpees', sets: 3, reps: 15 },
        { name: 'Cycling' },
        { name: 'Rowing Machine', sets: 3 },
      ],
    },
  },
  he: {
    legDay: {
      emoji: '🦵',
      label: 'יום רגליים',
      exercises: [
        { name: 'סקוואט', sets: 4, reps: 10 },
        { name: 'לאנג׳ים', sets: 3, reps: 12 },
        { name: 'דדליפט רומני', sets: 3, reps: 10 },
        { name: 'לחיצת רגליים', sets: 3, reps: 12 },
        { name: 'עליות שוק', sets: 4, reps: 15 },
      ],
    },
    pushDay: {
      emoji: '💪',
      label: 'יום דחיפה',
      exercises: [
        { name: 'לחיצת חזה', sets: 4, reps: 8 },
        { name: 'לחיצת כתפיים', sets: 3, reps: 10 },
        { name: 'לחיצת חזה משופעת', sets: 3, reps: 10 },
        { name: 'מקבילים לטריצפס', sets: 3, reps: 12 },
        { name: 'הרחקת כתפיים לצד', sets: 3, reps: 15 },
      ],
    },
    pullDay: {
      emoji: '🏋️',
      label: 'יום משיכה',
      exercises: [
        { name: 'מתח', sets: 4, reps: 8 },
        { name: 'חתירה עם מוט', sets: 4, reps: 10 },
        { name: 'משיכת פולי עליון', sets: 3, reps: 12 },
        { name: 'פייס פול', sets: 3, reps: 15 },
        { name: 'כפיפות מרפק', sets: 3, reps: 12 },
      ],
    },
    fullBody: {
      emoji: '🔥',
      label: 'כל הגוף',
      exercises: [
        { name: 'סקוואט', sets: 3, reps: 10 },
        { name: 'שכיבות סמיכה', sets: 3, reps: 15 },
        { name: 'חתירה בהרכנה', sets: 3, reps: 10 },
        { name: 'דדליפט', sets: 3, reps: 8 },
        { name: 'פלאנק' },
      ],
    },
    core: {
      emoji: '🧘',
      label: 'ליבה',
      exercises: [
        { name: 'פלאנק' },
        { name: 'כפיפות בטן', sets: 3, reps: 20 },
        { name: 'טוויסט רוסי', sets: 3, reps: 20 },
        { name: 'הרמות רגליים', sets: 3, reps: 15 },
        { name: 'מטפס הרים', sets: 3, reps: 20 },
      ],
    },
    cardio: {
      emoji: '🏃',
      label: 'קרדיו',
      exercises: [
        { name: 'ריצה' },
        { name: 'קפיצות חבל', sets: 3 },
        { name: 'ברפי', sets: 3, reps: 15 },
        { name: 'רכיבת אופניים' },
        { name: 'חתירה (מכשיר)', sets: 3 },
      ],
    },
  },
  ar: {
    legDay: {
      emoji: '🦵',
      label: 'يوم الأرجل',
      exercises: [
        { name: 'سكوات', sets: 4, reps: 10 },
        { name: 'اندفاعات (لنجز)', sets: 3, reps: 12 },
        { name: 'رفعة رومانية ميتة', sets: 3, reps: 10 },
        { name: 'مكبس الأرجل', sets: 3, reps: 12 },
        { name: 'رفع الكعبين', sets: 4, reps: 15 },
      ],
    },
    pushDay: {
      emoji: '💪',
      label: 'يوم الدفع',
      exercises: [
        { name: 'بنش برس', sets: 4, reps: 8 },
        { name: 'ضغط الكتف', sets: 3, reps: 10 },
        { name: 'بنش مائل بالدمبل', sets: 3, reps: 10 },
        { name: 'ديبس للترايسبس', sets: 3, reps: 12 },
        { name: 'رفرفة جانبية', sets: 3, reps: 15 },
      ],
    },
    pullDay: {
      emoji: '🏋️',
      label: 'يوم السحب',
      exercises: [
        { name: 'عقلة (بول أب)', sets: 4, reps: 8 },
        { name: 'تجديف بالبار', sets: 4, reps: 10 },
        { name: 'سحب أمامي (لات بولداون)', sets: 3, reps: 12 },
        { name: 'فيس بول', sets: 3, reps: 15 },
        { name: 'تمرين البايسبس', sets: 3, reps: 12 },
      ],
    },
    fullBody: {
      emoji: '🔥',
      label: 'كامل الجسم',
      exercises: [
        { name: 'سكوات', sets: 3, reps: 10 },
        { name: 'ضغط', sets: 3, reps: 15 },
        { name: 'تجديف منحني', sets: 3, reps: 10 },
        { name: 'رفعة ميتة', sets: 3, reps: 8 },
        { name: 'بلانك' },
      ],
    },
    core: {
      emoji: '🧘',
      label: 'الجذع',
      exercises: [
        { name: 'بلانك' },
        { name: 'تمرين البطن (كرنش)', sets: 3, reps: 20 },
        { name: 'لفة روسية', sets: 3, reps: 20 },
        { name: 'رفع الأرجل', sets: 3, reps: 15 },
        { name: 'تسلق الجبل', sets: 3, reps: 20 },
      ],
    },
    cardio: {
      emoji: '🏃',
      label: 'كارديو',
      exercises: [
        { name: 'جري' },
        { name: 'نط الحبل', sets: 3 },
        { name: 'بيربي', sets: 3, reps: 15 },
        { name: 'ركوب الدراجة' },
        { name: 'التجديف (آلة)', sets: 3 },
      ],
    },
  },
}
