import type { Lang } from './lang'

export interface NutritionChatStrings {
  title: string
  placeholder: string
  sendAriaLabel: string
  closeAriaLabel: string
  errorMessage: string
  greeting: string
  startButton: string
  expandAriaLabel: string
  collapseAriaLabel: string
  disclaimer: string
  angryIconAriaLabel: string
  angryRantFood: string[]
  angryRantChallenge: string[]
  challengeStartedGentle: string[]
  challengeStartedGrumpy: string[]
  challengeCompletedGentle: string[]
  challengeCompletedGrumpy: string[]
  checkInGentle: string[]
  checkInGrumpy: string[]
  tipsYes: string
  tipsNo: string
  nextChallengeYes: string
  challengeSuggestPrompt: string
  confirmChallengeOption: string
  differentChallengeOption: string
  recipeIngredients: string
  recipeSteps: string
  personality: {
    heading: string
    description: string
    veryNice: string
    normal: string
    angry: string
    superAngry: string
    superAngryNote: string
  }
}

export const NUTRITION_CHAT_STRINGS: Record<Lang, NutritionChatStrings> = {
  en: {
    title: 'Nutrition Bot',
    placeholder: 'Ask about a food or nutrient...',
    sendAriaLabel: 'Send',
    closeAriaLabel: 'Close',
    errorMessage: 'Something went wrong. Please try again.',
    greeting: 'Hi! Ask me anything about food or nutrition 🙂',
    startButton: 'Ask the bot 💬',
    expandAriaLabel: 'Expand',
    collapseAriaLabel: 'Collapse',
    disclaimer: 'The bot gives general estimates, not medical advice — always check ingredients yourself for allergies or sensitivities.',
    angryIconAriaLabel: 'The bot is angry',
    angryRantFood: [
      "Why are you eating {food}?! That's really not healthy 😠",
      '{food} again?! You are wrecking your whole day 😡',
      '{food}?! Seriously? Come on 🤬',
    ],
    angryRantChallenge: [
      "You're breaking the '{challenge}' challenge?! Really disappointing 😤",
      "The '{challenge}' challenge won't finish itself, and you just broke it 😡",
    ],
    challengeStartedGentle: [
      "Nice, you started the '{challenge}' challenge! Good luck — want a few tips to help you succeed? 💪",
      "Love it, the '{challenge}' challenge is on! Want some tips to help you crush it? 🙌",
    ],
    challengeStartedGrumpy: [
      "Oh, so NOW you're starting the '{challenge}' challenge. Fine, good luck, just don't blow it. Want tips so you don't screw this up? 😤",
      "The '{challenge}' challenge, huh? We'll see if you actually stick with it. Want tips, or are you going to wing it like usual? 🙄",
    ],
    challengeCompletedGentle: [
      "You crushed the '{challenge}' challenge! Want a more advanced one that builds on it? 🎉",
      "Way to go finishing '{challenge}'! Ready for a tougher challenge that builds on what you just did? 🙌",
    ],
    challengeCompletedGrumpy: [
      "Huh, you actually finished the '{challenge}' challenge. Not bad. Want a harder one so you don't get comfortable? 😏",
      "Well well, '{challenge}' is done. Don't get cocky — want a tougher challenge to keep you honest? 🙄",
    ],
    checkInGentle: [
      "Hey, just checking in — how's your eating been today? 🙂",
      'Hi again! How are you feeling today? 😊',
      'Quick check-in — did you drink enough water today? 💧',
    ],
    checkInGrumpy: [
      "So... are you actually eating right today, or should I not ask? 😒",
      'Just checking — still on track, or already messed up today? 🙄',
      'Hey. Water. Did you drink any today? 😤',
    ],
    tipsYes: 'Yes, give me tips',
    tipsNo: 'No thanks',
    nextChallengeYes: 'Yes, suggest one',
    challengeSuggestPrompt: "How about this challenge: '{challenge}'?",
    confirmChallengeOption: "Yes, let's do it",
    differentChallengeOption: 'Suggest a different one',
    recipeIngredients: 'Ingredients',
    recipeSteps: 'How to make it',
    personality: {
      heading: 'Bot personality',
      description: 'Choose how the bot reacts when you log something unhealthy.',
      veryNice: 'Very nice 😊',
      normal: 'Normal 🙂',
      angry: 'Grumpy 😠',
      superAngry: 'Super angry 🤬',
      superAngryNote: 'In this mode the bot turns red and reacts angrily when you log unhealthy food or break a challenge.',
    },
  },
  he: {
    title: 'בוט התזונה',
    placeholder: 'שאלו על מאכל או ויטמין...',
    sendAriaLabel: 'שליחה',
    closeAriaLabel: 'סגירה',
    errorMessage: 'משהו השתבש. נסו שוב.',
    greeting: 'היי! אפשר לשאול אותי כל דבר על אוכל ותזונה 🙂',
    startButton: 'שאל את הבוט 💬',
    expandAriaLabel: 'הגדלה',
    collapseAriaLabel: 'הקטנה',
    disclaimer: 'הבוט נותן הערכה כללית בלבד ולא ייעוץ רפואי — תמיד תבדקו בעצמכם את הרכיבים מול אלרגיות או רגישויות.',
    angryIconAriaLabel: 'הבוט כועס',
    angryRantFood: ['למה אתה אוכל {food}?! זה ממש לא בריא 😠', 'שוב {food}?! אתה הורס לעצמך את היום 😡', '{food}?! באמת? תתבייש לך 🤬'],
    angryRantChallenge: ["אתה שובר לי את האתגר '{challenge}'?! ממש מאכזב 😤", "האתגר '{challenge}' לא ישלים את עצמו, ואתה בדיוק שברת אותו 😡"],
    challengeStartedGentle: [
      "יאללה, פתחת את האתגר '{challenge}'! בהצלחה, רוצה כמה טיפים שיעזרו לך להצליח? 💪",
      "מגניב, האתגר '{challenge}' יצא לדרך! רוצה טיפים שיעזרו לך לעמוד בו? 🙌",
    ],
    challengeStartedGrumpy: [
      "או, עכשיו פתאום פתחת את האתגר '{challenge}'. טוב, בהצלחה, רק אל תפשל. רוצה טיפים שלא תהרוס את זה? 😤",
      "האתגר '{challenge}', כן? נראה אם באמת תעמוד בזה הפעם. רוצה טיפים, או שתלך על אילתור כרגיל? 🙄",
    ],
    challengeCompletedGentle: [
      "סיימת את האתגר '{challenge}'! רוצה אתגר יותר מתקדם שממשיך מאיפה שעצרת? 🎉",
      "כל הכבוד על סיום '{challenge}'! מוכן לאתגר קשה יותר שבונה על מה שהשגת? 🙌",
    ],
    challengeCompletedGrumpy: [
      "וואו, בפועל סיימת את האתגר '{challenge}'. לא רע. רוצה משהו יותר קשה שלא תתרגל לנוחות? 😏",
      "טוב טוב, '{challenge}' הושלם. שלא תתפוס ראש גדול, רוצה אתגר קשה יותר שישאיר אותך רציני? 🙄",
    ],
    checkInGentle: [
      'היי, רק בודק מה איתך, איך האכילה היום? 🙂',
      'היי שוב! איך אתה מרגיש היום? 😊',
      'בדיקה קצרה, שתית מספיק מים היום? 💧',
    ],
    checkInGrumpy: [
      'אז... אתה בכלל אוכל נכון היום, או עדיף שלא אשאל? 😒',
      'רק בודק, עדיין בשליטה או שכבר פישלת היום? 🙄',
      'היי. מים. שתית בכלל היום? 😤',
    ],
    tipsYes: 'כן, תן לי טיפים',
    tipsNo: 'לא תודה',
    nextChallengeYes: 'כן, תציע לי',
    challengeSuggestPrompt: "מה דעתך על האתגר '{challenge}'?",
    confirmChallengeOption: 'כן, בוא נתחיל',
    differentChallengeOption: 'תציע לי אתגר אחר',
    recipeIngredients: 'מרכיבים',
    recipeSteps: 'איך מכינים',
    personality: {
      heading: 'אישיות הבוט',
      description: 'בחרו איך הבוט יגיב כשתתעדו משהו לא בריא.',
      veryNice: 'נחמד מאוד 😊',
      normal: 'רגיל 🙂',
      angry: 'עצבני 😠',
      superAngry: 'סופר עצבני 🤬',
      superAngryNote: 'במצב הזה הבוט יהפוך לאדום ויגיב בכעס כשתתעדו אוכל לא בריא או תשברו אתגר.',
    },
  },
  ar: {
    title: 'بوت التغذية',
    placeholder: 'اسأل عن طعام أو عنصر غذائي...',
    sendAriaLabel: 'إرسال',
    closeAriaLabel: 'إغلاق',
    errorMessage: 'حدث خطأ ما. حاول مرة أخرى.',
    greeting: 'مرحبًا! اسألني أي شيء عن الطعام والتغذية 🙂',
    startButton: 'اسأل البوت 💬',
    expandAriaLabel: 'تكبير',
    collapseAriaLabel: 'تصغير',
    disclaimer: 'البوت يقدم تقديرًا عامًا فقط وليس نصيحة طبية — تحقق دائمًا بنفسك من المكونات بخصوص الحساسية أو الحساسية الغذائية.',
    angryIconAriaLabel: 'البوت غاضب',
    angryRantFood: ['لماذا تأكل {food}؟! هذا غير صحي إطلاقًا 😠', '{food} مرة أخرى؟! أنت تدمر يومك 😡', '{food}؟! جديًا؟ يا حرام عليك 🤬'],
    angryRantChallenge: ["أنت تكسر تحدي '{challenge}'؟! هذا محبط فعلاً 😤", "تحدي '{challenge}' لن يكتمل بنفسه، وأنت للتو كسرته 😡"],
    challengeStartedGentle: [
      "رائع، بدأت تحدي '{challenge}'! بالتوفيق، تريد بعض النصائح لمساعدتك على النجاح؟ 💪",
      "حلو، تحدي '{challenge}' انطلق! تريد نصائح تساعدك تنجح فيه؟ 🙌",
    ],
    challengeStartedGrumpy: [
      "آه، الآن قررت تبدأ تحدي '{challenge}'. حسنًا، بالتوفيق، بس لا تفشل. تريد نصائح عشان ما تخربها؟ 😤",
      "تحدي '{challenge}'، جدًا؟ نشوف إذا بتلتزم فيه هالمرة. تريد نصائح، ولا رح ترتجل متل العادة؟ 🙄",
    ],
    challengeCompletedGentle: [
      "أنهيت تحدي '{challenge}'! تريد تحديًا أكثر تقدمًا يبني على ما حققته؟ 🎉",
      "أحسنت في إنهاء '{challenge}'! جاهز لتحدٍ أصعب يكمل ما أنجزته؟ 🙌",
    ],
    challengeCompletedGrumpy: [
      "تبًا، أنهيت فعلاً تحدي '{challenge}'. مش سيء. تريد شيئًا أصعب عشان ما ترتاح؟ 😏",
      "طيب طيب، '{challenge}' خلص. بلا غرور، تريد تحديًا أصعب يخليك جادًا؟ 🙄",
    ],
    checkInGentle: [
      'هلا، بس بتفقد الحال، كيف كان أكلك اليوم؟ 🙂',
      'هلا مرة ثانية! كيف حالك اليوم؟ 😊',
      'سؤال سريع، شربت مي كفاية اليوم؟ 💧',
    ],
    checkInGrumpy: [
      'طيب... بتاكل صح اليوم، ولا الأفضل ما أسأل؟ 😒',
      'بس بتفقد، لسا ملتزم ولا خربتها اليوم؟ 🙄',
      'هاي. مي. شربت أصلاً اليوم؟ 😤',
    ],
    tipsYes: 'نعم، أعطني نصائح',
    tipsNo: 'لا شكرًا',
    nextChallengeYes: 'نعم، اقترح واحدًا',
    challengeSuggestPrompt: "ما رأيك بتحدي '{challenge}'؟",
    confirmChallengeOption: 'نعم، لنبدأ',
    differentChallengeOption: 'اقترح تحديًا آخر',
    recipeIngredients: 'المكونات',
    recipeSteps: 'طريقة التحضير',
    personality: {
      heading: 'شخصية البوت',
      description: 'اختر كيف يتفاعل البوت عندما تسجل شيئًا غير صحي.',
      veryNice: 'لطيف جدًا 😊',
      normal: 'عادي 🙂',
      angry: 'متضايق 😠',
      superAngry: 'غاضب جدًا 🤬',
      superAngryNote: 'في هذا الوضع يتحول البوت إلى اللون الأحمر ويغضب عندما تسجل طعامًا غير صحي أو تكسر تحديًا.',
    },
  },
}
