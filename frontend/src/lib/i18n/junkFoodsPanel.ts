import type { Lang } from './lang'

export interface JunkFoodContent {
  name: string
  /** Short, punchy warning — the hook. Emoji goes at the end, after the text. */
  power: string
  /** Plain-language explanation of what this does to your body. */
  benefit: string
}

export const JUNK_FOOD_CONTENT: Record<Lang, Record<string, JunkFoodContent>> = {
  en: {
    soda: { name: 'Soda', power: 'Spikes your blood sugar fast 📉', benefit: "It's pure sugar with no real nutrients. Your blood sugar shoots up, then crashes hard, and the extra sugar gets stored as fat over time." },
    candy: { name: 'Candy', power: 'Gives you a quick sugar crash 🍬', benefit: "Almost all sugar and nothing your body actually needs. It gives you a short burst of energy, then leaves you tired and craving more." },
    fries: { name: 'French Fries', power: 'Loads you with bad fat and salt 🍟', benefit: "Deep-fried in oil that's hard on your heart, plus a lot of salt. Eating this often raises your risk of weight gain and high blood pressure." },
    donut: { name: 'Donut', power: 'Fried dough soaked in sugar 🍩', benefit: 'Fried and sugar-coated with almost no nutrients. It gives you a fast energy spike that crashes soon after, and the fat sticks around.' },
    burger: { name: 'Fast Food Burger', power: 'Heavy on salt and saturated fat 🍔', benefit: 'Processed meat, cheese and sauce add up to a lot of salt and unhealthy fat. Too much of this strains your heart over time.' },
    iceCream: { name: 'Ice Cream', power: 'A sugar and fat combo that adds up fast 🍦', benefit: "It's mostly sugar and cream, so the calories stack up quickly without filling you up or giving your body much nutrition." },
    energyDrink: { name: 'Energy Drink', power: 'Overloads you with sugar and caffeine ⚡', benefit: 'The mix of sugar and caffeine gives you a fast crash after the buzz, and can raise your heart rate and mess with your sleep.' },
    instantNoodles: { name: 'Instant Noodles', power: 'Packed with salt and barely any nutrients 🍜', benefit: "It's mostly refined carbs and sodium, so it fills your stomach without giving your body what it actually needs." },
    pastry: { name: 'Sweet Pastry', power: 'Sugar and fat with almost nothing else 🥐', benefit: "It's made with butter and sugar, so it's high in calories but low in anything your body can really use." },
    friedChicken: { name: 'Fried Chicken', power: 'Deep-fried and heavy on your body 🍗', benefit: 'The crispy coating soaks up a lot of oil, adding a lot of unhealthy fat on top of the meat itself.' },
    cookies: { name: 'Cookies', power: 'Sugar and fat, not much else 🍪', benefit: 'Mostly flour, sugar and butter, so you get a lot of calories without much nutrition in return.' },
    cake: { name: 'Cake', power: 'A big hit of sugar and fat at once 🍰', benefit: "Between the frosting and the sponge, it's a heavy dose of sugar and fat in one slice — easy to overeat." },
  },
  he: {
    soda: { name: 'משקה מוגז', power: 'מעלה לך את הסוכר בדם מהר 📉', benefit: 'זה בעצם סוכר טהור בלי שום ערך תזונתי. רמת הסוכר בדם קופצת ואז צונחת, וכל הסוכר העודף הופך עם הזמן לשומן.' },
    candy: { name: 'ממתקים', power: 'נותן לך קריסת אנרגיה מהירה 🍬', benefit: 'כמעט הכל סוכר וכלום שהגוף שלך באמת צריך. זה נותן קפיצת אנרגיה קצרה ואז משאיר אותך עייף ומתחשק עוד.' },
    fries: { name: 'צ׳יפס', power: 'מעמיס עליך שומן רע ומלח 🍟', benefit: 'מטוגן בשמן שקשה ללב שלך, ובתוספת הרבה מלח. אכילה תכופה של זה מעלה את הסיכון לעלייה במשקל וללחץ דם גבוה.' },
    donut: { name: 'דונאט', power: 'בצק מטוגן שרוי בסוכר 🍩', benefit: 'מטוגן ומצופה סוכר, כמעט בלי ערך תזונתי. זה נותן קפיצת אנרגיה מהירה שצונחת מהר, והשומן נשאר.' },
    burger: { name: 'המבורגר מהיר', power: 'עמוס במלח ובשומן רווי 🍔', benefit: 'בשר מעובד, גבינה ורטבים מצטברים להרבה מלח ושומן לא בריא. יותר מדי מזה מעמיס על הלב שלך עם הזמן.' },
    iceCream: { name: 'גלידה', power: 'שילוב של סוכר ושומן שמצטבר מהר 🍦', benefit: 'זה בעיקר סוכר ושמנת, אז הקלוריות מצטברות מהר בלי להשביע אותך או לתת לגוף שלך ערך תזונתי אמיתי.' },
    energyDrink: { name: 'משקה אנרגיה', power: 'מציף אותך בסוכר ובקפאין ⚡', benefit: 'השילוב של סוכר וקפאין נותן קריסה מהירה אחרי הבוסט, ויכול להעלות לך את קצב הלב ולפגוע בשינה.' },
    instantNoodles: { name: 'נודלס מיידי', power: 'עמוס במלח וכמעט בלי ערך תזונתי 🍜', benefit: 'זה בעיקר פחמימות מזוקקות ונתרן, אז זה ממלא את הבטן בלי לתת לגוף שלך את מה שהוא באמת צריך.' },
    pastry: { name: 'מאפה מתוק', power: 'סוכר ושומן וכמעט שום דבר אחר 🥐', benefit: 'זה עשוי מחמאה וסוכר, אז יש בו הרבה קלוריות אבל מעט מאוד ערך תזונתי אמיתי.' },
    friedChicken: { name: 'עוף מטוגן', power: 'מטוגן עמוק ומעמיס על הגוף שלך 🍗', benefit: 'הציפוי הפריך סופג הרבה שמן, ומוסיף המון שומן לא בריא מעל הבשר עצמו.' },
    cookies: { name: 'עוגיות', power: 'סוכר ושומן וכמעט כלום מעבר לזה 🍪', benefit: 'בעיקר קמח, סוכר וחמאה, אז אתה מקבל הרבה קלוריות בתמורה למעט מאוד ערך תזונתי.' },
    cake: { name: 'עוגה', power: 'מכה גדולה של סוכר ושומן בבת אחת 🍰', benefit: 'בין הציפוי לבצק, זו מנה כבדה של סוכר ושומן בפרוסה אחת - קל לאכול יותר מדי ממנה.' },
  },
  ar: {
    soda: { name: 'مشروب غازي', power: 'يرفع سكر الدم بسرعة 📉', benefit: 'إنه سكر خالص بدون أي قيمة غذائية حقيقية. سكر الدم يرتفع بسرعة ثم ينخفض بشدة، والسكر الزائد يتحول إلى دهون مع الوقت.' },
    candy: { name: 'حلوى', power: 'يمنحك انهيار طاقة سريع 🍬', benefit: 'كله تقريبًا سكر ولا شيء يحتاجه جسمك فعلاً. يمنحك دفعة طاقة قصيرة ثم يتركك متعبًا وترغب بالمزيد.' },
    fries: { name: 'بطاطا مقلية', power: 'يحملك بدهون سيئة وملح 🍟', benefit: 'مقلية بزيت يصعب على قلبك، بالإضافة إلى كمية كبيرة من الملح. تناولها كثيرًا يرفع خطر زيادة الوزن وارتفاع ضغط الدم.' },
    donut: { name: 'دونات', power: 'عجين مقلي مغموس بالسكر 🍩', benefit: 'مقلي ومغطى بالسكر تقريبًا بلا قيمة غذائية. يمنحك دفعة طاقة سريعة تنهار بعدها بسرعة، ويبقى الدهن.' },
    burger: { name: 'برغر وجبات سريعة', power: 'غني بالملح والدهون المشبعة 🍔', benefit: 'اللحم المصنع والجبن والصلصة تضيف الكثير من الملح والدهون غير الصحية. الإكثار منه يرهق قلبك مع الوقت.' },
    iceCream: { name: 'آيس كريم', power: 'مزيج سكر ودهون يتراكم بسرعة 🍦', benefit: 'إنه غالبًا سكر وكريمة، فالسعرات الحرارية تتراكم بسرعة دون أن تشبعك أو تمنح جسمك قيمة غذائية حقيقية.' },
    energyDrink: { name: 'مشروب طاقة', power: 'يغرقك بالسكر والكافيين ⚡', benefit: 'مزيج السكر والكافيين يمنحك انهيارًا سريعًا بعد النشوة، وقد يرفع معدل ضربات قلبك ويؤثر على نومك.' },
    instantNoodles: { name: 'نودلز سريعة التحضير', power: 'مليء بالملح وبدون قيمة غذائية تقريبًا 🍜', benefit: 'إنه غالبًا كربوهيدرات مكررة وصوديوم، فيملأ معدتك دون أن يمنح جسمك ما يحتاجه فعلاً.' },
    pastry: { name: 'معجنات حلوة', power: 'سكر ودهون وتقريبًا لا شيء آخر 🥐', benefit: 'مصنوعة من الزبدة والسكر، فهي غنية بالسعرات الحرارية وفقيرة بأي قيمة غذائية حقيقية.' },
    friedChicken: { name: 'دجاج مقلي', power: 'مقلي بعمق ويثقل على جسمك 🍗', benefit: 'الطبقة المقرمشة تمتص كمية كبيرة من الزيت، وتضيف الكثير من الدهون غير الصحية فوق اللحم نفسه.' },
    cookies: { name: 'بسكويت', power: 'سكر ودهون وتقريبًا لا شيء غير ذلك 🍪', benefit: 'غالبًا دقيق وسكر وزبدة، فتحصل على الكثير من السعرات مقابل القليل جدًا من القيمة الغذائية.' },
    cake: { name: 'كيك', power: 'جرعة كبيرة من السكر والدهون دفعة واحدة 🍰', benefit: 'بين الحشو والعجين، إنها جرعة ثقيلة من السكر والدهون في قطعة واحدة - يسهل الإفراط فيها.' },
  },
}

export interface JunkFoodsPanelChrome {
  superfoodsTab: string
  junkFoodTab: string
  removeAriaLabel: string
}

export const JUNK_FOODS_PANEL_CHROME: Record<Lang, JunkFoodsPanelChrome> = {
  en: {
    superfoodsTab: 'HERO FOOD',
    junkFoodTab: 'VILLAIN FOOD',
    removeAriaLabel: 'Remove',
  },
  he: {
    superfoodsTab: 'גיבורים',
    junkFoodTab: 'אויבים',
    removeAriaLabel: 'הסר',
  },
  ar: {
    superfoodsTab: 'أطعمة خارقة',
    junkFoodTab: 'أطعمة غير صحية',
    removeAriaLabel: 'إزالة',
  },
}
