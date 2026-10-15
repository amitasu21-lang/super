/* מילון מוצרים: מילת מפתח -> [קטגוריה, איור]. ההתאמה הארוכה ביותר מנצחת. */
window.CATALOG = {
  // ירקות ופירות
  'מלפפון': ['veg', 'cucumber'], 'מלפפונים': ['veg', 'cucumber'],
  'עגבני': ['veg', 'tomato'], 'שרי': ['veg', 'tomato'],
  'בננ': ['veg', 'banana'], 'תפוח': ['veg', 'apple'], 'תפוחים': ['veg', 'apple'],
  'תפוח אדמה': ['veg', 'potato'], 'תפוחי אדמה': ['veg', 'potato'], 'בטטה': ['veg', 'potato'],
  'גזר': ['veg', 'carrot'], 'בצל': ['veg', 'onion'], 'שום': ['veg', 'onion'],
  'לימון': ['veg', 'lemon'], 'לימונים': ['veg', 'lemon'], 'תפוז': ['veg', 'lemon'], 'קלמנטינ': ['veg', 'lemon'],
  'פלפל': ['veg', 'pepper'], 'גמבה': ['veg', 'pepper'],
  'חסה': ['veg', 'cucumber'], 'כרוב': ['veg', 'cucumber'], 'קישוא': ['veg', 'cucumber'], 'חציל': ['veg', 'pepper'],
  'אבוקדו': ['veg', 'apple'], 'ענבים': ['veg', 'apple'], 'אגס': ['veg', 'apple'], 'אפרסק': ['veg', 'apple'],
  'תות': ['veg', 'apple'], 'אבטיח': ['veg', 'apple'], 'מלון': ['veg', 'lemon'], 'מנגו': ['veg', 'lemon'],
  'פטרוזיליה': ['veg', 'cucumber'], 'כוסברה': ['veg', 'cucumber'], 'שמיר': ['veg', 'cucumber'], 'נענע': ['veg', 'cucumber'],
  'ברוקולי': ['veg', 'cucumber'], 'כרובית': ['veg', 'onion'], 'פטריות': ['veg', 'potato'], 'תירס': ['veg', 'banana'],
  // חלב וביצים
  'חלב': ['dairy', 'milk'], 'ביצ': ['dairy', 'eggs'],
  'גבינה': ['dairy', 'cheese'], 'גבינה צהובה': ['dairy', 'cheese'], 'צהובה': ['dairy', 'cheese'],
  'קוטג': ['dairy', 'cottage'], 'גבינה לבנה': ['dairy', 'cottage'], 'לבנה': ['dairy', 'cottage'], 'שמנת': ['dairy', 'cottage'],
  'יוגורט': ['dairy', 'yogurt'], 'מעדן': ['dairy', 'yogurt'], 'דנונה': ['dairy', 'yogurt'], 'מילקי': ['dairy', 'yogurt'],
  'חמאה': ['dairy', 'cheese'], 'בולגרית': ['dairy', 'cheese'], 'פטה': ['dairy', 'cheese'], 'מוצרלה': ['dairy', 'cheese'],
  'חלב סויה': ['dairy', 'milk'], 'חלב שקדים': ['dairy', 'milk'], 'חלב שיבולת': ['dairy', 'milk'],
  // מאפים
  'לחם': ['bread', 'bread'], 'לחמני': ['bread', 'bread'], 'פית': ['bread', 'bread'], 'חלה': ['bread', 'bread'],
  'בגט': ['bread', 'bread'], 'טורטי': ['bread', 'bread'], 'עוגה': ['bread', 'bread'], 'עוגיות': ['snacks', 'chocolate'],
  'קרואסון': ['bread', 'bread'], 'בייגל': ['bread', 'bread'], 'פריכיות': ['bread', 'bread'],
  // בשר ודגים
  'עוף': ['meat', 'chicken'], 'פרגית': ['meat', 'chicken'], 'שניצל': ['meat', 'chicken'], 'כרעיים': ['meat', 'chicken'], 'חזה': ['meat', 'chicken'],
  'בשר': ['meat', 'meat'], 'בקר': ['meat', 'meat'], 'טחון': ['meat', 'meat'], 'סטייק': ['meat', 'meat'], 'נקניק': ['meat', 'meat'], 'קבב': ['meat', 'meat'], 'המבורגר': ['meat', 'meat'],
  'דג': ['meat', 'fish'], 'דגים': ['meat', 'fish'], 'סלמון': ['meat', 'fish'], 'אמנון': ['meat', 'fish'], 'לברק': ['meat', 'fish'],
  'הודו': ['meat', 'chicken'], 'פסטרמה': ['meat', 'meat'],
  // יבשים ושימורים
  'פסטה': ['dry', 'pasta'], 'ספגטי': ['dry', 'pasta'], 'פתיתים': ['dry', 'pasta'], 'אטריות': ['dry', 'pasta'],
  'אורז': ['dry', 'rice'], 'קוסקוס': ['dry', 'rice'], 'עדשים': ['dry', 'rice'], 'קינואה': ['dry', 'rice'], 'בורגול': ['dry', 'rice'], 'שעועית': ['dry', 'can'],
  'קמח': ['dry', 'rice'], 'סוכר': ['dry', 'rice'], 'מלח': ['dry', 'rice'], 'שמרים': ['dry', 'rice'],
  'שמן': ['dry', 'juice'], 'שמן זית': ['dry', 'juice'], 'חומץ': ['dry', 'juice'], 'רוטב': ['dry', 'can'],
  'קפה': ['dry', 'coffee'], 'נס': ['dry', 'coffee'], 'תה': ['dry', 'coffee'],
  'טונה': ['dry', 'can'], 'שימור': ['dry', 'can'], 'תירס שימורים': ['dry', 'can'], 'רסק': ['dry', 'can'], 'קטשופ': ['dry', 'can'], 'מיונז': ['dry', 'can'], 'חרדל': ['dry', 'can'],
  'דגני בוקר': ['dry', 'cereal'], 'קורנפלקס': ['dry', 'cereal'], 'גרנולה': ['dry', 'cereal'], 'שיבולת': ['dry', 'cereal'],
  'חומוס': ['dry', 'hummus'], 'טחינה': ['dry', 'hummus'], 'ממרח': ['dry', 'hummus'], 'דבש': ['dry', 'juice'], 'ריבה': ['dry', 'can'],
  'תבלין': ['dry', 'rice'], 'פפריקה': ['dry', 'rice'], 'כמון': ['dry', 'rice'],
  // קפואים
  'קפוא': ['frozen', 'frozen'], 'קפואים': ['frozen', 'frozen'], 'גלידה': ['frozen', 'frozen'], 'ארטיק': ['frozen', 'frozen'],
  'בורקס': ['frozen', 'frozen'], 'פיצה': ['frozen', 'frozen'], 'אפונה': ['frozen', 'frozen'], 'שעועית ירוקה': ['frozen', 'frozen'], 'מלוואח': ['frozen', 'frozen'], 'ג\'חנון': ['frozen', 'frozen'],
  // חטיפים ומשקאות
  'שוקולד': ['snacks', 'chocolate'], 'במבה': ['snacks', 'chocolate'], 'ביסלי': ['snacks', 'chocolate'], 'חטיף': ['snacks', 'chocolate'], 'צ\'יפס': ['snacks', 'chocolate'], 'ופלים': ['snacks', 'chocolate'], 'פופקורן': ['snacks', 'chocolate'], 'אגוזים': ['snacks', 'chocolate'], 'גרעינים': ['snacks', 'chocolate'],
  'מים': ['snacks', 'water'], 'סודה': ['snacks', 'water'], 'מים מינרלים': ['snacks', 'water'],
  'מיץ': ['snacks', 'juice'], 'קולה': ['snacks', 'juice'], 'משקה': ['snacks', 'juice'], 'בירה': ['snacks', 'juice'], 'תפוזים': ['snacks', 'juice'],
  'יין': ['snacks', 'wine'],
  // ניקיון ובית
  'סבון כלים': ['clean', 'soap'], 'סבון': ['clean', 'soap'], 'נוזל': ['clean', 'soap'], 'אקונומיקה': ['clean', 'soap'], 'מרכך כביסה': ['clean', 'soap'], 'אבקת כביסה': ['clean', 'soap'], 'ג\'ל כביסה': ['clean', 'soap'], 'טבליות': ['clean', 'soap'],
  'נייר טואלט': ['clean', 'toiletpaper'], 'נייר': ['clean', 'toiletpaper'], 'מגבות נייר': ['clean', 'toiletpaper'], 'טישו': ['clean', 'toiletpaper'], 'מגבונים': ['clean', 'toiletpaper'],
  'שקיות': ['clean', 'bag'], 'שקיות זבל': ['clean', 'bag'], 'נייר כסף': ['clean', 'toiletpaper'], 'ניילון': ['clean', 'toiletpaper'], 'ספוג': ['clean', 'soap'], 'סקוץ': ['clean', 'soap'], 'סוללות': ['clean', 'bag'], 'נורה': ['clean', 'bag'],
  // טיפוח ופארם
  'משחת שיניים': ['care', 'toothpaste'], 'מברשת שיניים': ['care', 'toothpaste'], 'חוט דנטלי': ['care', 'toothpaste'],
  'שמפו': ['care', 'shampoo'], 'מרכך': ['care', 'shampoo'], 'סבון גוף': ['care', 'shampoo'], 'דאודורנט': ['care', 'shampoo'], 'קרם': ['care', 'shampoo'], 'תחבושות': ['care', 'diaper'], 'טמפונים': ['care', 'diaper'], 'חיתולים': ['care', 'diaper'], 'סכין גילוח': ['care', 'toothpaste'], 'אקמול': ['care', 'toothpaste'], 'פלסטר': ['care', 'toothpaste']
};

window.CAT_ICON = { veg: 'tomato', dairy: 'milk', bread: 'bread', meat: 'chicken', dry: 'pasta', frozen: 'frozen', snacks: 'chocolate', clean: 'soap', care: 'toothpaste' };

window.PEOPLE = {
  amit: { name: 'עמית', img: 'img/amit.png', ring: '#6B7A3A', me: 'זה אני, עמית', added: 'עמית הוסיף', bought: 'עמית קנה' },
  noga: { name: 'נגה', img: 'img/noga.png', ring: '#C4623E', me: 'זאת אני, נגה', added: 'נגה הוסיפה', bought: 'נגה קנתה' }
};
