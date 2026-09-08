export type NutrientBucket = 'vitamins' | 'protein' | 'carbs' | 'fats'

export const NUTRIENT_BUCKETS: NutrientBucket[] = ['vitamins', 'protein', 'carbs', 'fats']

/** Relative strength (1-10) per bucket a food has enough of to matter; buckets it's not a
 *  meaningful source of are simply omitted. */
export type NutrientScores = Partial<Record<NutrientBucket, number>>
