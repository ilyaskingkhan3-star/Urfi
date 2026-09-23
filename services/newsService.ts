import { NewsArticle, NewsCategory } from '../types';

export const INITIAL_NEWS: NewsArticle[] = [
  // Pakistan
  {
    id: 'news-pk-1',
    title: 'پاکستان میں آئی ٹی اور فری لانسنگ سیکٹر میں تاریخی ترقی اور نئی پالیسیاں',
    summary: 'وزارتِ آئی ٹی نے ملکی برآمدات بڑھانے کے لیے ڈیجیٹل اسکلز اور فری لانسرز کے لیے نئے فنڈز اور ٹیکس ریلیف کا اعلان کر دیا۔',
    category: 'Pakistan',
    source: 'APP / Express Urdu',
    time: '2 گھنٹے پہلے',
    badge: 'اہم خبر',
  },
  {
    id: 'news-pk-2',
    title: 'اسلام آباد اور لاہور کے درمیان جدید الیکٹرک ٹرین اور ہائی اسپیڈ ریلوے منصوبہ',
    summary: 'ماحولیاتی آلودگی کم کرنے اور تیز رفتار سفر کی فراہمی کے لیے نئے گرین ٹرانسپورٹ پروجیکٹ کا سنگ بنیاد۔',
    category: 'Pakistan',
    source: 'Radio Pakistan',
    time: '4 گھنٹے پہلے',
  },
  {
    id: 'news-pk-3',
    title: 'روپے کی قدر میں استحکام اور زرمبادلہ کے ذخائر میں بہتری',
    summary: 'اسٹیٹ بینک آف پاکستان کی رپورٹ کے مطابق ترسیلاتِ زر میں نمایاں اضافے سے ملکی معیشت پر مثبت اثرات۔',
    category: 'Pakistan',
    source: 'Dawn News',
    time: '6 گھنٹے پہلے',
  },

  // Technology
  {
    id: 'news-tech-1',
    title: 'Gemini 2.5 اور ملٹی ماڈل AI کے نئے دور کا آغاز',
    summary: 'گوگل اور عالمی ٹیک کمپنیوں نے نئی نسل کے مصنوعی ذہانت کے ماڈلز متعارف کرا دیے جو آواز، بصارت اور سوچنے کی تیز ترین صلاحیت رکھتے ہیں۔',
    category: 'Technology',
    source: 'TechJuice / ProPakistani',
    time: '1 گھنٹہ پہلے',
    badge: 'AI Update',
  },
  {
    id: 'news-tech-2',
    title: '5G سروسز کا پاکستان کے بڑے شہروں میں باقاعدہ فیلڈ ٹرائل مکمل',
    summary: 'پی ٹی اے نے تیز ترین موبائل انٹرنیٹ کے لیے اسپیکٹرم نیلامی اور انفراسٹرکچر کی تیاریوں کی توثیق کر دی۔',
    category: 'Technology',
    source: 'Telecom PK',
    time: '3 گھنٹے پہلے',
  },
  {
    id: 'news-tech-3',
    title: 'کوانٹم کمپیوٹنگ اور سائبر سیکیورٹی میں نئی پیش رفت',
    summary: 'جدید انکرپشن ٹیکنالوجی کے ذریعے حساس ڈیٹا کے تحفظ کو مزید ناقابل تسخیر بنا دیا گیا۔',
    category: 'Technology',
    source: 'Wired News',
    time: '8 گھنٹے پہلے',
  },

  // World
  {
    id: 'news-world-1',
    title: 'اقوامِ متحدہ کا ماحولیاتی تبدیلی اور قابل تجدید توانائی کے لیے عالمی معاہدہ',
    summary: 'دنیا بھر کے ممالک نے شمسی اور پن بجلی کے استعمال کو دوگنا کرنے اور کاربن کے اخراج کو کم کرنے کا عزم ظاہر کیا۔',
    category: 'World',
    source: 'UN News / BBC Urdu',
    time: '3 گھنٹے پہلے',
  },
  {
    id: 'news-world-2',
    title: 'خلائی سائنس: مریخ اور چاند پر پانی کی تلاش کے لیے نئے بین الاقوامی مشنز',
    summary: 'ناسا اور یورپی اسپیس ایجنسی کے مشترکہ روبوٹک مشن نے مریخ کی سطح کے نیچے برف کے وسیع ذخائر دریافت کیے۔',
    category: 'World',
    source: 'Reuters Science',
    time: '5 گھنٹے پہلے',
  },

  // Sports
  {
    id: 'news-sports-1',
    title: 'قومی کرکٹ ٹیم کی شاندار کارکردگی اور آنے والی سیریز کی تیاریاں',
    summary: 'کپتان اور ہیڈ کوچ نے سخت پریکٹس سیشن کے بعد کلین سویپ کی امید ظاہر کی، نوجوان کھلاڑیوں کی شاندار فارم برقرار۔',
    category: 'Sports',
    source: 'Geo Super',
    time: '1 گھنٹہ پہلے',
    badge: 'کرکٹ',
  },
  {
    id: 'news-sports-2',
    title: 'ارشد ندیم اور پاکستانی ایتھلیٹس کے لیے نئے اولمپک ٹریننگ سینٹر کا قیام',
    summary: 'جیولن تھرو اور فیلڈ اسپورٹس کے باصلاحیت نوجوانوں کی بین الاقوامی تربیت کے لیے خصوصی بجٹ مختص۔',
    category: 'Sports',
    source: 'Daily Jang Sports',
    time: '7 گھنٹے پہلے',
  }
];

export async function fetchNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
  return INITIAL_NEWS.filter(n => n.category === category);
}
