import type { Lang } from './lang'

interface SubscriptionManagePanelStrings {
  title: string
  closeAria: string
  loading: string
  noSubscription: string
  errors: {
    load: string
    switch: string
    cancel: string
    resume: string
  }
  cancelsOn: (date: string) => string
  cancelNotice: string
  keepMySubscription: string
  working: string
  renews: (date: string) => string
  billingCycle: string
  current: string
  switchTo: (planTitle: string) => string
  switchConfirm: (title: string, price: string, period: string) => string
  cancelAction: string
  switching: string
  confirm: string
  updatePaymentMethod: string
  cancelSubscriptionLink: string
  cancelConfirmWithDate: (date: string) => string
  cancelConfirmNoDate: string
  keepSubscriptionAction: string
  canceling: string
  cancelSubscriptionButton: string
  planInfo: Record<'yearly' | 'monthly', { title: string; period: string }>
}

export const SUBSCRIPTION_MANAGE_PANEL_STRINGS: Record<Lang, SubscriptionManagePanelStrings> = {
  en: {
    title: 'Manage subscription',
    closeAria: 'Close',
    loading: 'Loading your subscription…',
    noSubscription: 'No subscription found on this account.',
    errors: {
      load: 'Could not load your subscription.',
      switch: 'Could not switch your plan.',
      cancel: 'Could not cancel your subscription.',
      resume: 'Could not resume your subscription.',
    },
    cancelsOn: (date) => `Cancels on ${date}`,
    cancelNotice: "You won't be charged again. Your Pro access stays active until then.",
    keepMySubscription: 'Keep my subscription',
    working: 'Working…',
    renews: (date) => `Renews ${date}`,
    billingCycle: 'Billing cycle',
    current: 'current',
    switchTo: (planTitle) => `Switch to ${planTitle}`,
    switchConfirm: (title, price, period) =>
      `You'll switch to ${title} (${price}${period}) right away. Paddle will charge or credit a prorated amount for the switch today.`,
    cancelAction: 'Cancel',
    switching: 'Switching…',
    confirm: 'Confirm',
    updatePaymentMethod: 'Update payment method',
    cancelSubscriptionLink: 'Cancel subscription',
    cancelConfirmWithDate: (date) => `You'll keep Pro access until ${date}. You will not be charged again after that.`,
    cancelConfirmNoDate:
      "You'll keep Pro access until the end of your current billing period. You will not be charged again after that.",
    keepSubscriptionAction: 'Keep subscription',
    canceling: 'Canceling…',
    cancelSubscriptionButton: 'Cancel subscription',
    planInfo: {
      yearly: { title: 'Yearly', period: '/year' },
      monthly: { title: 'Monthly', period: '/month' },
    },
  },
  he: {
    title: 'ניהול המנוי',
    closeAria: 'סגירה',
    loading: 'טוענים את המנוי שלך…',
    noSubscription: 'לא נמצא מנוי בחשבון הזה.',
    errors: {
      load: 'לא הצלחנו לטעון את המנוי שלך.',
      switch: 'לא הצלחנו להחליף את התוכנית שלך.',
      cancel: 'לא הצלחנו לבטל את המנוי שלך.',
      resume: 'לא הצלחנו לחדש את המנוי שלך.',
    },
    cancelsOn: (date) => `המנוי יתבטל ב-${date}`,
    cancelNotice: 'לא תחויב/י שוב. הגישה ל-Pro תישאר פעילה עד אז.',
    keepMySubscription: 'להשאיר את המנוי שלי',
    working: 'מעבד…',
    renews: (date) => `מתחדש ב-${date}`,
    billingCycle: 'מחזור חיוב',
    current: 'נוכחי',
    switchTo: (planTitle) => `מעבר למסלול ${planTitle}`,
    switchConfirm: (title, price, period) =>
      `תעברו למסלול ${title} (${price}${period}) מיד. Paddle יחייב או יזכה אתכם בסכום יחסי עבור המעבר היום.`,
    cancelAction: 'ביטול',
    switching: 'מחליף…',
    confirm: 'אישור',
    updatePaymentMethod: 'עדכון אמצעי תשלום',
    cancelSubscriptionLink: 'ביטול המנוי',
    cancelConfirmWithDate: (date) => `הגישה ל-Pro תישאר פעילה עד ${date}. לא תחויב/י שוב אחרי כן.`,
    cancelConfirmNoDate: 'הגישה ל-Pro תישאר פעילה עד סוף מחזור החיוב הנוכחי. לא תחויב/י שוב אחרי כן.',
    keepSubscriptionAction: 'להשאיר את המנוי',
    canceling: 'מבטל…',
    cancelSubscriptionButton: 'ביטול המנוי',
    planInfo: {
      yearly: { title: 'שנתי', period: '/שנה' },
      monthly: { title: 'חודשי', period: '/חודש' },
    },
  },
  ar: {
    title: 'إدارة الاشتراك',
    closeAria: 'إغلاق',
    loading: 'جارٍ تحميل اشتراكك…',
    noSubscription: 'لم يتم العثور على اشتراك في هذا الحساب.',
    errors: {
      load: 'تعذّر تحميل اشتراكك.',
      switch: 'تعذّر تغيير خطتك.',
      cancel: 'تعذّر إلغاء اشتراكك.',
      resume: 'تعذّر استئناف اشتراكك.',
    },
    cancelsOn: (date) => `سيُلغى في ${date}`,
    cancelNotice: 'لن تُحاسَب مرة أخرى. ستبقى ميزات Pro مفعّلة حتى ذلك الحين.',
    keepMySubscription: 'الإبقاء على اشتراكي',
    working: 'جارٍ التنفيذ…',
    renews: (date) => `يتجدد في ${date}`,
    billingCycle: 'دورة الفوترة',
    current: 'الحالية',
    switchTo: (planTitle) => `التبديل إلى ${planTitle}`,
    switchConfirm: (title, price, period) =>
      `سيتم التبديل إلى ${title} (${price}${period}) فورًا. ستخصم Paddle أو تضيف مبلغًا تناسبيًا عن هذا التبديل اليوم.`,
    cancelAction: 'إلغاء',
    switching: 'جارٍ التبديل…',
    confirm: 'تأكيد',
    updatePaymentMethod: 'تحديث طريقة الدفع',
    cancelSubscriptionLink: 'إلغاء الاشتراك',
    cancelConfirmWithDate: (date) => `ستبقى ميزات Pro مفعّلة حتى ${date}. لن تُحاسَب مرة أخرى بعد ذلك.`,
    cancelConfirmNoDate: 'ستبقى ميزات Pro مفعّلة حتى نهاية دورة الفوترة الحالية. لن تُحاسَب مرة أخرى بعد ذلك.',
    keepSubscriptionAction: 'الإبقاء على الاشتراك',
    canceling: 'جارٍ الإلغاء…',
    cancelSubscriptionButton: 'إلغاء الاشتراك',
    planInfo: {
      yearly: { title: 'سنوي', period: '/سنويًا' },
      monthly: { title: 'شهري', period: '/شهريًا' },
    },
  },
}
