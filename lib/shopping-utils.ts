// Simple heuristic for categorization
// In a real app, this would be in the DB or an AI service

interface CategoryDefinition {
  id: string;
  labelDe: string;
  labelEn: string;
  keywords: string[];
}

// Ordered list to ensure priority (e.g. check "Beverages" last if "Fruit" keywords overlap, or vice versa)
export const CATEGORIES_LIST: CategoryDefinition[] = [
  { 
    id: 'produce', 
    labelDe: 'Obst & Gemüse', 
    labelEn: 'Produce', 
    keywords: ['apfel', 'apple', 'banane', 'banana', 'kartoffel', 'potato', 'salat', 'lettuce', 'tomate', 'tomato', 'gurke', 'cucumber', 'zwiebel', 'onion', 'karotte', 'carrot', 'paprika', 'pepper', 'knoblauch', 'garlic', 'limone', 'zitrone', 'lemon', 'lime', 'pilz', 'mushroom', 'beere', 'berry', 'kohl', 'cabbage', 'avocado', 'spinat', 'spinach', 'kräuter', 'herbs', 'ingwer', 'ginger'] 
  },
  { 
    id: 'dairy', 
    labelDe: 'Kühlregal', 
    labelEn: 'Dairy & Eggs', 
    keywords: ['milch', 'milk', 'käse', 'cheese', 'butter', 'joghurt', 'yogurt', 'sahne', 'cream', 'ei', 'egg', 'quark', 'curd', 'mozzarella', 'camembert', 'feta', 'ricotta'] 
  },
  { 
    id: 'meat', 
    labelDe: 'Fleisch & Fisch', 
    labelEn: 'Meat & Fish', 
    keywords: ['fleisch', 'meat', 'hähnchen', 'chicken', 'rind', 'beef', 'fisch', 'fish', 'wurst', 'sausage', 'steak', 'hack', 'mince', 'salami', 'schinken', 'ham', 'lachs', 'salmon', 'thunfisch', 'tuna'] 
  },
  { 
    id: 'grains', 
    labelDe: 'Getreide & Brot', 
    labelEn: 'Grains & Bread', 
    keywords: ['brot', 'bread', 'reis', 'rice', 'nudeln', 'pasta', 'mehl', 'flour', 'haferflocken', 'oats', 'brötchen', 'rolls', 'toast', 'spaghetti', 'fusilli', 'penne', 'back', 'yeast', 'hefe'] 
  },
  { 
    id: 'canned', 
    labelDe: 'Konserven & Saucen', 
    labelEn: 'Canned & Sauces', 
    keywords: ['dose', 'can', 'sauce', 'tomatenmark', 'ketchup', 'senf', 'mustard', 'öl', 'oil', 'essig', 'vinegar', 'pesto', 'konserve', 'bohnen', 'beans', 'mais', 'corn', 'erbse', 'pea', 'linsen', 'lentils', 'kokosmilch', 'coconut'] 
  },
  { 
    id: 'beverages', 
    labelDe: 'Getränke', 
    labelEn: 'Beverages', 
    keywords: ['wasser', 'water', 'saft', 'juice', 'bier', 'beer', 'wein', 'wine', 'cola', 'limo', 'soda', 'tee', 'tea', 'kaffee', 'coffee', 'drink', 'sirup', 'syrup'] 
  },
  { 
    id: 'household', 
    labelDe: 'Haushalt', 
    labelEn: 'Household', 
    keywords: ['papier', 'paper', 'reiniger', 'cleaner', 'seife', 'soap', 'shampoo', 'zahnpasta', 'toothpaste', 'waschmittel', 'detergent', 'schwam', 'sponge', 'müll', 'bag', 'folie', 'foil', 'batterie', 'battery'] 
  },
  { 
    id: 'snacks', 
    labelDe: 'Süßes & Salziges', 
    labelEn: 'Snacks', 
    keywords: ['chips', 'schokolade', 'chocolate', 'keks', 'cookie', 'nuss', 'nut', 'bonbon', 'candy', 'stange', 'stick', 'riegel', 'bar', 'gummi', 'jelly'] 
  },
];

export const OTHER_CATEGORY = { labelDe: 'Sonstiges', labelEn: 'Other', id: 'other' };

function matchesKeyword(text: string, keyword: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Strict matching for short words to avoid false positives (e.g. "Limo" in "Limone", "Ei" in "Brei")
  if (keyword.length <= 4) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(text);
  }
  
  return lowerText.includes(keyword);
}

export function categorizeItem(name: string | null): string {
  if (!name) return 'other';
  const lowerName = name.toLowerCase();

  for (const category of CATEGORIES_LIST) {
    if (category.keywords.some(k => matchesKeyword(lowerName, k))) {
      return category.id;
    }
  }
  return 'other';
}

export function getCategoryLabel(id: string, locale: 'de' | 'en' = 'de'): string {
  if (id === 'other') return locale === 'de' ? OTHER_CATEGORY.labelDe : OTHER_CATEGORY.labelEn;
  const category = CATEGORIES_LIST.find(c => c.id === id);
  return category ? (locale === 'de' ? category.labelDe : category.labelEn) : id;
}
