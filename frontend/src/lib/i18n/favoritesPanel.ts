import type { Lang } from './lang'

export interface FavoritesPanelStrings {
  ariaLabel: string
  title: string
  savedFoodsTitle: string
  savedMealsTitle: string
  emptyFoods: string
  emptyMeals: string
  removeAriaLabel: string
}

export const FAVORITES_PANEL_STRINGS: Record<Lang, FavoritesPanelStrings> = {
  en: {
    ariaLabel: 'Favorites',
    title: 'My Favorites',
    savedFoodsTitle: 'Saved foods',
    savedMealsTitle: 'Saved meals',
    emptyFoods: 'No saved foods yet — tap the star on any food to save it here.',
    emptyMeals: 'No saved meals yet — save a meal from its detail view to see it here.',
    removeAriaLabel: 'Remove from favorites',
  },
  he: {
    ariaLabel: 'מועדפים',
    title: 'המועדפים שלי',
    savedFoodsTitle: 'מאכלים שמורים',
    savedMealsTitle: 'ארוחות שמורות',
    emptyFoods: 'עדיין אין מאכלים שמורים — לחצו על הכוכב באיזה מאכל כדי לשמור אותו כאן.',
    emptyMeals: 'עדיין אין ארוחות שמורות — שמרו ארוחה ממסך הפרטים שלה כדי לראות אותה כאן.',
    removeAriaLabel: 'הסרה מהמועדפים',
  },
  ar: {
    ariaLabel: 'المفضلة',
    title: 'المفضلة لدي',
    savedFoodsTitle: 'أطعمة محفوظة',
    savedMealsTitle: 'وجبات محفوظة',
    emptyFoods: 'لا توجد أطعمة محفوظة بعد — اضغط على النجمة بجانب أي طعام لحفظه هنا.',
    emptyMeals: 'لا توجد وجبات محفوظة بعد — احفظ وجبة من شاشة تفاصيلها لتظهر هنا.',
    removeAriaLabel: 'إزالة من المفضلة',
  },
}
