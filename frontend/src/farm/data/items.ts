import type { ItemDef } from '../types'
import { CROPS } from './crops'
import { RECIPES } from './recipes'

const MAX_STACK = 999

/** Crafted goods. Their unlock level comes from the recipe that makes them. */
const PRODUCTS: Omit<ItemDef, 'requiredLevel' | 'xpValue'>[] = [
  { id: 'bread', name: { en: 'Bread', he: 'לחם', ar: 'خبز' }, icon: '🍞', category: 'product', sellValue: 15, maxStack: MAX_STACK },
  { id: 'cornBread', name: { en: 'Corn Bread', he: 'לחם תירס', ar: 'خبز الذرة' }, icon: '🥖', category: 'product', sellValue: 32, maxStack: MAX_STACK },
  { id: 'carrotPie', name: { en: 'Carrot Pie', he: 'פאי גזר', ar: 'فطيرة الجزر' }, icon: '🥧', category: 'product', sellValue: 62, maxStack: MAX_STACK },
  { id: 'strawberryCake', name: { en: 'Strawberry Cake', he: 'עוגת תות', ar: 'كعكة الفراولة' }, icon: '🍰', category: 'product', sellValue: 140, maxStack: MAX_STACK },
  { id: 'carrotJuice', name: { en: 'Carrot Juice', he: 'מיץ גזר', ar: 'عصير جزر' }, icon: '🧃', category: 'product', sellValue: 38, maxStack: MAX_STACK },
  { id: 'tomatoJuice', name: { en: 'Tomato Juice', he: 'מיץ עגבניות', ar: 'عصير طماطم' }, icon: '🥤', category: 'product', sellValue: 56, maxStack: MAX_STACK },
  { id: 'smoothie', name: { en: 'Strawberry Smoothie', he: 'שייק תות', ar: 'سموذي فراولة' }, icon: '🥛', category: 'product', sellValue: 112, maxStack: MAX_STACK },
  { id: 'cereal', name: { en: 'Cereal', he: 'דגני בוקר', ar: 'حبوب الإفطار' }, icon: '🥣', category: 'product', sellValue: 22, maxStack: MAX_STACK },
  { id: 'popcorn', name: { en: 'Popcorn', he: 'פופקורן', ar: 'فشار' }, icon: '🍿', category: 'product', sellValue: 34, maxStack: MAX_STACK },
  { id: 'veggieWrap', name: { en: 'Veggie Wrap', he: 'ראפ ירקות', ar: 'لفافة خضار' }, icon: '🌯', category: 'product', sellValue: 52, maxStack: MAX_STACK },
  { id: 'gardenSalad', name: { en: 'Garden Salad', he: 'סלט ירקות', ar: 'سلطة خضار' }, icon: '🥗', category: 'product', sellValue: 66, maxStack: MAX_STACK },
  { id: 'veggiePancakes', name: { en: 'Veggie Pancakes', he: 'לביבות ירקות', ar: 'فطائر خضار' }, icon: '🥞', category: 'product', sellValue: 90, maxStack: MAX_STACK },
  { id: 'tomatoSoup', name: { en: 'Tomato Soup', he: 'מרק עגבניות', ar: 'شوربة طماطم' }, icon: '🍲', category: 'product', sellValue: 82, maxStack: MAX_STACK },
  { id: 'cornSoup', name: { en: 'Corn Soup', he: 'מרק תירס', ar: 'شوربة ذرة' }, icon: '🍜', category: 'product', sellValue: 72, maxStack: MAX_STACK },
  { id: 'veggieStew', name: { en: 'Veggie Stew', he: 'תבשיל ירקות', ar: 'يخنة خضار' }, icon: '🥘', category: 'product', sellValue: 135, maxStack: MAX_STACK },
]

function productDef(p: (typeof PRODUCTS)[number]): ItemDef {
  const recipe = RECIPES.find((r) => r.output === p.id)
  return { ...p, requiredLevel: recipe?.requiredLevel ?? 1, xpValue: recipe?.xpReward ?? 1 }
}

export const ITEMS: ItemDef[] = [
  ...CROPS.map(
    (c): ItemDef => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      category: 'crop',
      sellValue: c.sellPrice,
      maxStack: MAX_STACK,
      requiredLevel: c.requiredLevel,
      xpValue: c.xpReward,
    }),
  ),
  ...PRODUCTS.map(productDef),
]

export const ITEMS_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]))
