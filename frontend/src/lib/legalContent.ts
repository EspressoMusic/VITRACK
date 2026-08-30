export interface LegalBlock {
  heading: string
  paragraphs: string[]
}

export interface LegalPart {
  id: string
  title: string
  blocks: LegalBlock[]
}

export const LEGAL_LAST_UPDATED = '30.08.2026'
export const SUPPORT_EMAIL = 'shilohdhd1@gmail.com'
export const OPERATOR_NAME = 'Shilo'
export const AI_PROVIDER_NAME = 'OpenAI (ChatGPT / GPT models)'

export const LEGAL_PARTS: LegalPart[] = [
  {
    id: 'intro',
    title: 'Preliminary note',
    blocks: [
      {
        heading: '',
        paragraphs: [
          `Last updated: ${LEGAL_LAST_UPDATED}`,
          'This document combines the Terms of Use, Privacy Policy, Cookie and local-storage policy, and additional disclosures applicable to your use of the Vitrack application ("the App" or "the Service"). Please read it carefully. Using the App constitutes agreement to everything stated in this document.',
          `Vitrack is currently operated by ${OPERATOR_NAME} (a single private individual, referred to below as "the Operator" or "we"), and not by a registered company or licensed business. The Operator's contact details are provided later in this document and at the bottom of the Settings screen in the App.`,
        ],
      },
    ],
  },
  {
    id: 'terms',
    title: 'Part A — Terms of Use',
    blocks: [
      {
        heading: '1. Agreement to the terms',
        paragraphs: [
          'Browsing the App, creating an account, answering the personal questionnaire, photographing meals, or purchasing a subscription — each of these actions constitutes full and binding agreement to these Terms of Use and the Privacy Policy attached to them. If you do not agree to any of these terms, do not use the App.',
          'If you use the App on behalf of a third party, you represent that you have the authority to accept these terms on their behalf, and that they meet the minimum age requirement set out in section 3 below.',
        ],
      },
      {
        heading: '2. Description of the Service',
        paragraphs: [
          'Vitrack is an application that helps users generally track estimated vitamin, mineral, calorie, and macronutrient (protein, carbohydrate, and fat) intake, based on meal photos analyzed with artificial intelligence (AI), and a personal questionnaire (age, biological sex, weight, height, activity level, and diet type) used to calculate estimated daily targets.',
          'The results, estimates, and targets shown in the App are only a rough, automated approximation, based on general formulas (such as published RDA values) and imperfect automatic food recognition from images. This is not a laboratory, clinical, or professional assessment.',
          'The App tracks a broader set of vitamins and minerals than what is shown on screen by default. To keep the main view focused and readable, only a core subset of vitamins is displayed by default; the remaining tracked vitamins and minerals are not shown unless you turn on "Show all vitamins & minerals" in Settings, which reveals the full list. Not every vitamin, mineral, or nutrient that may be relevant to your health is necessarily tracked or displayed by the App, whether or not that setting is enabled. Calorie and macronutrient tracking can likewise be turned off in Settings by users who only want to track vitamins and minerals.',
          'The App also includes optional motivational features, such as a visual fill-level progress gauge and achievement badges awarded for consistent logging against the App\'s own internal thresholds. These features exist for engagement purposes only; they are not a medical, nutritional, or clinical certification of health, adequacy, or well-being, and unlocking (or not unlocking) a badge says nothing about your actual health status.',
          'The Operator may change, expand, reduce, suspend, or discontinue any part of the Service, temporarily or permanently, at any time and at its discretion, including without prior notice where required for technical or operational reasons. Where possible, reasonable advance notice will be given of material changes.',
        ],
      },
      {
        heading: '3. Minimum age — adults only',
        paragraphs: [
          'The Service is intended for users aged 18 and over only. It is not intended for minors, and we do not knowingly collect information from minors.',
          'By completing the personal questionnaire, creating an account, and in any event by using the App at all, you represent and warrant that you are 18 years of age or older, and that you have full legal capacity to enter into these terms (including any commitment to pay for a subscription, to the extent a real charge is ever applied).',
          'If we become aware that a minor has provided us with personal information contrary to the above, we will act to delete that information as soon as possible. A parent or guardian who discovers that a minor in their care has used the App is welcome to contact us — see contact details below.',
        ],
      },
      {
        heading: '4. User account',
        paragraphs: [
          'The App can be used without an account, in which case your data (including meal photos) is stored locally on your device only and may be lost if browser storage is cleared or the device is replaced.',
          'You can also sign in with a Google account, so that your data is stored in the cloud and synced across devices. You are responsible for keeping your Google account credentials confidential and for all activity carried out through it in the App.',
          'You must provide accurate and correct information when using the App (for example, in the personal questionnaire). The App does not verify the accuracy of the data entered, and the calculated estimates depend entirely on the reliability of the information you provide.',
          'You may delete your account at any time from the Settings screen in the App. Deleting an account is an irreversible action that deletes all data associated with it.',
        ],
      },
      {
        heading: '5. Subscription, payments, and cancellation',
        paragraphs: [
          'Paid subscriptions are processed through Paddle.com Market Ltd and its group companies ("Paddle"), acting as our authorized reseller and Merchant of Record for all purchases made in the App. This means your purchase is transacted with, invoiced by, and (where applicable) taxed by Paddle, and not directly by the Operator. Paddle\'s own Buyer Terms and Checkout Buyer Terms of Sale (available at paddle.com/legal) apply to the purchase transaction itself, in addition to these Terms, which govern your use of the App and Service. Card and other payment-method details are entered directly into Paddle\'s checkout and are never collected, stored, or seen by the Operator.',
          'A subscription renews automatically at the end of each billing period (monthly or yearly, depending on the plan chosen) at the then-current price for that plan, unless cancelled before the renewal date. You can cancel at any time using the cancellation link in your Paddle receipt or confirmation email, through Paddle\'s customer portal, or by emailing us at the contact address below and we will assist. Cancelling stops future renewals but does not itself entitle you to a refund of a period already paid for.',
          'Refunds beyond what mandatory law requires are granted at the Operator\'s sole discretion, on a case-by-case basis; Paddle may also independently review and grant refund requests under its own buyer terms. To the extent Israeli Consumer Protection Law, 1981, and its regulations (including any right to cancel a distance sale transaction), or another mandatory consumer-protection law applicable to a given user, grant non-waivable cancellation or refund rights, those rights will be honored notwithstanding the above.',
          'The Operator may change prices and subscription plans from time to time; a price change will not apply to a subscription period already paid for in advance, and reasonable notice will be given before a price change applies to the next renewal.',
        ],
      },
      {
        heading: '6. User-submitted content and license to use',
        paragraphs: [
          'When you photograph or upload a meal photo, you remain the owner of that photo. However, you grant the Operator a non-exclusive, worldwide, royalty-free license to store, process, transmit, and transfer the photo — including to third-party providers performing AI-based image analysis — solely for the purpose of providing the Service (food recognition and nutrient estimation) and its proper operation.',
          'You may not upload content to the App that is not your own, that is offensive or unlawful, that infringes a third party\'s privacy, or that is unrelated to photographing meals for the purpose of the Service.',
          'Do not upload photos to the App that include identifying details of other people (for example, another person\'s face) without their consent, since these photos may be transferred for processing to an external AI provider as described in the Privacy Policy.',
        ],
      },
      {
        heading: '7. Intellectual property',
        paragraphs: [
          'All code, design, interface, the name "Vitrack", the logo, and original content in the App (excluding user-submitted content, and any marks/components attributed to third parties in the Credits section) are owned by, or licensed to, the Operator, and are protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, reverse-engineer, decompile, redistribute, or create derivative works from the App without prior written consent.',
        ],
      },
      {
        heading: '8. Important medical, nutritional, and technological disclosure',
        paragraphs: [
          'Vitrack does not provide medical advice, professional nutritional advice, diagnosis, treatment, prevention, or cure of any disease or medical condition, and is not a substitute for a physician, a licensed clinical dietitian, or any other medical professional.',
          'Food recognition from photos and vitamin, mineral, calorie, and macronutrient estimates are performed by an automated AI system, and may be incorrect, partial, inaccurate, or misleading — including misidentifying the type of food, the portion size, or failing to identify ingredients at all.',
          'The App is not designed and is not able to identify allergens, hazardous ingredients, contamination, spoiled food, food-drug interactions, or any other health risk in a photographed meal. Do not rely on the App to make decisions relating to allergies, sensitivities, diabetes (including carbohydrate counting), pregnancy, breastfeeding, chronic illness, eating disorders, or any other medical condition — without independent verification and approval from a qualified medical professional.',
          'Food and nutrient-source suggestions shown in the App (for example, foods suggested to help close a vitamin or mineral gap) are general and are not filtered for allergens, intolerances, or any personal dietary restriction. If you have a food allergy, intolerance, or sensitivity of any kind, you are solely responsible for checking any food named or suggested by the App against your own medical history before consuming it. The Operator bears no responsibility or liability for any allergic reaction, adverse reaction, or other harm resulting from a food identified, logged, or suggested by the App.',
          'Some screens in the App display a general phrase associating a shortfall in a specific vitamin or mineral with feelings commonly reported alongside such shortfalls (for example, tiredness or low energy). These phrases reflect generic, population-level associations based solely on your logged food intake for that day — they are not based on any symptom you have actually reported to the App, and are not a diagnosis of the cause of how you currently feel. Do not use these phrases to self-diagnose, rule out, or delay seeking care for any symptom; if a symptom concerns you, consult a qualified medical professional regardless of what the App does or does not show.',
          'The daily targets calculated in the personal questionnaire are based on general, publicly available formulas and are not clinically personalized; do not adjust the dosage of dietary supplements, vitamins, or minerals based solely on data from the App, and in particular not in amounts higher than recommended, without consulting a physician.',
          'In a medical emergency, contact emergency services immediately (for example, Magen David Adom in Israel, phone 101) and do not rely on the App.',
        ],
      },
      {
        heading: '9. Limitation of liability',
        paragraphs: [
          'The Service is provided "AS IS" and "AS AVAILABLE", without any warranty of any kind, express or implied, including (without limitation) warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, reliability, continuous availability, or absence of faults.',
          'The Operator does not warrant that the App will be free of errors or viruses, available without interruption, or that the analysis results will be accurate or complete.',
          'To the extent permitted by law, the Operator will not be liable for any indirect, consequential, incidental, special, or punitive damages, or for loss of profit, loss of data, personal injury, health damage, or intangible harm, arising from use of the App, inability to use it, or reliance on content it provides — even if the Operator was advised of the possibility of such damage.',
          'If, despite the above, liability is nevertheless imposed on the Operator, its total cumulative liability for all claims arising from use of the App, on any legal basis, will not exceed the greater of: (a) the amount actually paid by the user for the Service in the 12 months preceding the event giving rise to the claim; or (b) USD 100 (or the equivalent in the currency actually charged).',
          'Nothing in this document seeks to limit liability in a manner not permitted by mandatory law (for example, in cases of damage caused by malice or gross negligence, to the extent these cannot be limited under applicable law).',
        ],
      },
      {
        heading: '10. Indemnification',
        paragraphs: [
          'You agree to indemnify and hold harmless the Operator against any claim, demand, damage, or expense (including reasonable attorney\'s fees) arising from your breach of these terms, misuse of the Service, or infringement of a third party\'s rights resulting from your actions in the App.',
        ],
      },
      {
        heading: '11. Termination of service and account closure',
        paragraphs: [
          'The Operator may suspend or terminate a user\'s access to the Service, at its discretion, in the event of a breach of these terms, unlawful or abusive use of the App, or for reasonable operational/business reasons, giving advance notice where possible.',
          'You may stop using the App at any time and delete your data and account through the Settings screen.',
        ],
      },
      {
        heading: '12. Governing law and jurisdiction',
        paragraphs: [
          'These terms are governed solely by the laws of the State of Israel, excluding its private international law (conflict of laws) rules. Exclusive jurisdiction over any dispute relating to these terms or use of the App is given to the competent courts of the Tel Aviv-Jaffa district, Israel, unless mandatory law applicable to a particular user (for example, consumer protection law in their country of residence) provides otherwise.',
        ],
      },
      {
        heading: '13. Miscellaneous',
        paragraphs: [
          '• If any provision of these terms is found to be void or unenforceable, the remaining provisions will remain in full force.',
          '• The Operator\'s failure to enforce a right at any point in time does not constitute a waiver of it.',
          '• These terms, together with the attached Privacy Policy and Cookie Policy, constitute the entire agreement between the parties regarding use of the App, and supersede any prior oral or written agreement.',
          '• The Operator may assign these terms to a third party as part of a sale, merger, or transfer of business activity; the user may not assign their rights without the Operator\'s consent.',
          '• These terms may be updated from time to time; continued use of the App after an update constitutes agreement to the updated terms. The date of the last update appears at the top of this document.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Part B — Privacy Policy',
    blocks: [
      {
        heading: '1. General',
        paragraphs: [
          'This policy explains what information Vitrack collects, how it is stored and used, with whom it may be shared, and what rights you have regarding it. "Personal information" is any information relating to an identified or identifiable person.',
          `The data controller is currently ${OPERATOR_NAME}, an independent private developer, with no registered business entity, who can be contacted at: ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        heading: '2. What information is collected',
        paragraphs: [
          '• Personal/health profile from the questionnaire: age, biological sex, weight, height, activity level, and diet type — stored by default only in local storage (localStorage) on your browser/device, and used to calculate estimated daily vitamin, mineral, calorie, and macronutrient targets.',
          '• Meal photos and analysis results: when you photograph a meal, the photo is sent for automatic analysis (see section 3), and the analysis result (list of identified foods, estimated quantities, nutrient estimates, and confidence level) is stored together with the photo: locally on the device (IndexedDB) if you are not signed in, or in a cloud database if you signed in with a Google account.',
          '• Account details: if you sign in with Google, we receive from it (via our authentication provider) your name, email address, and profile picture as provided by Google.',
          '• Subscription and billing status: the plan type selected (monthly/yearly) and active/inactive status, recorded by the App once a purchase is completed through Paddle. We do not collect or store your payment method details (such as card numbers) — these are entered directly into Paddle\'s checkout and handled solely by Paddle, as described in section 5 below.',
          '• Basic technical information: like any online service, the hosting, authentication, and AI infrastructure we use may naturally process basic connection data (such as IP address, browser type, timestamps) necessary to operate and secure the Service.',
        ],
      },
      {
        heading: '3. AI-based image analysis',
        paragraphs: [
          `Food recognition from a photo happens in two stages: (a) live, on-device recognition only (using a machine-learning model that runs in the browser) that helps frame the shot in real time — this stage does not send any data to a server; (b) final analysis of the photo you captured, performed by sending the photo to the App's server, which forwards it for processing by ${AI_PROVIDER_NAME} for food recognition and nutrient estimation.`,
          `This means the meal photo you choose to analyze is transferred to ${AI_PROVIDER_NAME} as an external third party, even if you are not signed in and even if the analysis result is ultimately stored only locally on your device. This processing is also subject to OpenAI's own privacy policy and terms of use (openai.com). If we change or add AI providers in the future, we will update this section accordingly.`,
          'Do not upload especially sensitive photos (such as ones that clearly show a third party\'s face, personal documents, or information unrelated to a meal) for analysis.',
        ],
      },
      {
        heading: '4. How we use information',
        paragraphs: [
          '• Providing the core functionality: calculating personal nutritional targets, recognizing food in photos, tracking daily/weekly vitamin, mineral, calorie, and macronutrient intake, and computing progress shown in gauges and achievement badges.',
          '• Managing accounts, sign-in, and syncing across devices for those who choose to sign in.',
          '• Managing subscriptions and payments, processed through Paddle.',
          '• Responding to support requests sent to our email address.',
          '• Maintaining the security of the Service and preventing misuse.',
          '• Complying with legal requirements where applicable.',
          'We do not sell personal information to third parties, and we do not use your data for targeted advertising.',
        ],
      },
      {
        heading: '5. Who information is shared with',
        paragraphs: [
          '• Supabase — the database, authentication, and cloud storage infrastructure provider we use for signed-in users.',
          '• Vercel — the hosting provider used to serve the App.',
          '• Google — for the sign-in process (Google Sign-In).',
          `• ${AI_PROVIDER_NAME} — the AI-based image analysis provider, used for food recognition and nutrient estimation in the photos you take, as described in section 3 above.`,
          '• Paddle.com Market Ltd and its group companies ("Paddle") — our payment processor and Merchant of Record for paid subscriptions. When you subscribe, Paddle collects and processes your payment details, billing address, and email directly, subject to Paddle\'s own privacy policy (paddle.com/legal). The Operator receives only your subscription plan and active/inactive status — never your full payment details.',
          '• Law enforcement authorities or competent bodies — only to the extent required by law, court order, or to protect rights, property, or safety.',
          '• In the event of a sale, merger, acquisition, or transfer of business assets — information may be transferred to the acquiring/merging party, with reasonable notice given where possible.',
        ],
      },
      {
        heading: '6. Storage, data security, and international transfer',
        paragraphs: [
          'We take reasonable, standard measures to protect information, but no method of storage or transmission over the internet is guaranteed to be 100% secure, and we cannot promise absolute security of information.',
          `The infrastructure providers we use (Supabase, Vercel, Google, Paddle, and ${AI_PROVIDER_NAME}) may store or process information on servers located outside Israel, including in the US and Europe. By using the App, you consent to such transfer of information.`,
        ],
      },
      {
        heading: '7. Data retention and deletion',
        paragraphs: [
          'Information stored only locally (without an account) stays on your device only and can be deleted immediately and irreversibly via "Clear all data" in Settings, and is also deleted if you clear your browser storage or remove the App.',
          'Account information (for signed-in users) is retained as long as the account is active. Deleting an account via "Delete account" in Settings deletes the information associated with it from the services under our control; copies may be retained briefly in technical backups before final deletion, and third-party providers (such as the image-analysis provider) may retain their own independent retention policies.',
          `You can also request deletion, review, or correction of information manually by contacting ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        heading: '8. Your rights',
        paragraphs: [
          `Subject to applicable law, you may have the right to: review the information stored about you; correct inaccurate information; request its deletion; object to certain processing; and receive a copy of your information in an accessible format (data portability). Some of these rights can be exercised directly through the Settings screen (deleting data/account), and others by contacting ${SUPPORT_EMAIL}. We will endeavor to respond to requests within a reasonable time.`,
          'Residents of the European Union may enjoy additional rights under the GDPR; residents of Israel may enjoy rights under the Israeli Privacy Protection Law, 1981, and its regulations.',
        ],
      },
      {
        heading: '9. Children\'s privacy',
        paragraphs: [
          'See the "Minimum age — adults only" section in Part A (Terms of Use) above, which also applies to this policy: the Service is intended for those aged 18 and over only, and we do not knowingly collect information from minors.',
        ],
      },
      {
        heading: '10. Changes to this Privacy Policy',
        paragraphs: [
          'We may update this policy from time to time. Material changes will be reflected by updating the "Last updated" date at the top of the document, and where necessary, a notice will be shown within the App.',
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Part C — Cookie and local storage policy',
    blocks: [
      {
        heading: '1. What technologies we use',
        paragraphs: [
          'The App does not currently use advertising cookies or third-party ad tracking. We do use browser storage technologies essential to operating the App:',
          '• Local Storage — to save the state of your personal questionnaire, your calculated nutritional targets, your calorie/macro-tracking display preference, and your subscription status on your device.',
          '• IndexedDB — to save your meal log on your device when you are not signed in.',
          '• Sign-in related storage — if you sign in with Google, our authentication provider (Supabase, via Google) may store session tokens in local storage or cookies, to keep you signed in between visits.',
        ],
      },
      {
        heading: '2. Purpose of use',
        paragraphs: [
          'These technologies are essential to the basic functioning of the App (saving your progress, recognizing your subscription, storing a local meal log) and are not used by us for cross-site advertising tracking.',
        ],
      },
      {
        heading: '3. Management and deletion',
        paragraphs: [
          'You can delete all local data at any time via "Clear all data" and/or "Delete account" in the Settings screen, or by clearing site/browser data in your browser settings. Note that doing so may sign you out of your account and reset your accumulated data.',
          'If we add usage-analytics or advertising tools in the future, we will update this policy accordingly and request your consent where required by law.',
        ],
      },
    ],
  },
  {
    id: 'business',
    title: 'Part D — Business status disclosure',
    blocks: [
      {
        heading: '',
        paragraphs: [
          `Vitrack is currently operated at an early stage by ${OPERATOR_NAME}, a private individual, without a registered business or a registered limited company. This may change in the future, in which case these terms will be updated accordingly and notice will be given within the App.`,
          'Until a formal business entity is established, the exclusive contact address for any matter relating to the App — including privacy requests, support, complaints, or legal demands — is the email address below.',
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Part E — Contact',
    blocks: [
      {
        heading: '',
        paragraphs: [
          'For any question, request, complaint, or inquiry regarding the Terms of Use, Privacy Policy, cookies, your personal information, or any other matter relating to Vitrack, you can contact us at:',
          SUPPORT_EMAIL,
        ],
      },
    ],
  },
  {
    id: 'credits',
    title: 'Part F — Credits',
    blocks: [
      {
        heading: '',
        paragraphs: [
          'Illustrations and icons: justicon — Flaticon (flaticon.com/free-icons/avocado), used under Flaticon\'s applicable license.',
        ],
      },
    ],
  },
]
