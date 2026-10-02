import type { Lang } from './lang'
import type { MealPurpose, SuperfoodCategory } from '../superfoods'
import type { NutrientId } from '../../types'

/** A run of plain text, or a mention of a tracked nutrient that can be tapped for an explanation. */
export type BenefitPart = string | { nutrient: NutrientId; label: string }

export interface SuperfoodContent {
  name: string
  /** Short, punchy "superpower" tag — the hook. Emoji goes at the end, after the text.
   *  Phrased directly ("Helps with...") — avoid both hedging ("may/might") and
   *  absolute promises ("keeps you...", "will protect you..."); these are food-fact
   *  hooks for a gamified feature, not medical claims. Every tag ties back to training:
   *  muscle building, recovery, workout energy, or hydration. */
  power: string
  /** The mechanism behind the power, broken into parts so any named vitamin/mineral can link to its explanation. */
  benefit: BenefitPart[]
}

export const SUPERFOOD_CONTENT: Record<Lang, Record<string, SuperfoodContent>> = {
  en: {
    chickenBreast: { name: 'Chicken Breast', power: 'Builds and repairs your muscles 💪', benefit: ['A lean, complete protein that gives your muscles what they need to grow and recover.'] },
    turkey: { name: 'Turkey', power: 'Fuels your muscles for training 🦃', benefit: ['Lean protein packed with ', { nutrient: 'vitaminB6', label: 'vitamin B6' }, ', which helps your body turn food into energy for training.'] },
    tuna: { name: 'Tuna', power: 'Refuels your muscles after training 🐟', benefit: ['Lean protein and omega-3 fat that help rebuild muscle and calm inflammation after a workout.'] },
    eggs: { name: 'Eggs', power: 'Gives your muscles complete protein 💪', benefit: ['A complete protein with all the amino acids your muscles need to rebuild after training.'] },
    yogurt: { name: 'Yogurt', power: 'Gives your muscles protein to rebuild 🥛', benefit: ['A great source of protein and ', { nutrient: 'calcium', label: 'calcium' }, ' that help repair muscle after training.'] },
    lentils: { name: 'Lentils', power: 'Plant protein for muscle repair 🌾', benefit: ['High in plant protein and fiber that give your muscles building blocks without excess fat.'] },
    chickpeas: { name: 'Chickpeas', power: 'Plant protein that keeps you fueled ⏳', benefit: ['High in plant protein and fiber, which keep you full and fuel your muscles through the day.'] },
    quinoa: { name: 'Quinoa', power: 'A complete plant protein for muscle 🌾', benefit: ['One of the few plant foods with all the amino acids your muscles need to grow.'] },

    salmon: { name: 'Salmon', power: 'Calms muscle inflammation after training 🐟', benefit: ['Rich in omega-3 fat that eases inflammation from exercise, plus protein to rebuild muscle.'] },
    walnuts: { name: 'Walnuts', power: 'Helps your muscles recover 🌰', benefit: ['Full of plant-based omega-3 fat that helps calm inflammation and support muscle recovery after a hard workout.'] },
    almonds: { name: 'Almonds', power: 'Helps prevent muscle cramps 🥜', benefit: ['Rich in ', { nutrient: 'magnesium', label: 'magnesium' }, ', which helps your muscles relax and recover after training.'] },
    avocado: { name: 'Avocado', power: 'Helps your muscles recover 🥑', benefit: ['Loaded with ', { nutrient: 'potassium', label: 'potassium' }, ' and healthy fat that help your muscles relax and recover after training.'] },
    blueberries: { name: 'Blueberries', power: 'Fights exercise soreness 🫐', benefit: ['Packed with antioxidants that help calm the muscle soreness training leaves behind.'] },
    spinach: { name: 'Spinach', power: 'Fuels your muscles with iron 🥬', benefit: ['Full of ', { nutrient: 'iron', label: 'iron' }, ', which carries oxygen to your muscles, plus ', { nutrient: 'vitaminK', label: 'vitamin K' }, ' for recovery.'] },
    kale: { name: 'Kale', power: 'Packed with recovery nutrients 🍃', benefit: ['One of the most nutrient-dense greens around, full of vitamins ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' and antioxidants that support recovery.'] },
    cherries: { name: 'Cherries', power: 'Eases muscle soreness after training 🍒', benefit: ['One of the few fruits with natural compounds shown to reduce muscle soreness after exercise.'] },
    pineapple: { name: 'Pineapple', power: 'Helps calm exercise inflammation 🍍', benefit: ['Contains bromelain, a natural enzyme that helps reduce swelling and inflammation after training.'] },
    ginger: { name: 'Ginger', power: 'Eases soreness after training 🫚', benefit: ['Contains natural compounds shown to reduce muscle soreness and inflammation after exercise.'] },
    bellPepper: { name: 'Bell Pepper', power: 'Helps repair connective tissue 🫑', benefit: ['One of the richest sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which your body uses to repair tendons and ligaments.'] },
    strawberries: { name: 'Strawberries', power: 'Fights exercise-induced soreness 🍓', benefit: ['Packed with ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' and antioxidants that help your body recover from hard training.'] },

    banana: { name: 'Banana', power: 'Quick energy before training ⚡', benefit: ['Packed with ', { nutrient: 'potassium', label: 'potassium' }, ' and fast carbs that fuel your muscles and help prevent cramping.'] },
    oats: { name: 'Oats', power: 'Steady energy for training 🥣', benefit: ['High in slow-release carbs that fuel a workout without a crash.'] },
    sweetPotato: { name: 'Sweet Potato', power: 'Slow-release fuel for training 🍠', benefit: ['Rich in complex carbs that give your muscles steady energy through a long workout.'] },
    coconut: { name: 'Coconut', power: 'Quick, clean energy before training 🥥', benefit: ['Contains a type of fat your body can turn into fast energy instead of storing it.'] },
    corn: { name: 'Corn', power: 'Gives you steady training energy 🌽', benefit: ['A good source of slow-release carbs that keep your energy steady through a workout.'] },
    grapes: { name: 'Grapes', power: 'Quick natural sugar for energy 🍇', benefit: ['Packed with fast natural sugars that give you a quick burst of energy before training.'] },
    apple: { name: 'Apple', power: 'Quick energy plus steady fiber 🍎', benefit: ['Natural sugar for quick energy plus fiber that helps it last through your workout.'] },
    mango: { name: 'Mango', power: 'Natural fuel before a workout 🥭', benefit: ['Rich in natural sugar and ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' that give you quick energy before training.'] },

    watermelon: { name: 'Watermelon', power: 'Rehydrates and eases soreness 🍉', benefit: ['Mostly water, plus a natural compound that helps your muscles recover after exercise.'] },
    cucumber: { name: 'Cucumber', power: 'Keeps you hydrated during training 🥒', benefit: ['Mostly water, which helps replace the fluid you lose while training.'] },
    orange: { name: 'Orange', power: 'Replaces fluids and electrolytes 🍊', benefit: ['High water content plus ', { nutrient: 'potassium', label: 'potassium' }, ' and ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' that help you rehydrate after training.'] },
    lemon: { name: 'Lemon', power: 'Great for hydrating during training 🍋', benefit: ['A squeeze in water adds electrolytes and ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' that help you stay hydrated through a workout.'] },

    oatmealBananaBowl: { name: 'Oatmeal with Banana', power: 'Fuel up before training ⚡', benefit: ['Slow carbs from the oats and fast carbs from the banana give you energy that lasts through your workout.'] },
    bananaPeanutButterToast: { name: 'Banana Peanut Butter Toast', power: 'Quick fuel before you train ⚡', benefit: ['Fast carbs from the banana and a little protein from the peanut butter give you energy to train on.'] },
    riceCakesWithAlmondButter: { name: 'Rice Cakes with Almond Butter', power: 'Light energy before training ⚡', benefit: ['Light, quick-digesting carbs from the rice cakes and healthy fat from the almond butter fuel you up without feeling heavy.'] },
    turkeyVeggieWrap: { name: 'Turkey & Veggie Wrap', power: 'Fuels you up before training ⚡', benefit: ['Lean protein and light carbs that give you energy without feeling heavy going into a workout.'] },

    proteinSmoothieBowl: { name: 'Protein Smoothie Bowl', power: 'Refuels your muscles after training 🔧', benefit: ['A mix of protein and fast carbs that helps your muscles start recovering right after a workout.'] },
    chocolateProteinShake: { name: 'Chocolate Protein Shake', power: 'Fast muscle recovery after training 🔧', benefit: ['A quick hit of protein your muscles can use right after training, with carbs to refill your energy.'] },
    recoveryChocolateMilk: { name: 'Chocolate Recovery Milk', power: 'Classic post-workout recovery 🔧', benefit: ['A classic mix of protein and carbs that helps refuel your muscles fast after a workout.'] },
    greekYogurtParfait: { name: 'Greek Yogurt Parfait', power: 'Easy recovery after training 🔧', benefit: ['Protein from the yogurt and antioxidants from the berries that help your muscles recover after a workout.'] },

    chickenSweetPotatoPlate: { name: 'Chicken & Sweet Potato Plate', power: 'Builds and repairs your muscles 💪', benefit: ['Lean protein alongside slow-release carbs that give your muscles what they need to grow.'] },
    steakVeggieStirFry: { name: 'Steak & Veggie Stir-Fry', power: 'Builds muscle and refuels iron 💪', benefit: ['Rich in protein and ', { nutrient: 'iron', label: 'iron' }, ' from the steak, alongside vitamin-packed veggies that support recovery.'] },
    beefBroccoliBowl: { name: 'Beef & Broccoli Bowl', power: 'Fuels muscle growth with protein and iron 💪', benefit: ['Lean beef and broccoli — protein and ', { nutrient: 'iron', label: 'iron' }, ' for your muscles, plus ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' for recovery.'] },
    eggWhiteVeggieScramble: { name: 'Egg White Veggie Scramble', power: 'Lean protein to build muscle 💪', benefit: ['Egg whites give you protein without excess fat, plus veggies with vitamins that support recovery.'] },

    salmonQuinoaBowl: { name: 'Salmon & Quinoa Bowl', power: 'Sustained energy for training days 🔥', benefit: ['Lean protein, healthy fat, and whole grains that give your body steady energy that lasts.'] },
    lentilSoupWholegrain: { name: 'Lentil Soup with Whole Grain Bread', power: 'Steady fuel through a long day 🔥', benefit: ['Plant protein and fiber that release energy slowly, plus ', { nutrient: 'iron', label: 'iron' }, ' that helps carry oxygen to your muscles.'] },
    quinoaChickpeaSalad: { name: 'Quinoa & Chickpea Salad', power: 'Keeps your energy steady all day 🔥', benefit: ['A complete plant protein that keeps you fueled with steady energy between training sessions.'] },
    chickenRiceBowl: { name: 'Chicken & Rice Bowl', power: 'Steady energy and muscle fuel 🔥', benefit: ['Lean protein from the chicken and slow-release carbs from the rice keep you fueled through training.'] },
  },
  he: {
    chickenBreast: { name: 'חזה עוף', power: 'בונה ומשקם את השרירים שלך 💪', benefit: ['חלבון רזה ומלא שנותן לשרירים שלך את מה שהם צריכים כדי לגדול ולהתאושש.'] },
    turkey: { name: 'הודו', power: 'נותן דלק לשרירים שלך לאימון 🦃', benefit: ['חלבון רזה עמוס ב', { nutrient: 'vitaminB6', label: 'ויטמין B6' }, ', שעוזר לגוף שלך להפוך אוכל לאנרגיה לאימון.'] },
    tuna: { name: 'טונה', power: 'ממלאת מחדש את השרירים שלך אחרי אימון 🐟', benefit: ['חלבון רזה ואומגה 3 שעוזרים לבנות שריר מחדש ולהרגיע דלקת אחרי אימון.'] },
    eggs: { name: 'ביצים', power: 'נותנות לשרירים שלך חלבון מלא 💪', benefit: ['חלבון מלא עם כל חומצות האמינו שהשרירים שלך צריכים כדי להיבנות מחדש אחרי אימון.'] },
    yogurt: { name: 'יוגורט', power: 'נותן לשרירים שלך חלבון לבנייה מחדש 🥛', benefit: ['מקור מצוין לחלבון ול', { nutrient: 'calcium', label: 'סידן' }, ' שעוזרים לשרירים שלך להתאושש אחרי אימון.'] },
    lentils: { name: 'עדשים', power: 'חלבון צמחי לשיקום השריר 🌾', benefit: ['עשירות בחלבון צמחי ובסיבים תזונתיים, שנותנים לשרירים שלך את אבני הבניין בלי שומן מיותר.'] },
    chickpeas: { name: 'חומוס (גרגירים)', power: 'חלבון צמחי ששומר עליך מתודלק ⏳', benefit: ['עשירים בחלבון צמחי ובסיבים, ששומרים עליך שבע ומזינים את השרירים שלך במהלך היום.'] },
    quinoa: { name: 'קינואה', power: 'חלבון צמחי מלא לבניית שריר 🌾', benefit: ['אחד ממאכלי הצומח הבודדים עם כל חומצות האמינו שהשרירים שלך צריכים כדי לגדול.'] },

    salmon: { name: 'סלמון', power: 'מרגיע דלקת בשרירים אחרי אימון 🐟', benefit: ['עשיר באומגה 3 שמרגיעה דלקת מפעילות גופנית, בתוספת חלבון לבניית השריר מחדש.'] },
    walnuts: { name: 'אגוזי מלך', power: 'עוזרים לשרירים שלך להתאושש 🌰', benefit: ['עשירים בשומן אומגה 3 מהצומח שעוזר להרגיע דלקת ולתמוך בהתאוששות השריר אחרי אימון קשה.'] },
    almonds: { name: 'שקדים', power: 'עוזרים למנוע התכווצויות שריר 🥜', benefit: ['עשירים ב', { nutrient: 'magnesium', label: 'מגנזיום' }, ', שעוזר לשרירים שלך להירגע ולהתאושש אחרי אימון.'] },
    avocado: { name: 'אבוקדו', power: 'עוזר לשרירים שלך להתאושש 🥑', benefit: ['עשיר ב', { nutrient: 'potassium', label: 'אשלגן' }, ' ובשומן בריא שעוזרים לשרירים שלך להירגע ולהתאושש אחרי אימון.'] },
    blueberries: { name: 'אוכמניות', power: 'נלחמות בכאבי שרירים מאימון 🫐', benefit: ['עמוסות בנוגדי חמצון שעוזרים להרגיע את כאבי השרירים שהאימון משאיר אחריו.'] },
    spinach: { name: 'תרד', power: 'מזין את השרירים שלך בברזל 🥬', benefit: ['עשיר ב', { nutrient: 'iron', label: 'ברזל' }, ', שמעביר חמצן לשרירים שלך, בתוספת ', { nutrient: 'vitaminK', label: 'ויטמין K' }, ' להתאוששות.'] },
    kale: { name: 'קייל', power: 'עמוס בערכים תזונתיים להתאוששות 🍃', benefit: ['אחד הירקות העשירים ביותר בערכים תזונתיים, עמוס בוויטמינים ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' ונוגדי חמצון שתומכים בהתאוששות.'] },
    cherries: { name: 'דובדבנים', power: 'מקלים על כאבי שרירים אחרי אימון 🍒', benefit: ['אחד הפירות היחידים עם חומרים טבעיים שמפחיתים כאבי שרירים אחרי פעילות גופנית.'] },
    pineapple: { name: 'אננס', power: 'עוזר להרגיע דלקת מפעילות גופנית 🍍', benefit: ['מכיל ברומלין, אנזים טבעי שעוזר להפחית נפיחות ודלקת אחרי אימון.'] },
    ginger: { name: 'ג׳ינג׳ר', power: 'מקל על כאבי שרירים אחרי אימון 🫚', benefit: ['מכיל חומרים טבעיים שמפחיתים כאבי שרירים ודלקת אחרי פעילות גופנית.'] },
    bellPepper: { name: 'פלפל מתוק', power: 'עוזר לתקן רקמת חיבור 🫑', benefit: ['אחד המקורות העשירים ביותר ל', { nutrient: 'vitaminC', label: 'ויטמין C' }, ', שהגוף שלך משתמש בו לתיקון גידים ורצועות.'] },
    strawberries: { name: 'תותים', power: 'נלחמים בכאבי שרירים מאימון 🍓', benefit: ['עמוסים ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' ובנוגדי חמצון שעוזרים לגוף שלך להתאושש מאימון קשה.'] },

    banana: { name: 'בננה', power: 'אנרגיה מהירה לפני אימון ⚡', benefit: ['עמוסה ב', { nutrient: 'potassium', label: 'אשלגן' }, ' ובפחמימות מהירות שמזינות את השרירים שלך ועוזרות למנוע התכווצויות.'] },
    oats: { name: 'שיבולת שועל', power: 'אנרגיה יציבה לאימון 🥣', benefit: ['עשירה בפחמימות שמשתחררות לאט ומזינות את האימון בלי קריסת אנרגיה.'] },
    sweetPotato: { name: 'בטטה', power: 'דלק שמשתחרר לאט לאימון 🍠', benefit: ['עשירה בפחמימות מורכבות שנותנות לשרירים שלך אנרגיה יציבה לאורך אימון ארוך.'] },
    coconut: { name: 'קוקוס', power: 'אנרגיה נקייה ומהירה לפני אימון 🥥', benefit: ['מכיל סוג שומן שהגוף שלך יכול להפוך לאנרגיה מהירה במקום לאחסן אותו.'] },
    corn: { name: 'תירס', power: 'נותן לך אנרגיה יציבה לאימון 🌽', benefit: ['מקור טוב לפחמימות שמשתחררות לאט ושומרות על אנרגיה יציבה במהלך האימון.'] },
    grapes: { name: 'ענבים', power: 'סוכר טבעי מהיר לאנרגיה 🍇', benefit: ['עמוסים בסוכרים טבעיים מהירים שנותנים לך פרץ אנרגיה מהיר לפני אימון.'] },
    apple: { name: 'תפוח', power: 'אנרגיה מהירה בתוספת סיבים 🍎', benefit: ['סוכר טבעי לאנרגיה מהירה בתוספת סיבים תזונתיים שעוזרים לה להימשך לאורך האימון.'] },
    mango: { name: 'מנגו', power: 'דלק טבעי לפני אימון 🥭', benefit: ['עשיר בסוכר טבעי וב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' שנותנים לך אנרגיה מהירה לפני אימון.'] },

    watermelon: { name: 'אבטיח', power: 'מחזיר נוזלים ומקל על כאבי שרירים 🍉', benefit: ['בעיקר מים, בתוספת חומר טבעי שעוזר לשרירים שלך להתאושש אחרי פעילות גופנית.'] },
    cucumber: { name: 'מלפפון', power: 'שומר עליך רווי מים באימון 🥒', benefit: ['בעיקר מים, מה שעוזר להחזיר את הנוזלים שאתה מאבד באימון.'] },
    orange: { name: 'תפוז', power: 'מחזיר נוזלים ואלקטרוליטים 🍊', benefit: ['תכולת מים גבוהה בתוספת ', { nutrient: 'potassium', label: 'אשלגן' }, ' ו', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' שעוזרים לך להחזיר נוזלים אחרי אימון.'] },
    lemon: { name: 'לימון', power: 'מצוין להידרציה באימון 🍋', benefit: ['סחיטה קטנה במים מוסיפה אלקטרוליטים ו', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' שעוזרים לך להישאר רווי מים במהלך האימון.'] },

    oatmealBananaBowl: { name: 'שיבולת שועל עם בננה', power: 'מתדלק אותך לפני אימון ⚡', benefit: ['פחמימות איטיות משיבולת השועל ופחמימות מהירות מהבננה, שנותנות לך אנרגיה שנמשכת לאורך האימון.'] },
    bananaPeanutButterToast: { name: 'טוסט בננה וחמאת בוטנים', power: 'דלק מהיר לפני האימון ⚡', benefit: ['פחמימות מהירות מהבננה וקצת חלבון מחמאת הבוטנים, שנותנים לך אנרגיה להתאמן איתה.'] },
    riceCakesWithAlmondButter: { name: 'פריכיות אורז עם ממרח שקדים', power: 'אנרגיה קלילה לפני אימון ⚡', benefit: ['פחמימות קלות ומתעכלות מהר מהפריכיות ושומן בריא מממרח השקדים, שמתדלקים אותך בלי כובד.'] },
    turkeyVeggieWrap: { name: 'רול הודו עם ירקות', power: 'מתדלק אותך לפני אימון ⚡', benefit: ['חלבון רזה ופחמימות קלות שנותנים לך אנרגיה בלי כובד לפני האימון.'] },

    proteinSmoothieBowl: { name: 'קערת סמוזי חלבון', power: 'ממלאת מחדש את השרירים שלך אחרי אימון 🔧', benefit: ['שילוב של חלבון ופחמימות מהירות שעוזר לשרירים שלך להתחיל להתאושש מיד אחרי האימון.'] },
    chocolateProteinShake: { name: 'שייק חלבון שוקולד', power: 'התאוששות מהירה של השרירים אחרי אימון 🔧', benefit: ['מנת חלבון מהירה שהשרירים שלך יכולים להשתמש בה מיד אחרי אימון, בתוספת פחמימות למילוי האנרגיה.'] },
    recoveryChocolateMilk: { name: 'חלב שוקולד להתאוששות', power: 'התאוששות קלאסית אחרי אימון 🔧', benefit: ['שילוב קלאסי של חלבון ופחמימות שעוזר למלא מחדש את השרירים שלך במהירות אחרי אימון.'] },
    greekYogurtParfait: { name: 'יוגורט יווני עם פירות יער', power: 'התאוששות קלה אחרי אימון 🔧', benefit: ['חלבון מהיוגורט ונוגדי חמצון מהפירות, שעוזרים לשרירים שלך להתאושש אחרי אימון.'] },

    chickenSweetPotatoPlate: { name: 'חזה עוף עם בטטה וברוקולי', power: 'בונה ומשקם את השרירים שלך 💪', benefit: ['חלבון רזה לצד פחמימה שמשתחררת לאט, שנותנים לשרירים שלך את מה שהם צריכים כדי לגדול.'] },
    steakVeggieStirFry: { name: 'סטייק עם ירקות מוקפצים', power: 'בונה שריר ומחזיר ברזל 💪', benefit: ['עשיר בחלבון ו', { nutrient: 'iron', label: 'ברזל' }, ' מהסטייק, לצד ירקות עמוסי ויטמינים שתומכים בהתאוששות.'] },
    beefBroccoliBowl: { name: 'קערת בקר וברוקולי', power: 'מזין את צמיחת השריר בחלבון וברזל 💪', benefit: ['בקר רזה וברוקולי - חלבון ו', { nutrient: 'iron', label: 'ברזל' }, ' לשרירים שלך, בתוספת ', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' להתאוששות.'] },
    eggWhiteVeggieScramble: { name: 'חביתת חלבונים עם ירקות', power: 'חלבון רזה לבניית שריר 💪', benefit: ['חלבוני ביצה שנותנים לך חלבון בלי שומן מיותר, בתוספת ירקות עמוסי ויטמינים שתומכים בהתאוששות.'] },

    salmonQuinoaBowl: { name: 'קערת סלמון וקינואה', power: 'אנרגיה מתמשכת לימי אימון 🔥', benefit: ['חלבון רזה, שומן בריא ודגן מלא, שנותנים לגוף שלך אנרגיה יציבה שנמשכת.'] },
    lentilSoupWholegrain: { name: 'מרק עדשים עם לחם מלא', power: 'דלק יציב ליום ארוך 🔥', benefit: ['חלבון צמחי וסיבים שמשתחררים לאט לאנרגיה, בתוספת ', { nutrient: 'iron', label: 'ברזל' }, ' שעוזר להעביר חמצן לשרירים שלך.'] },
    quinoaChickpeaSalad: { name: 'סלט קינואה וחומוס', power: 'שומר על אנרגיה יציבה כל היום 🔥', benefit: ['חלבון צמחי מלא ששומר עליך מתודלק באנרגיה יציבה בין האימונים.'] },
    chickenRiceBowl: { name: 'קערת עוף עם אורז', power: 'אנרגיה יציבה ודלק לשרירים 🔥', benefit: ['חלבון רזה מהעוף ופחמימות שמשתחררות לאט מהאורז, ששומרות עליך מתודלק במהלך האימון.'] },
  },
  ar: {
    chickenBreast: { name: 'صدر دجاج', power: 'يبني ويصلح عضلاتك 💪', benefit: ['بروتين كامل قليل الدهون يمنح عضلاتك ما تحتاجه للنمو والتعافي.'] },
    turkey: { name: 'ديك رومي', power: 'يمد عضلاتك بالطاقة للتمرين 🦃', benefit: ['بروتين قليل الدهون غني ب', { nutrient: 'vitaminB6', label: 'فيتامين B6' }, '، الذي يساعد جسمك على تحويل الطعام إلى طاقة للتمرين.'] },
    tuna: { name: 'تونة', power: 'تعيد تزويد عضلاتك بالطاقة بعد التمرين 🐟', benefit: ['بروتين قليل الدهون وأوميغا 3 يساعدان على إعادة بناء العضلات وتهدئة الالتهاب بعد التمرين.'] },
    eggs: { name: 'بيض', power: 'يمنح عضلاتك بروتينًا كاملًا 💪', benefit: ['بروتين كامل يحتوي على جميع الأحماض الأمينية التي تحتاجها عضلاتك لإعادة البناء بعد التمرين.'] },
    yogurt: { name: 'زبادي', power: 'يمنح عضلاتك بروتينًا لإعادة البناء 🥛', benefit: ['مصدر رائع للبروتين وال', { nutrient: 'calcium', label: 'كالسيوم' }, ' الذين يساعدان على إصلاح العضلات بعد التمرين.'] },
    lentils: { name: 'عدس', power: 'بروتين نباتي لإصلاح العضلات 🌾', benefit: ['غني بالبروتين النباتي والألياف التي تمنح عضلاتك مواد البناء بدون دهون زائدة.'] },
    chickpeas: { name: 'حمص', power: 'بروتين نباتي يبقيك ممتلئًا بالطاقة ⏳', benefit: ['غني بالبروتين النباتي والألياف، التي تبقيك ممتلئًا وتغذي عضلاتك خلال اليوم.'] },
    quinoa: { name: 'كينوا', power: 'بروتين نباتي كامل لبناء العضلات 🌾', benefit: ['من الأطعمة النباتية القليلة التي تحتوي على جميع الأحماض الأمينية التي تحتاجها عضلاتك للنمو.'] },

    salmon: { name: 'سلمون', power: 'يهدئ التهاب العضلات بعد التمرين 🐟', benefit: ['غني بأوميغا 3 التي تخفف الالتهاب الناتج عن التمرين، بالإضافة إلى بروتين لإعادة بناء العضلات.'] },
    walnuts: { name: 'جوز', power: 'يساعد عضلاتك على التعافي 🌰', benefit: ['غني بأوميغا 3 النباتية التي تساعد على تهدئة الالتهاب ودعم تعافي العضلات بعد تمرين شاق.'] },
    almonds: { name: 'لوز', power: 'يساعد على منع تقلصات العضلات 🥜', benefit: ['غني ب', { nutrient: 'magnesium', label: 'المغنيسيوم' }, '، الذي يساعد عضلاتك على الاسترخاء والتعافي بعد التمرين.'] },
    avocado: { name: 'أفوكادو', power: 'يساعد عضلاتك على التعافي 🥑', benefit: ['غني ب', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' والدهون الصحية التي تساعد عضلاتك على الاسترخاء والتعافي بعد التمرين.'] },
    blueberries: { name: 'توت أزرق', power: 'تقاوم آلام العضلات بعد التمرين 🫐', benefit: ['غنية بمضادات الأكسدة التي تساعد على تهدئة آلام العضلات التي يتركها التمرين.'] },
    spinach: { name: 'سبانخ', power: 'يغذي عضلاتك بالحديد 🥬', benefit: ['غني ب', { nutrient: 'iron', label: 'الحديد' }, ' الذي ينقل الأكسجين إلى عضلاتك، بالإضافة إلى ', { nutrient: 'vitaminK', label: 'فيتامين K' }, ' للتعافي.'] },
    kale: { name: 'كرنب مجعد (كيل)', power: 'غني بعناصر التعافي 🍃', benefit: ['من أكثر الخضروات غنى بالعناصر الغذائية، غني بفيتامينات ', { nutrient: 'vitaminA', label: 'A' }, ' و', { nutrient: 'vitaminC', label: 'C' }, ' و', { nutrient: 'vitaminK', label: 'K' }, ' ومضادات الأكسدة التي تدعم التعافي.'] },
    cherries: { name: 'كرز', power: 'يخفف آلام العضلات بعد التمرين 🍒', benefit: ['من الفواكه القليلة التي تحتوي على مواد طبيعية تقلل آلام العضلات بعد التمرين.'] },
    pineapple: { name: 'أناناس', power: 'يساعد على تهدئة الالتهاب بعد التمرين 🍍', benefit: ['يحتوي على البروميلين، إنزيم طبيعي يساعد على تقليل التورم والالتهاب بعد التمرين.'] },
    ginger: { name: 'زنجبيل', power: 'يخفف الألم بعد التمرين 🫚', benefit: ['يحتوي على مواد طبيعية تقلل آلام العضلات والالتهاب بعد التمرين.'] },
    bellPepper: { name: 'فلفل حلو', power: 'يساعد على إصلاح النسيج الضام 🫑', benefit: ['من أغنى مصادر ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' الذي يستخدمه جسمك لإصلاح الأوتار والأربطة.'] },
    strawberries: { name: 'فراولة', power: 'تقاوم آلام العضلات بعد التمرين 🍓', benefit: ['غنية ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' ومضادات الأكسدة التي تساعد جسمك على التعافي من تمرين شاق.'] },

    banana: { name: 'موز', power: 'طاقة سريعة قبل التمرين ⚡', benefit: ['غني ب', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' والكربوهيدرات السريعة التي تغذي عضلاتك وتساعد على منع التقلصات.'] },
    oats: { name: 'شوفان', power: 'طاقة ثابتة للتمرين 🥣', benefit: ['غني بالكربوهيدرات بطيئة الإطلاق التي تغذي التمرين دون انهيار في الطاقة.'] },
    sweetPotato: { name: 'بطاطا حلوة', power: 'وقود بطيء الإطلاق للتمرين 🍠', benefit: ['غنية بالكربوهيدرات المعقدة التي تمنح عضلاتك طاقة ثابتة طوال تمرين طويل.'] },
    coconut: { name: 'جوز الهند', power: 'طاقة نظيفة وسريعة قبل التمرين 🥥', benefit: ['يحتوي على نوع من الدهون يستطيع جسمك تحويله إلى طاقة سريعة بدلاً من تخزينه.'] },
    corn: { name: 'ذرة', power: 'يمنحك طاقة ثابتة للتمرين 🌽', benefit: ['مصدر جيد للكربوهيدرات بطيئة الإطلاق التي تحافظ على طاقتك ثابتة خلال التمرين.'] },
    grapes: { name: 'عنب', power: 'سكر طبيعي سريع للطاقة 🍇', benefit: ['غني بالسكريات الطبيعية السريعة التي تمنحك دفعة طاقة سريعة قبل التمرين.'] },
    apple: { name: 'تفاح', power: 'طاقة سريعة مع ألياف ثابتة 🍎', benefit: ['سكر طبيعي لطاقة سريعة بالإضافة إلى ألياف تساعد على استمرارها طوال التمرين.'] },
    mango: { name: 'مانجو', power: 'وقود طبيعي قبل التمرين 🥭', benefit: ['غني بالسكر الطبيعي و', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' الذين يمنحانك طاقة سريعة قبل التمرين.'] },

    watermelon: { name: 'بطيخ', power: 'يعيد الترطيب ويخفف الألم 🍉', benefit: ['أغلبه ماء، بالإضافة إلى مادة طبيعية تساعد عضلاتك على التعافي بعد التمرين.'] },
    cucumber: { name: 'خيار', power: 'يحافظ على ترطيبك أثناء التمرين 🥒', benefit: ['أغلبه ماء، وهذا يساعد على تعويض السوائل التي تفقدها أثناء التمرين.'] },
    orange: { name: 'برتقال', power: 'يعيد السوائل والإلكتروليتات 🍊', benefit: ['محتوى مائي مرتفع بالإضافة إلى ', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' و', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' اللذين يساعدانك على إعادة الترطيب بعد التمرين.'] },
    lemon: { name: 'ليمون', power: 'رائع للترطيب أثناء التمرين 🍋', benefit: ['إضافة عصيره للماء تمنحك إلكتروليتات و', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' يساعدانك على الحفاظ على ترطيبك خلال التمرين.'] },

    oatmealBananaBowl: { name: 'شوفان بالموز', power: 'يزودك بالطاقة قبل التمرين ⚡', benefit: ['كربوهيدرات بطيئة من الشوفان وكربوهيدرات سريعة من الموز تمنحك طاقة تدوم طوال التمرين.'] },
    bananaPeanutButterToast: { name: 'توست الموز وزبدة الفول السوداني', power: 'وقود سريع قبل التمرين ⚡', benefit: ['كربوهيدرات سريعة من الموز وقليل من البروتين من زبدة الفول السوداني يمنحانك طاقة للتمرين.'] },
    riceCakesWithAlmondButter: { name: 'فطائر أرز مع زبدة اللوز', power: 'طاقة خفيفة قبل التمرين ⚡', benefit: ['كربوهيدرات خفيفة سريعة الهضم من فطائر الأرز ودهون صحية من زبدة اللوز تزودك بالطاقة دون ثقل.'] },
    turkeyVeggieWrap: { name: 'راب ديك رومي مع خضار', power: 'يزودك بالطاقة قبل التمرين ⚡', benefit: ['بروتين قليل الدهون وكربوهيدرات خفيفة تمنحك طاقة دون ثقل قبل التمرين.'] },

    proteinSmoothieBowl: { name: 'كوب سموذي بروتين', power: 'يعيد تزويد عضلاتك بعد التمرين 🔧', benefit: ['مزيج من البروتين والكربوهيدرات السريعة يساعد عضلاتك على بدء التعافي مباشرة بعد التمرين.'] },
    chocolateProteinShake: { name: 'مخفوق بروتين بالشوكولاتة', power: 'تعافي سريع للعضلات بعد التمرين 🔧', benefit: ['جرعة بروتين سريعة يمكن لعضلاتك استخدامها مباشرة بعد التمرين، مع كربوهيدرات لتجديد طاقتك.'] },
    recoveryChocolateMilk: { name: 'حليب الشوكولاتة للتعافي', power: 'تعافي كلاسيكي بعد التمرين 🔧', benefit: ['مزيج كلاسيكي من البروتين والكربوهيدرات يساعد على إعادة تزويد عضلاتك بسرعة بعد التمرين.'] },
    greekYogurtParfait: { name: 'زبادي يوناني مع توت', power: 'تعافي سهل بعد التمرين 🔧', benefit: ['بروتين من الزبادي ومضادات أكسدة من التوت يساعدان عضلاتك على التعافي بعد التمرين.'] },

    chickenSweetPotatoPlate: { name: 'صدر دجاج مع بطاطا حلوة وبروكلي', power: 'يبني ويصلح عضلاتك 💪', benefit: ['بروتين قليل الدهون إلى جانب كربوهيدرات بطيئة الإطلاق تمنح عضلاتك ما تحتاجه للنمو.'] },
    steakVeggieStirFry: { name: 'ستيك مع خضار مقلية', power: 'يبني العضلات ويعيد الحديد 💪', benefit: ['غني بالبروتين وال', { nutrient: 'iron', label: 'حديد' }, ' من الستيك، إلى جانب خضار غنية بالفيتامينات تدعم التعافي.'] },
    beefBroccoliBowl: { name: 'وعاء لحم بقري مع بروكلي', power: 'يغذي نمو العضلات بالبروتين والحديد 💪', benefit: ['لحم بقري قليل الدهون وبروكلي - بروتين و', { nutrient: 'iron', label: 'حديد' }, ' لعضلاتك، بالإضافة إلى ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' للتعافي.'] },
    eggWhiteVeggieScramble: { name: 'عجة بياض البيض مع الخضار', power: 'بروتين قليل الدهون لبناء العضلات 💪', benefit: ['بياض البيض يمنحك بروتينًا دون دهون زائدة، بالإضافة إلى خضار غنية بالفيتامينات تدعم التعافي.'] },

    salmonQuinoaBowl: { name: 'سلمون مع كينوا', power: 'طاقة مستمرة لأيام التمرين 🔥', benefit: ['بروتين قليل الدهون ودهون صحية وحبوب كاملة تمنح جسمك طاقة ثابتة تدوم.'] },
    lentilSoupWholegrain: { name: 'شوربة عدس مع خبز كامل', power: 'وقود ثابت ليوم طويل 🔥', benefit: ['بروتين نباتي وألياف تطلق الطاقة ببطء، بالإضافة إلى ', { nutrient: 'iron', label: 'الحديد' }, ' الذي يساعد على نقل الأكسجين إلى عضلاتك.'] },
    quinoaChickpeaSalad: { name: 'سلطة كينوا وحمص', power: 'يحافظ على طاقتك ثابتة طوال اليوم 🔥', benefit: ['بروتين نباتي كامل يبقيك مزودًا بطاقة ثابتة بين جلسات التمرين.'] },
    chickenRiceBowl: { name: 'وعاء دجاج مع أرز', power: 'طاقة ثابتة ووقود للعضلات 🔥', benefit: ['بروتين قليل الدهون من الدجاج وكربوهيدرات بطيئة الإطلاق من الأرز تحافظ على تزويدك بالطاقة خلال التمرين.'] },
  },
}

interface SuperfoodsPanelChrome {
  todaysSuperfood: string
  filterAll: string
  categories: Record<SuperfoodCategory, string>
  noItemsInCategory: string
  searchPlaceholder: string
  save: string
  unsave: string
  likedCategory: string
  savedMealsTitle: string
  recentlyEatenTitle: string
  mainTabs: { singleFood: string; meals: string }
  mealPurposeAll: string
  mealPurposes: Record<MealPurpose, string>
}

export const SUPERFOODS_PANEL_CHROME: Record<Lang, SuperfoodsPanelChrome> = {
  en: {
    todaysSuperfood: "Today's Superfood",
    filterAll: 'All',
    categories: { muscleBuilding: 'Muscle Building', recovery: 'Recovery', energy: 'Energy', hydration: 'Hydration', meal: 'Meals' },
    noItemsInCategory: 'Nothing in this category yet.',
    searchPlaceholder: 'Search food...',
    save: 'Save',
    unsave: 'Unsave',
    likedCategory: 'Foods I liked',
    savedMealsTitle: 'Saved meals',
    recentlyEatenTitle: 'Recently eaten',
    mainTabs: { singleFood: 'Single Foods', meals: 'Meals' },
    mealPurposeAll: 'All',
    mealPurposes: { preWorkout: 'Pre-Workout', postWorkout: 'Post-Workout', muscleBuilding: 'Muscle Building', endurance: 'Endurance' },
  },
  he: {
    todaysSuperfood: 'מאכל העל של היום',
    filterAll: 'הכל',
    categories: { muscleBuilding: 'בניית שריר', recovery: 'התאוששות', energy: 'אנרגיה', hydration: 'הידרציה', meal: 'ארוחות' },
    noItemsInCategory: 'אין עדיין פריטים בקטגוריה הזו.',
    searchPlaceholder: 'חיפוש מזון...',
    save: 'שמירה',
    unsave: 'הסרה מהשמורים',
    likedCategory: 'מאכלים שאהבתי',
    savedMealsTitle: 'ארוחות שמורות',
    recentlyEatenTitle: 'נאכל לאחרונה',
    mainTabs: { singleFood: 'מאכלים', meals: 'ארוחות' },
    mealPurposeAll: 'הכל',
    mealPurposes: { preWorkout: 'לפני אימון', postWorkout: 'אחרי אימון', muscleBuilding: 'בניית שריר', endurance: 'סבולת' },
  },
  ar: {
    todaysSuperfood: 'الطعام الخارق لليوم',
    filterAll: 'الكل',
    categories: { muscleBuilding: 'بناء العضلات', recovery: 'التعافي', energy: 'الطاقة', hydration: 'الترطيب', meal: 'وجبات' },
    noItemsInCategory: 'لا توجد عناصر في هذه الفئة بعد.',
    searchPlaceholder: 'ابحث عن طعام...',
    save: 'حفظ',
    unsave: 'إزالة الحفظ',
    likedCategory: 'الأطعمة التي أعجبتني',
    savedMealsTitle: 'وجبات محفوظة',
    recentlyEatenTitle: 'أُكلت مؤخرًا',
    mainTabs: { singleFood: 'أطعمة فردية', meals: 'وجبات' },
    mealPurposeAll: 'الكل',
    mealPurposes: { preWorkout: 'قبل التمرين', postWorkout: 'بعد التمرين', muscleBuilding: 'بناء العضلات', endurance: 'التحمل' },
  },
}
