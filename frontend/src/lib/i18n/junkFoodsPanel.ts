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
    pizza: { name: 'Pizza', power: 'Loaded with salt and fat 🍕', benefit: 'Cheese, processed meat and refined dough add up to a lot of salt and unhealthy fat in every slice.' },
    chocolateBar: { name: 'Chocolate Bar', power: 'Sugar and fat in one quick bite 🍫', benefit: 'Mostly sugar and fat with little real nutrition, so it gives you a quick spike and an even quicker crash.' },
    hotDog: { name: 'Hot Dog', power: 'Processed meat loaded with salt 🌭', benefit: 'Processed meat and a refined bun mean a lot of sodium and preservatives with barely any real nutrition.' },
    bacon: { name: 'Bacon', power: 'Heavy on salt and saturated fat 🥓', benefit: "Cured and fried, it's packed with sodium and saturated fat that strain your heart when eaten often." },
    whiteBread: { name: 'White Bread', power: 'Spikes your blood sugar fast 📉', benefit: 'Made from refined flour with the fiber stripped out, so it turns into sugar in your blood almost instantly.' },
    popcorn: { name: 'Buttered Popcorn', power: 'Loaded with butter and salt 🍿', benefit: 'The kernels start out fine, but the butter and salt piled on top turn it into a heavy dose of fat and sodium.' },
    bubbleTea: { name: 'Bubble Tea', power: 'A sugar bomb in a cup 🧋', benefit: 'Between the sweet syrup and the chewy tapioca, one cup can pack in as much sugar as several sodas.' },
    juiceBox: { name: 'Sugary Juice Drink', power: 'Almost as sugary as soda 🧃', benefit: "Even when it says 'fruit', it's mostly sugar and water with little of the fiber real fruit gives you." },
    potatoChips: { name: 'Potato Chips', power: 'Salty, greasy, and hard to stop eating 🥔', benefit: "Deep-fried and heavily salted, so it's easy to eat way more than you meant to in one sitting." },
    pancakesSyrup: { name: 'Pancakes with Syrup', power: 'A sugar rush stacked on refined carbs 🥞', benefit: 'The fluffy batter and sugary syrup send your blood sugar up fast, then leave you hungry again soon after.' },
    pretzel: { name: 'Pretzel', power: 'Refined carbs and a lot of salt 🥨', benefit: 'Made from refined flour and coated in salt, so it fills you up without giving your body much real nutrition.' },
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
    pizza: { name: 'פיצה', power: 'עמוסה במלח ובשומן 🍕', benefit: 'גבינה, בשר מעובד ובצק מזוקק מצטברים להרבה מלח ושומן לא בריא בכל פרוסה.' },
    chocolateBar: { name: 'חטיף שוקולד', power: 'סוכר ושומן בביס מהיר אחד 🍫', benefit: 'בעיקר סוכר ושומן עם מעט מאוד ערך תזונתי אמיתי, אז זה נותן קפיצה מהירה וקריסה מהירה עוד יותר.' },
    hotDog: { name: 'נקניקייה', power: 'בשר מעובד עמוס במלח 🌭', benefit: 'בשר מעובד ולחמנייה מזוקקת אומרים הרבה נתרן וחומרים משמרים עם כמעט בלי ערך תזונתי אמיתי.' },
    bacon: { name: 'בייקון', power: 'עמוס במלח ובשומן רווי 🥓', benefit: 'מעושן ומטוגן, עמוס בנתרן ובשומן רווי שמעמיסים על הלב כשאוכלים אותו לעיתים קרובות.' },
    whiteBread: { name: 'לחם לבן', power: 'מעלה לך את הסוכר בדם מהר 📉', benefit: 'עשוי מקמח מזוקק שהסיבים הוצאו ממנו, אז הוא הופך לסוכר בדם שלך כמעט מיד.' },
    popcorn: { name: 'פופקורן בחמאה', power: 'עמוס בחמאה ובמלח 🍿', benefit: 'הגרעינים עצמם בסדר, אבל החמאה והמלח שמוסיפים עליהם הופכים את זה למנה כבדה של שומן ונתרן.' },
    bubbleTea: { name: 'באבל טי', power: 'פצצת סוכר בכוס 🧋', benefit: 'בין הסירופ המתוק לכדורי הטפיוקה הלעיסים, כוס אחת יכולה להכיל כמו כמה משקאות מוגזים.' },
    juiceBox: { name: 'מיץ ממותק', power: 'כמעט מתוק כמו משקה מוגז 🧃', benefit: 'גם כשכתוב עליו "פירות", זה בעיקר סוכר ומים עם מעט מאוד מהסיבים שפרי אמיתי נותן לך.' },
    potatoChips: { name: 'צ׳יפס תפוצ׳יפס', power: 'מלוח, שמנוני וקשה להפסיק לאכול 🥔', benefit: 'מטוגן עמוק ומלוח מאוד, אז קל לאכול הרבה יותר ממה שהתכוונת בישיבה אחת.' },
    pancakesSyrup: { name: 'פנקייקים עם סירופ', power: 'זינוק סוכר על גבי פחמימות מזוקקות 🥞', benefit: 'הבלילה התפוחה והסירופ המתוק מעלים את הסוכר בדם מהר, ואז משאירים אותך רעב שוב עד מהרה.' },
    pretzel: { name: 'פרצל', power: 'פחמימות מזוקקות והרבה מלח 🥨', benefit: 'עשוי מקמח מזוקק ומצופה במלח, אז הוא ממלא אותך בלי לתת לגוף שלך הרבה ערך תזונתי אמיתי.' },
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
    pizza: { name: 'بيتزا', power: 'غنية بالملح والدهون 🍕', benefit: 'الجبن واللحم المصنع والعجين المكرر تضيف الكثير من الملح والدهون غير الصحية في كل قطعة.' },
    chocolateBar: { name: 'قطعة شوكولاتة', power: 'سكر ودهون في قضمة سريعة 🍫', benefit: 'غالبًا سكر ودهون بقيمة غذائية حقيقية قليلة، فيمنحك ارتفاعًا سريعًا وانهيارًا أسرع.' },
    hotDog: { name: 'هوت دوغ', power: 'لحم مصنع غني بالملح 🌭', benefit: 'اللحم المصنع والخبز المكرر يعنيان الكثير من الصوديوم والمواد الحافظة مع قيمة غذائية حقيقية قليلة جدًا.' },
    bacon: { name: 'لحم مقدد', power: 'غني بالملح والدهون المشبعة 🥓', benefit: 'مُعالج ومقلي، وغني بالصوديوم والدهون المشبعة التي ترهق قلبك عند تناوله كثيرًا.' },
    whiteBread: { name: 'خبز أبيض', power: 'يرفع سكر الدم بسرعة 📉', benefit: 'مصنوع من دقيق مكرر أُزيلت منه الألياف، فيتحول إلى سكر في دمك بسرعة شبه فورية.' },
    popcorn: { name: 'فشار بالزبدة', power: 'غني بالزبدة والملح 🍿', benefit: 'الحبوب نفسها لا بأس بها، لكن الزبدة والملح المضافين فوقها يحولانها إلى جرعة ثقيلة من الدهون والصوديوم.' },
    bubbleTea: { name: 'شاي فقاعات', power: 'قنبلة سكر في كوب 🧋', benefit: 'بين الشراب الحلو وكرات التابيوكا، يمكن لكوب واحد أن يحتوي على سكر يعادل عدة مشروبات غازية.' },
    juiceBox: { name: 'عصير محلى', power: 'حلو تقريبًا مثل المشروب الغازي 🧃', benefit: 'حتى لو كُتب عليه "فواكه"، فهو غالبًا سكر وماء مع القليل جدًا من الألياف التي تمنحها الفاكهة الحقيقية.' },
    potatoChips: { name: 'رقائق البطاطا', power: 'مالحة ودهنية ويصعب التوقف عن أكلها 🥔', benefit: 'مقلية بعمق ومملحة بشدة، فمن السهل تناول كمية أكبر بكثير مما قصدته في جلسة واحدة.' },
    pancakesSyrup: { name: 'فطائر بالشراب', power: 'اندفاع سكر فوق كربوهيدرات مكررة 🥞', benefit: 'العجين الطري والشراب الحلو يرفعان سكر الدم بسرعة، ثم يتركانك جائعًا مرة أخرى بعد وقت قصير.' },
    pretzel: { name: 'بريتزل', power: 'كربوهيدرات مكررة وكمية كبيرة من الملح 🥨', benefit: 'مصنوع من دقيق مكرر ومغطى بالملح، فيملأ معدتك دون أن يمنح جسمك الكثير من القيمة الغذائية الحقيقية.' },
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
