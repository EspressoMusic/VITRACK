import type { Lang } from './lang'

export interface WorkoutsPanelStrings {
  prevDayAriaLabel: string
  nextDayAriaLabel: string
  openDatePickerAriaLabel: string
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
  todayPrefix: string
  noWorkoutsThisDay: string
  addPlaceholder: string
  addAriaLabel: string
  markDoneAriaLabel: string
  markNotDoneAriaLabel: string
  deleteAriaLabel: string
  modalTitle: string
  editModalTitle: string
  closeAriaLabel: string
  defaultWorkoutName: string
  workoutNamePlaceholder: string
  exerciseNamePlaceholder: string
  setsPlaceholder: string
  repsPlaceholder: string
  weightPlaceholder: string
  addExerciseLabel: string
  removeExerciseAriaLabel: string
  saveButtonLabel: string
  templatesLabel: string
  allDoneMessage: string
  timerAriaLabel: string
  timerModalTitle: string
  startLabel: string
  pauseLabel: string
  resetLabel: string
  timeUpMessage: string
}

export const WORKOUTS_PANEL_STRINGS: Record<Lang, WorkoutsPanelStrings> = {
  en: {
    prevDayAriaLabel: 'Previous day',
    nextDayAriaLabel: 'Next day',
    openDatePickerAriaLabel: 'Choose a date',
    prevMonthAriaLabel: 'Previous month',
    nextMonthAriaLabel: 'Next month',
    todayPrefix: 'Today',
    noWorkoutsThisDay: 'No workouts added for this day yet.',
    addPlaceholder: 'Add a workout…',
    addAriaLabel: 'Add workout',
    markDoneAriaLabel: 'Mark as done',
    markNotDoneAriaLabel: 'Mark as not done',
    deleteAriaLabel: 'Delete workout',
    modalTitle: 'Add workout',
    editModalTitle: 'Edit workout',
    closeAriaLabel: 'Close',
    defaultWorkoutName: 'Workout',
    workoutNamePlaceholder: 'Workout name',
    exerciseNamePlaceholder: 'Exercise name',
    setsPlaceholder: 'Sets',
    repsPlaceholder: 'Reps',
    weightPlaceholder: 'kg',
    addExerciseLabel: 'Add exercise',
    removeExerciseAriaLabel: 'Remove exercise',
    saveButtonLabel: 'Save',
    templatesLabel: 'Quick start',
    allDoneMessage: "Nice work! You finished your workout 🎉",
    timerAriaLabel: 'Rest timer',
    timerModalTitle: 'Rest Timer',
    startLabel: 'Start',
    pauseLabel: 'Pause',
    resetLabel: 'Reset',
    timeUpMessage: "Time's up!",
  },
  he: {
    prevDayAriaLabel: 'יום קודם',
    nextDayAriaLabel: 'יום הבא',
    openDatePickerAriaLabel: 'בחירת תאריך',
    prevMonthAriaLabel: 'חודש קודם',
    nextMonthAriaLabel: 'חודש הבא',
    todayPrefix: 'היום',
    noWorkoutsThisDay: 'עדיין לא נוספו אימונים ליום הזה.',
    addPlaceholder: 'הוספת אימון…',
    addAriaLabel: 'הוספת אימון',
    markDoneAriaLabel: 'סימון כבוצע',
    markNotDoneAriaLabel: 'ביטול סימון',
    deleteAriaLabel: 'מחיקת אימון',
    modalTitle: 'הוספת אימון',
    editModalTitle: 'עריכת אימון',
    closeAriaLabel: 'סגירה',
    defaultWorkoutName: 'אימון',
    workoutNamePlaceholder: 'שם האימון',
    exerciseNamePlaceholder: 'שם התרגיל',
    setsPlaceholder: 'סטים',
    repsPlaceholder: 'חזרות',
    weightPlaceholder: 'ק"ג',
    addExerciseLabel: 'הוספת תרגיל',
    removeExerciseAriaLabel: 'הסרת תרגיל',
    saveButtonLabel: 'שמירה',
    templatesLabel: 'התחלה מהירה',
    allDoneMessage: 'יפה מאוד! סיימת להתאמן 🎉',
    timerAriaLabel: 'טיימר מנוחה',
    timerModalTitle: 'טיימר מנוחה',
    startLabel: 'התחלה',
    pauseLabel: 'השהיה',
    resetLabel: 'איפוס',
    timeUpMessage: 'הזמן נגמר!',
  },
  ar: {
    prevDayAriaLabel: 'اليوم السابق',
    nextDayAriaLabel: 'اليوم التالي',
    openDatePickerAriaLabel: 'اختيار تاريخ',
    prevMonthAriaLabel: 'الشهر السابق',
    nextMonthAriaLabel: 'الشهر التالي',
    todayPrefix: 'اليوم',
    noWorkoutsThisDay: 'لم تتم إضافة تمارين لهذا اليوم بعد.',
    addPlaceholder: 'إضافة تمرين…',
    addAriaLabel: 'إضافة تمرين',
    markDoneAriaLabel: 'وضع علامة كمنجز',
    markNotDoneAriaLabel: 'إلغاء العلامة',
    deleteAriaLabel: 'حذف التمرين',
    modalTitle: 'إضافة تمرين',
    editModalTitle: 'تعديل التمرين',
    closeAriaLabel: 'إغلاق',
    defaultWorkoutName: 'تمرين',
    workoutNamePlaceholder: 'اسم التمرين',
    exerciseNamePlaceholder: 'اسم الحركة',
    setsPlaceholder: 'مجموعات',
    repsPlaceholder: 'تكرارات',
    weightPlaceholder: 'كغ',
    addExerciseLabel: 'إضافة حركة',
    removeExerciseAriaLabel: 'إزالة الحركة',
    saveButtonLabel: 'حفظ',
    templatesLabel: 'بداية سريعة',
    allDoneMessage: 'أحسنت! أنهيت التمرين 🎉',
    timerAriaLabel: 'مؤقت الراحة',
    timerModalTitle: 'مؤقت الراحة',
    startLabel: 'بدء',
    pauseLabel: 'إيقاف مؤقت',
    resetLabel: 'إعادة ضبط',
    timeUpMessage: 'انتهى الوقت!',
  },
}
