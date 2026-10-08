export interface LegalBlock {
  heading: string
  paragraphs: string[]
}

export interface LegalPart {
  id: 'terms' | 'privacy' | 'refund' | 'credits'
  title: string
  blocks: LegalBlock[]
}

/**
 * Single source of truth for the legal documents. The in-app LegalPanel renders LEGAL_PARTS
 * directly, and the website's terms.html / privacy.html / refund.html are regenerated from this
 * file — edit here, then run `npm run legal` from the repo root so the two never drift apart.
 * Paragraphs starting with "• " render as bullet items.
 */
export const LEGAL_LAST_UPDATED = '08.10.2026'
export const SUPPORT_EMAIL = 'shilohdhd1@gmail.com'
export const OPERATOR_NAME = 'Shilo'
export const AI_PROVIDER_NAME = 'OpenAI'
export const WEBSITE = 'vitamintrack.com'

export const LEGAL_PARTS: LegalPart[] = [
  {
    id: 'terms',
    title: 'Terms & Conditions',
    blocks: [
      {
        heading: '',
        paragraphs: [
          `These Terms & Conditions ("Terms") govern your use of Vitrack — the web app, the Android app, the website at ${WEBSITE}, and every feature offered through them (together, "the App" or "the Service"). Vitrack is operated by ${OPERATOR_NAME}, an individual based in Israel ("the Operator", "we", "us"). Please read these Terms together with our Privacy Policy and Refund Policy, which form part of them.`,
        ],
      },
      {
        heading: '1. Agreement to these Terms',
        paragraphs: [
          'By using the App in any way — browsing it, answering the questionnaire, logging a meal, signing in, playing the city game, or buying a subscription — you agree to these Terms. If you sign in or subscribe, you are also asked to confirm your agreement explicitly. If you do not agree, do not use the App.',
          'If any part of these Terms conflicts with a right you have under a mandatory law that cannot be waived by contract (for example, consumer-protection law in your country), that right prevails and the rest of these Terms remains in effect.',
        ],
      },
      {
        heading: '2. What the Service is',
        paragraphs: [
          'Vitrack is a self-tracking and general-education app about food and nutrition. Its main features are:',
          '• Meal logging: you photograph a meal, upload a photo, type a food name, or scan a product barcode, and the App estimates the vitamins, minerals, calories, and macronutrients (protein, carbohydrates, fat) in it. You can correct the result.',
          '• Personal targets: a short questionnaire (age, biological sex, weight, height, activity level, diet type) is used to calculate estimated daily targets from general, published formulas.',
          '• Tracking views: a calendar, insights, progress gauges, nutrient alerts, food suggestions, "superfood" and "food to limit" cards, goals and challenges, favorites, achievements, experience points, and levels.',
          '• AI chat: a chat assistant for general food and nutrition questions, with a separate "motivation" mode and selectable personalities (see section 9).',
          '• Workout log: a simple optional log of workouts you enter yourself.',
          '• The city game: a playful game with an animal avatar and a city you build, defend, and decorate, including online features that let signed-in players visit each other\'s cities (see section 10).',
          'All estimates, targets, suggestions, and chat replies are rough, automated approximations. They are not a laboratory, clinical, or professional assessment, and not every nutrient that may matter for your health is tracked or shown.',
          'The App is offered as a web app and as an Android app that you can download from our website. Download the Android app only from our official website; we are not responsible for copies obtained from any other source. If the App is offered through an app store in the future, that store\'s terms will also apply to your download.',
        ],
      },
      {
        heading: '3. Who may use the App — adults only',
        paragraphs: [
          'The App is intended only for people aged 18 or over. By using it you confirm that you are at least 18 and have the legal capacity to agree to these Terms and to pay for a subscription.',
          'We do not knowingly collect information from anyone under 18. If we learn that a minor is using the App, we may close the account and delete the related information. A parent or guardian who believes a minor has used the App can contact us at the address below.',
        ],
      },
      {
        heading: '4. Your account',
        paragraphs: [
          'Some parts of the App work without an account, in which case your data is kept only on your device and may be lost if you clear your browser or app data, uninstall the App, or change devices.',
          'Signing in with Google is required for paid features, for syncing your data between devices, and for the online city features. You are responsible for keeping your Google account secure and for all activity under it in the App. Tell us right away if you believe your account has been used without your permission.',
          'You must give accurate information (for example, in the questionnaire). The App does not check the information you enter, and its estimates depend on it.',
          'You can delete your account at any time from Settings → "Delete account". Deletion is permanent and removes the data described in the Privacy Policy. Deleting your account, uninstalling the App, or clearing your data does NOT cancel a paid subscription — cancel it first (see section 6).',
        ],
      },
      {
        heading: '5. Subscriptions, free trials, and payments',
        paragraphs: [
          'The App\'s AI features and other premium features require an active paid subscription ("Vitrack Pro") and a signed-in account. The available plans (currently monthly and yearly) and their prices are shown in the App and on our website, and the final price — including any applicable tax and in your local currency where available — is shown in the checkout before you pay.',
          'Payments are processed by Paddle.com Market Ltd and its group companies ("Paddle"), which acts as our reseller and Merchant of Record. This means Paddle sells you the subscription, charges your payment method, issues your receipt or invoice, and collects any applicable sales tax or VAT. Paddle\'s Buyer Terms (paddle.com/legal) apply to the purchase itself, alongside these Terms. Your card or other payment details are entered directly into Paddle\'s checkout; we never see or store them.',
          'Automatic renewal: your subscription renews automatically at the end of each billing period (each month or each year, depending on your plan) and your payment method is charged the then-current price for your plan, until you cancel. By subscribing, you authorize these recurring charges.',
          'Free trials: some plans may include a free trial (for example, a 3-day trial on the monthly plan). The trial length is shown before checkout. A payment method is required to start a trial. If you do not cancel before the trial ends, your subscription starts automatically and you are charged the full plan price at the end of the trial. Cancelling during the trial means you will not be charged. Free trials are limited to one per person; we may refuse or end a trial if we reasonably believe it is being misused (for example, repeated trials with new accounts).',
          'Where required by applicable law, we or Paddle will notify you before a free trial converts into a paid subscription or before a yearly subscription renews.',
          'If you buy a subscription before signing in, you must then sign in with Google in the App so the subscription can be linked to your account. If you cannot access a subscription you paid for, contact us with your Paddle receipt and we will help.',
          'A subscription is personal to you and may not be shared, transferred, or resold.',
          'Price changes: we may change subscription prices. A price change never applies to a period you have already paid for. We will give you reasonable advance notice before a new price applies to your next renewal, so you can cancel before it takes effect if you do not wish to continue.',
        ],
      },
      {
        heading: '6. Cancellation and refunds',
        paragraphs: [
          'You can cancel at any time: in the App under Settings → Subscription; through the link in your Paddle receipt email or Paddle\'s customer portal; or by emailing us and we will cancel it for you. When you cancel, no further renewal charges are made, and you keep access to paid features until the end of the period you have already paid for.',
          'Refunds are handled under our Refund Policy, which is part of these Terms. In summary: you can get a refund of your first payment for a new subscription if you ask within 14 days; Israeli consumers have the statutory right to cancel a distance transaction described there; you can get a refund of a yearly renewal charge if you ask within 14 days of it; and duplicate or mistaken charges are always refunded. Paddle may also review and grant refund requests under its own Buyer Terms.',
          'Nothing in these Terms limits any cancellation or refund right you have under mandatory law, including the Israeli Consumer Protection Law, 1981, and its regulations.',
        ],
      },
      {
        heading: '7. AI features and AI-generated content',
        paragraphs: [
          `Food recognition from photos, nutrient estimates for typed foods, and chat replies are generated automatically by artificial intelligence (currently provided by ${AI_PROVIDER_NAME}). AI output is produced by a machine, is not reviewed by a person before you see it, and can be wrong, incomplete, outdated, or misleading — for example, it can misidentify a food, misjudge a portion, miss ingredients entirely, or state something inaccurate with confidence.`,
          'You are responsible for how you use AI output. Always use your own judgment and check anything important — especially anything related to health, allergies, or medication — with a qualified professional.',
          'Product names looked up by barcode come from Open Food Facts, a free, collaborative public database. That data is provided by third parties and may be incomplete or incorrect.',
        ],
      },
      {
        heading: '8. Important health, nutrition, and medical disclaimer',
        paragraphs: [
          'Vitrack does not provide medical advice, professional nutrition advice, diagnosis, or treatment, and does not prevent, treat, or cure any disease or condition. It is not a medical device and is not a substitute for a physician, a registered dietitian, or any other qualified professional. Using the App does not create any professional–patient relationship.',
          'The App cannot detect allergens, hazardous or spoiled food, contamination, food–drug interactions, or any other health risk in a meal. Food suggestions, superfood cards, and chat replies are general and are NOT filtered for allergies, intolerances, medical conditions, medications, or dietary restrictions. If you have any of these, you are solely responsible for checking every food the App names before eating it.',
          'Do not rely on the App for decisions about allergies, diabetes (including carbohydrate counting or insulin), pregnancy, breastfeeding, kidney or other chronic disease, eating disorders, or any other medical condition without independent advice from a qualified professional.',
          'Some screens link a shortfall in a vitamin or mineral to feelings commonly reported alongside it (for example, tiredness). These are generic, population-level associations based only on the food you logged — not on any symptom — and are not a diagnosis. If a symptom worries you, see a doctor regardless of what the App shows.',
          'Short lines on food cards (for example, that a food "helps with" a body function) are simplified general education about nutrients the food contains. They are not health claims about you, and do not mean that eating the food will treat, cure, or prevent anything.',
          'Daily targets are based on general published formulas and are not clinically personalized. Do not start, stop, or change any dietary supplement, medication, or diet — and never take supplements above recommended amounts — based on the App alone. Consult a professional first.',
          'If you have, or have had, an eating disorder or a difficult relationship with food or body weight, calorie counting, food scores, streaks, and critical or "angry" feedback may not be right for you. You can switch the bot to its normal personality at any time, and we encourage you to talk to a professional before using the App or any other food-tracking app.',
          'In a medical emergency, call your local emergency number immediately (in Israel: Magen David Adom, 101). Do not use the App or its chat for emergencies.',
        ],
      },
      {
        heading: '9. Chat personalities and motivational features',
        paragraphs: [
          'The chat assistant and the in-app bot can use different personalities that you choose, including deliberately blunt, sarcastic, or "angry" styles that react to the food you log or to challenges you do not complete. These styles are optional entertainment only. What the bot says is generated automatically, is not a real assessment of you, and is not therapy, counseling, or coaching by a licensed professional. Nothing it says should be taken personally or as a statement of fact about you or your health. You can switch back to the normal personality at any time.',
          'Badges, scores, levels, gauges, and colors (for example, a "red" day) exist to keep tracking engaging. They do not certify your health or the adequacy of your diet.',
          'If you are feeling low, distressed, or unsafe, do not rely on the chat — reach out to a qualified professional or, in an emergency, to local emergency services (in Israel you can also contact ERAN emotional first aid at 1201).',
        ],
      },
      {
        heading: '10. The city game, virtual items, and online features',
        paragraphs: [
          'Coins, buildings, land, food guards, friends, avatar clothing, levels, and any other in-game items ("virtual items") have no monetary value. They cannot be bought separately for real money, sold, transferred, exchanged, or redeemed for money or anything of value. You receive a limited, revocable license to use them inside the game only. We may change, rebalance, reset, or remove virtual items or game features, and game progress stored only on your device may be lost if your device data is cleared.',
          'When you are signed in and open the city, a snapshot of your city — its layout, level, food guards, your avatar\'s appearance, and the city name you choose (or, if you have not chosen one, an automatic label such as "City #1234") — is published and can be seen by other signed-in players. Other players can visit your city and send you food guards, and you can do the same. Your Google name, email address, and profile picture are not shown to other players.',
          'City names must follow the community rules in section 12. Do not put your real full name, contact details, or any other personal information in your city name. We may change, reset, or remove any city name or city, or restrict a player\'s online features, without prior notice if we believe the rules were broken. To report an offensive city or name, email us with the city\'s name or number.',
        ],
      },
      {
        heading: '11. Your content and the license you give us',
        paragraphs: [
          'You keep ownership of the content you submit — meal photos, food names, chat messages, city names, and any other text you enter ("your content"). You give the Operator a worldwide, non-exclusive, royalty-free license to store, copy, process, display, and transmit your content — including to the service providers listed in the Privacy Policy, such as the AI provider — only as needed to operate, secure, and provide the Service to you, and, for city names and city snapshots, to show them to other players as described above. This license ends when your content is deleted, except for copies kept for a limited time in backups or as required by law.',
          'You confirm that you have the right to submit your content and that it does not break the law or anyone else\'s rights.',
        ],
      },
      {
        heading: '12. Community and acceptable-use rules',
        paragraphs: [
          'When using the App you must not:',
          '• upload photos of other people (including faces), identity documents, or anything unrelated to food, or type another person\'s private or health information into the App;',
          '• use offensive, hateful, sexual, violent, harassing, discriminatory, or misleading city names or content, impersonate anyone, or use names to advertise or share contact details;',
          '• break any law, or use the App for any illegal, harmful, or fraudulent purpose;',
          '• try to make the AI produce harmful, illegal, or unrelated content, or use the chat for anything other than its intended purpose;',
          '• bypass the paywall, rate limits, or any security measure; access another user\'s account or data; or probe, scan, or test the App\'s security without our written permission;',
          '• scrape, copy, or collect data from the App, use bots or automated requests, or overload the Service;',
          '• copy, modify, reverse-engineer, decompile, resell, or create derivative works from the App, except where the law expressly allows it;',
          '• misuse free trials, refunds, or chargebacks.',
          'We may remove content and suspend or close accounts that break these rules.',
        ],
      },
      {
        heading: '13. Third-party services',
        paragraphs: [
          'The App relies on third-party services, including Google (sign-in), Paddle (payments), OpenAI (AI processing), Supabase (database and authentication), Vercel (hosting), Open Food Facts (barcode product data), and TikTok (advertising measurement). Your use of those services may also be subject to their own terms and privacy policies. We are not responsible for third-party services, and an outage or change in them may affect the App.',
        ],
      },
      {
        heading: '14. Intellectual property',
        paragraphs: [
          'The App — including its code, design, interface, characters, artwork, game content, texts, the name "Vitrack", and the logo — is owned by or licensed to the Operator and is protected by copyright, trademark, and other laws, except for your content and third-party materials listed in the Credits. These Terms give you a personal, non-exclusive, non-transferable, revocable right to use the App for your own non-commercial use, and nothing more.',
          'If you send us feedback or suggestions, we may use them freely without any obligation to you.',
        ],
      },
      {
        heading: '15. Disclaimer of warranties',
        paragraphs: [
          'To the fullest extent permitted by law, the App is provided "AS IS" and "AS AVAILABLE", without warranties of any kind, express or implied, including warranties of accuracy, reliability, merchantability, fitness for a particular purpose, non-infringement, or uninterrupted, secure, or error-free operation. We do not promise that estimates, AI output, or any other content will be accurate or complete, or that data will never be lost.',
        ],
      },
      {
        heading: '16. Limitation of liability',
        paragraphs: [
          'To the fullest extent permitted by law, the Operator will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, or for any personal injury or health harm, arising from or related to your use of, or inability to use, the App, or your reliance on any estimate, suggestion, AI output, or other content in it.',
          'To the fullest extent permitted by law, the Operator\'s total liability for all claims relating to the App, on any legal basis, will not exceed the greater of (a) the amount you actually paid for the Service in the 12 months before the event that gave rise to the claim, or (b) USD 100 (or its equivalent in the currency you were charged).',
          'Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law — for example, liability for fraud, intentional misconduct, or gross negligence, or your statutory rights as a consumer.',
        ],
      },
      {
        heading: '17. Indemnification',
        paragraphs: [
          'To the extent permitted by law, you agree to indemnify the Operator against claims, damages, and reasonable costs (including reasonable legal fees) arising from your breach of these Terms, your content, or your misuse of the App.',
        ],
      },
      {
        heading: '18. Suspension and termination',
        paragraphs: [
          'You may stop using the App at any time, and delete your data and account in Settings.',
          'We may suspend or close your account, or restrict features, if you break these Terms, misuse the App, or act unlawfully, or if we are required to by law. Where reasonable, we will give you notice first.',
          'We may also stop offering the App, or any part of it, for operational or business reasons. If we permanently shut down a paid feature, or close your account without any breach on your part, we will refund the unused part of any period you have already paid for.',
          'Sections that by their nature should continue after termination (including sections 8, 11, 14–17, and 20) will continue to apply.',
        ],
      },
      {
        heading: '19. Changes to the Service and to these Terms',
        paragraphs: [
          'We may add, change, or remove features of the App from time to time, including for technical, security, or legal reasons.',
          'We may update these Terms. The "Last updated" date at the top shows the latest version. If a change is material, we will give notice in the App or by email before it takes effect; for paid subscribers, a material change that is to your disadvantage takes effect no earlier than 14 days after notice, and you may cancel your subscription before then. Continuing to use the App after a change takes effect means you accept the updated Terms.',
        ],
      },
      {
        heading: '20. Governing law and disputes',
        paragraphs: [
          'These Terms are governed by the laws of the State of Israel, without regard to conflict-of-laws rules. The competent courts in the Tel Aviv-Jaffa district have exclusive jurisdiction over any dispute relating to these Terms or the App, without derogating from the jurisdiction of small claims courts, and except where mandatory law where you live gives you the right to bring proceedings in your local courts or to rely on your local consumer-protection laws.',
          'Before starting any legal proceeding, please contact us first so we can try to resolve the issue informally.',
        ],
      },
      {
        heading: '21. General',
        paragraphs: [
          '• If any provision of these Terms is found invalid or unenforceable, the rest of the Terms remains in full effect.',
          '• Our failure to enforce a right is not a waiver of it.',
          '• These Terms, together with the Privacy Policy and the Refund Policy, are the entire agreement between you and the Operator about the App.',
          '• We may transfer these Terms to another person or entity as part of a sale, merger, reorganization, or transfer of the App — including to a company or business the Operator sets up to run the App — and will notify you if we do. You may not transfer your rights under these Terms without our consent.',
          '• Notices to you may be sent by email to the address of your account or shown in the App. Notices to us must be sent to the email address below.',
          '• These Terms are written in English. If we provide a translation, the English version applies in case of any conflict, except where mandatory law requires otherwise.',
        ],
      },
      {
        heading: '22. Contact',
        paragraphs: [
          `For any question, request, complaint, or legal notice about these Terms or the App, contact ${OPERATOR_NAME} at: ${SUPPORT_EMAIL}`,
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    blocks: [
      {
        heading: '',
        paragraphs: [
          `This Privacy Policy explains what personal information Vitrack collects, why, where it is kept, who receives it, and what rights you have. It applies to the Vitrack web app, the Android app, and the website at ${WEBSITE} (together, "the App"). "Personal information" means any information about an identified or identifiable person.`,
        ],
      },
      {
        heading: '1. Who is responsible for your information',
        paragraphs: [
          `The App is operated by ${OPERATOR_NAME}, an individual based in Israel, who is the controller (the "database owner") of the personal information described here. Contact: ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        heading: '2. The short version',
        paragraphs: [
          '• If you do not sign in, almost everything you enter stays on your device.',
          `• Meal photos, typed food names, and chat messages are sent to ${AI_PROVIDER_NAME} to be analyzed — even when you are not signed in.`,
          '• If you sign in with Google, your data is synced to our cloud database so you can use it on other devices.',
          '• Your city (but not your name or email) is visible to other signed-in players.',
          '• We use the TikTok Pixel to measure our ads. TikTok receives page visits and checkout events — never your meals, photos, health information, or chat messages.',
          '• We never see your card details, and we do not sell your personal information.',
          '• You can delete your data and your account at any time in Settings.',
        ],
      },
      {
        heading: '3. Information we collect',
        paragraphs: [
          '• Questionnaire and targets: age, biological sex, weight, height, activity level, diet type, and the daily targets calculated from them. Stored on your device; if you sign in, also synced to our cloud database.',
          '• Meals: the photos you take or upload, food names you type, barcodes you scan, the AI analysis results (foods, estimated portions, nutrients, calories, macronutrients, confidence, notes, and whether a food was flagged as junk food), and the date and time of each meal. Stored on your device if you are not signed in, or in our cloud database (including the photo itself) if you are.',
          '• Chat: the messages you type and the assistant\'s replies, the chat mode and personality you chose, and your calorie and protein targets, which are sent with each message so replies fit your plan. Your chat history is saved on your device; it is not stored in our database.',
          '• Other things you enter: workouts, goals and challenges, favorites, achievements, experience points, settings, and language. Stored on your device; workouts and goals are also synced to our cloud database if you sign in.',
          '• City game: your game progress is saved on your device. If you are signed in and open the city, a snapshot (city layout, level, food guards, avatar appearance, and the city name you choose) is stored in our database and shown to other signed-in players, and we keep a record of food guards sent between players (sender, recipient, and date).',
          '• Account: if you sign in with Google, we receive your name, email address, profile picture, and Google account identifier, and our authentication provider records basic sign-in information (such as sign-in times).',
          '• Subscription: your Paddle subscription and customer identifiers, plan, status (for example, trialing, active, or canceled), and the end date of the current period. Paddle collects your payment details, billing address, country, and email directly; we never receive your full card details.',
          '• Support: if you contact us by email or WhatsApp, we receive your contact details and the content of your messages.',
          '• Technical information: IP address, device and browser type, app version, timestamps, and error logs, which our hosting, database, and AI providers process to run and secure the Service. We also store your IP address briefly in rate-limit records to prevent abuse of the AI features.',
          '• Advertising measurement: see section 8 (TikTok Pixel).',
        ],
      },
      {
        heading: '4. Health-related information and your consent',
        paragraphs: [
          'Some of the information you give us — such as your weight, height, diet type, the food you eat, and your nutrient intake — may be considered health-related or sensitive information under privacy laws, including the Israeli Privacy Protection Law, 1981 (as amended), the EU/UK GDPR, and certain US state laws.',
          'You are not under any legal obligation to provide this information. Providing it is your choice, but the App cannot calculate targets or analyze meals without it. By entering it into the App, you explicitly consent to us processing it for the purposes described in this policy, including sending meal content to our AI provider. You can withdraw your consent at any time by deleting the information or your account in Settings; this does not affect processing already carried out.',
          'We use health-related information only to provide the App\'s features to you. We do not sell it, we do not use it for advertising, and we do not share it with advertising partners.',
        ],
      },
      {
        heading: '5. How we use information, and our legal bases',
        paragraphs: [
          '• To provide the App: calculate targets, analyze meals, show tracking and insights, run the chat and the game, and sync your data — based on our agreement with you (performing the contract) and, for health-related information, your explicit consent.',
          '• To manage subscriptions, payments, refunds, and access to paid features — based on performing the contract.',
          '• To show your city to other players and run the online game features — based on performing the contract.',
          '• To answer support requests — based on performing the contract and our legitimate interest in helping users.',
          '• To keep the App secure, prevent abuse and fraud, and enforce our Terms (for example, rate limits and moderation of city names) — based on our legitimate interests.',
          '• To measure the effectiveness of our ads with the TikTok Pixel — based on our legitimate interests and, where the law requires it, your consent.',
          '• To keep accounting and tax records and comply with legal obligations — based on legal obligation.',
          'We do not make decisions about you that have legal or similarly significant effects based solely on automated processing.',
        ],
      },
      {
        heading: '6. AI processing',
        paragraphs: [
          `When you analyze a meal photo, type a food name for analysis, or send a chat message, that content (and, for chat, the recent conversation together with your calorie and protein targets) is sent through our server to ${AI_PROVIDER_NAME} to generate the result. This happens even if you are not signed in and even if the result is then stored only on your device.`,
          'Before the photo is taken, a small machine-learning model runs on your device to help frame the shot; that step does not send anything to a server.',
          `${AI_PROVIDER_NAME} processes this content as our service provider, under its own API terms and privacy policy (openai.com/policies). Under OpenAI's API terms at the time of writing, content sent through its API is not used to train its models by default and may be kept for a limited period (typically up to 30 days) for abuse monitoring. If we change or add AI providers, we will update this policy.`,
          'Please do not include other people\'s faces, documents, or private information in photos or chat messages.',
        ],
      },
      {
        heading: '7. Who we share information with',
        paragraphs: [
          'We share personal information only as needed to run the App, with:',
          '• Supabase — database, authentication, and server functions (for signed-in users\' data and for AI requests).',
          '• Vercel — hosting of the App and website.',
          '• Google — sign-in with Google.',
          `• ${AI_PROVIDER_NAME} — AI analysis of meal photos, typed foods, and chat messages (section 6).`,
          '• Paddle.com Market Ltd and its group companies — payments, as our Merchant of Record. Paddle processes your purchase information as an independent controller under its own privacy policy (paddle.com/legal).',
          '• TikTok — advertising measurement (section 8).',
          '• Open Food Facts — when you scan a barcode, your device sends the barcode number directly to Open Food Facts to look up the product name. No account information is sent, though Open Food Facts, like any website, receives your IP address.',
          '• WhatsApp (Meta) and Google (Gmail) — if you choose to contact us through them.',
          '• Other players — your city snapshot and city name, as described in section 3.',
          '• Authorities — when required by law, court order, or to protect the rights, property, or safety of users, the Operator, or others.',
          '• A successor — if the App is transferred to a company or business set up by the Operator, or sold, merged, or reorganized, in which case this policy will continue to apply to your information.',
          'We do not sell your personal information for money. Our use of the TikTok Pixel may be considered "sharing" or "targeted advertising" under some US state laws; see section 13 for how to opt out.',
        ],
      },
      {
        heading: '8. Advertising measurement — TikTok Pixel',
        paragraphs: [
          'The web app and the Android app include the TikTok Pixel, a measurement tool from TikTok. It lets us understand how many people arrive from our TikTok ads and whether they start a checkout or subscribe, so we can measure and improve our advertising.',
          'The TikTok Pixel receives: the fact that a page of the App was loaded and its address; checkout events (starting a checkout, adding payment information, and a confirmed purchase) together with the plan, price identifier, amount, and currency; and technical information such as your IP address, browser and device information, and cookies or similar identifiers (such as "_ttp") that TikTok sets. TikTok may link this to your TikTok account if you have one, and processes it under its own privacy policy (tiktok.com/legal).',
          'We do not send TikTok your meals, photos, questionnaire answers, health information, chat messages, name, or email address.',
          'To limit this tracking you can block or clear third-party cookies in your browser, use a browser or extension that blocks trackers, adjust your ad-personalization settings in the TikTok app, or contact us.',
        ],
      },
      {
        heading: '9. Cookies and local storage',
        paragraphs: [
          'The App uses storage on your device that is essential for it to work:',
          '• Local storage — your questionnaire answers and targets, settings, language, subscription status, chat history, goals, favorites, achievements, workouts, and game progress.',
          '• IndexedDB — your meal log (including photos) when you are not signed in.',
          '• Sign-in storage — session tokens set by our authentication provider to keep you signed in.',
          '• Session storage — temporary checkout information used to complete a purchase.',
          'In addition, the TikTok Pixel sets its own cookies and identifiers, as described in section 8.',
          'You can delete the data stored on your device at any time with "Clear all data" in Settings, or by clearing site or app data in your browser or device settings. This may sign you out and erase data that was not synced.',
        ],
      },
      {
        heading: '10. International transfers',
        paragraphs: [
          'Our service providers may store or process information on servers outside Israel, including in the United States and the European Union. Where we transfer personal information outside Israel or the EU/UK, we rely on our providers\' contractual commitments and recognized safeguards (such as Standard Contractual Clauses where applicable) to protect it.',
        ],
      },
      {
        heading: '11. How long we keep information',
        paragraphs: [
          '• Information on your device stays there until you delete it, clear your browser or app data, or uninstall the App.',
          '• Cloud data of signed-in users (meals and photos, questionnaire and targets, goals, workouts, city snapshot, food-guard records) is kept while your account is active and deleted when you delete your account. Deleted data may remain in encrypted backups for a limited period (typically up to 30 days) before it is overwritten.',
          '• Subscription records (Paddle identifiers, plan, status, and dates) are kept after account deletion, disconnected from your deleted account, for as long as needed for accounting, tax, chargeback, and legal purposes (in Israel, generally up to 7 years).',
          '• Rate-limit records containing IP addresses are overwritten continuously and are not kept longer than needed to prevent abuse.',
          '• Support messages are kept as long as needed to handle your request and any follow-up.',
          '• Information held by third parties (such as OpenAI, Paddle, Google, and TikTok) is kept according to their own policies.',
        ],
      },
      {
        heading: '12. Security',
        paragraphs: [
          'We use reasonable technical and organizational measures to protect personal information, including encryption in transit (HTTPS), access controls that let each user read only their own data, and keeping secret keys only on the server. No method of storage or transmission is 100% secure, and we cannot guarantee absolute security. If a security incident affects your personal information, we will notify you and the relevant authorities where the law requires it.',
        ],
      },
      {
        heading: '13. Your rights and choices',
        paragraphs: [
          'Depending on where you live, you may have the right to: access the personal information we hold about you; correct it; delete it; receive a copy in a portable format; restrict or object to certain processing; withdraw consent at any time; and opt out of targeted advertising or "sharing".',
          '• Israel: you have the rights to review and correct your information under the Privacy Protection Law, 1981, and its regulations.',
          '• EU / UK: you have the rights listed above under the GDPR, and the right to complain to your local data protection authority.',
          '• United States: residents of states with privacy laws (such as California, Colorado, Virginia, Connecticut, and others) may have the rights listed above, including to opt out of targeted advertising, and we will not discriminate against you for using them. If you live in a state with a consumer health data law (such as Washington or Nevada), we collect consumer health data only to provide the features you request, and we do not sell it or share it for advertising.',
          `You can delete your data and account yourself in Settings. For any other request, email ${SUPPORT_EMAIL}. We may need to verify your identity, and we will respond within 30 days or any shorter period required by law. If we refuse a request, we will explain why, where the law requires it.`,
        ],
      },
      {
        heading: '14. Children',
        paragraphs: [
          'The App is intended only for people aged 18 and over, and we do not knowingly collect personal information from anyone under 18. If you believe a minor has given us personal information, contact us and we will delete it.',
        ],
      },
      {
        heading: '15. Changes to this policy',
        paragraphs: [
          'We may update this policy from time to time. The "Last updated" date at the top shows the latest version. If a change is material, we will notify you in the App or by email, and where the law requires it, we will ask for your consent.',
        ],
      },
      {
        heading: '16. Contact',
        paragraphs: [
          `For any question, request, or complaint about this policy or your personal information, contact ${OPERATOR_NAME} at: ${SUPPORT_EMAIL}`,
        ],
      },
    ],
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    blocks: [
      {
        heading: '',
        paragraphs: [
          'This Refund Policy explains how free trials, renewals, cancellations, and refunds work for Vitrack Pro subscriptions. It is part of our Terms & Conditions.',
        ],
      },
      {
        heading: '1. Who bills you',
        paragraphs: [
          'Vitrack Pro subscriptions are sold and billed by Paddle.com Market Ltd ("Paddle"), our Merchant of Record and authorized reseller. Your receipt or invoice and the charge on your statement come from Paddle. Paddle\'s Buyer Terms (paddle.com/legal) also apply to your purchase.',
        ],
      },
      {
        heading: '2. Free trials',
        paragraphs: [
          'Some plans include a free trial (for example, a 3-day trial on the monthly plan), as shown before checkout. If you cancel before the trial ends, you will not be charged. If you do not cancel, your subscription starts automatically when the trial ends and you are charged the full plan price.',
        ],
      },
      {
        heading: '3. Automatic renewal',
        paragraphs: [
          'Your subscription renews automatically at the end of each billing period (monthly or yearly, depending on your plan) at the then-current price, until you cancel. A price change never applies to a period you have already paid for, and we give reasonable notice before a new price applies to a renewal.',
        ],
      },
      {
        heading: '4. How to cancel',
        paragraphs: [
          '• In the App: Settings → Subscription → Cancel; or',
          '• Through the link in your Paddle receipt email or Paddle\'s customer portal; or',
          `• By emailing ${SUPPORT_EMAIL} — we will cancel it for you.`,
          'After you cancel, no further charges are made and you keep access until the end of the period you already paid for. Deleting your account, uninstalling the App, or clearing your data does NOT cancel your subscription — please cancel first.',
        ],
      },
      {
        heading: '5. When you can get a refund',
        paragraphs: [
          '• First payment: if you are not satisfied, you can get a full refund of the first payment for a new subscription (including the first charge after a free trial) if you ask within 14 days of that payment.',
          '• Yearly renewals: if you were charged for a yearly renewal you did not intend, you can get a full refund of that renewal charge if you ask within 14 days of it.',
          '• Mistakes: duplicate charges, charges after a cancellation that was properly made, and charges for a period in which a technical problem on our side prevented you from using the paid features will be refunded.',
          '• Monthly renewals are otherwise not refundable once the period has started, except where required by law. You can cancel at any time to stop future renewals.',
          'Any other refund request is considered case by case, at our discretion. Paddle may also review and grant refunds under its own Buyer Terms, regardless of our decision.',
        ],
      },
      {
        heading: '6. Your statutory rights (Israel and elsewhere)',
        paragraphs: [
          'If you are a consumer in Israel, you may cancel a distance transaction under the Consumer Protection Law, 1981, within 14 days from the day of the transaction or the day you received the transaction details, whichever is later, by notifying us by email or by any other means the law allows. We will refund the amount paid within the time required by law, less any cancellation fee the law permits (no more than 5% of the price or ILS 100, whichever is lower). You may also end an ongoing (subscription) transaction at any time, and it will end within the time set by law.',
          'If you are a consumer in the EU or UK, or anywhere else with mandatory consumer rights, those rights apply in addition to this policy. Nothing in this policy limits any right you have under mandatory law.',
        ],
      },
      {
        heading: '7. How to request a refund',
        paragraphs: [
          `Email ${SUPPORT_EMAIL} with the email address you used at checkout, your Paddle order or transaction ID (shown in your receipt email), and the reason for your request. You can also contact Paddle directly through its support channels.`,
        ],
      },
      {
        heading: '8. How refunds are paid',
        paragraphs: [
          'Approved refunds are paid by Paddle to your original payment method. The time it takes for the money to appear depends on Paddle and your bank or card issuer, usually 5–10 business days. When a refund is issued, the subscription it relates to ends and access to paid features stops.',
        ],
      },
      {
        heading: '9. Chargebacks',
        paragraphs: [
          'If you have a problem with a charge, please contact us first — we can usually resolve it faster than a bank dispute. If you open a chargeback or payment dispute, access to paid features may be suspended until it is resolved.',
        ],
      },
      {
        heading: '10. Contact',
        paragraphs: [
          `For anything about billing, cancellations, or refunds, contact ${OPERATOR_NAME} at: ${SUPPORT_EMAIL}`,
        ],
      },
    ],
  },
  {
    id: 'credits',
    title: 'Credits',
    blocks: [
      {
        heading: '',
        paragraphs: [
          '• Illustrations and icons: justicon — Flaticon (flaticon.com/free-icons/avocado), used under Flaticon\'s applicable license.',
          '• Product data looked up by barcode: Open Food Facts (openfoodfacts.org), made available under the Open Database License (ODbL).',
        ],
      },
    ],
  },
]
