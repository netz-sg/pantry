// Measurement Units
export const UNITS = [
  { value: 'g', labelDe: 'g', labelEn: 'g' },
  { value: 'kg', labelDe: 'kg', labelEn: 'kg' },
  { value: 'ml', labelDe: 'ml', labelEn: 'ml' },
  { value: 'L', labelDe: 'L', labelEn: 'L' },
  { value: 'TL', labelDe: 'TL', labelEn: 'tsp' },
  { value: 'EL', labelDe: 'EL', labelEn: 'tbsp' },
  { value: 'Tasse', labelDe: 'Tasse', labelEn: 'cup' },
  { value: 'Stk', labelDe: 'Stk', labelEn: 'pc' },
  { value: 'Handvoll', labelDe: 'Handvoll', labelEn: 'handful' },
  { value: 'Prise', labelDe: 'Prise', labelEn: 'pinch' },
  { value: 'Dose', labelDe: 'Dose', labelEn: 'can' },
] as const;

// Recipe Categories
export const CATEGORIES = [
  { value: 'frühstück', labelDe: 'Frühstück', labelEn: 'Breakfast', icon: '🌅' },
  { value: 'lunch', labelDe: 'Mittagessen', labelEn: 'Lunch', icon: '🍱' },
  { value: 'dinner', labelDe: 'Abendessen', labelEn: 'Dinner', icon: '🍽️' },
  { value: 'snack', labelDe: 'Snack', labelEn: 'Snack', icon: '🍿' },
  { value: 'dessert', labelDe: 'Dessert', labelEn: 'Dessert', icon: '🍰' },
  { value: 'asiatisch', labelDe: 'Asiatisch', labelEn: 'Asian', icon: '🥢' },
  { value: 'italienisch', labelDe: 'Italienisch', labelEn: 'Italian', icon: '🍝' },
  { value: 'mexikanisch', labelDe: 'Mexikanisch', labelEn: 'Mexican', icon: '🌮' },
  { value: 'indisch', labelDe: 'Indisch', labelEn: 'Indian', icon: '🍛' },
  { value: 'vegetarisch', labelDe: 'Vegetarisch', labelEn: 'Vegetarian', icon: '🥗' },
  { value: 'vegan', labelDe: 'Vegan', labelEn: 'Vegan', icon: '🌱' },
] as const;

// Recipe Tags
export const POPULAR_TAGS = [
  { value: 'quick', labelDe: 'Schnell', labelEn: 'Quick' },
  { value: 'easy', labelDe: 'Einfach', labelEn: 'Easy' },
  { value: 'healthy', labelDe: 'Gesund', labelEn: 'Healthy' },
  { value: 'low-carb', labelDe: 'Low Carb', labelEn: 'Low Carb' },
  { value: 'high-protein', labelDe: 'High Protein', labelEn: 'High Protein' },
  { value: 'spicy', labelDe: 'Scharf', labelEn: 'Spicy' },
  { value: 'comfort-food', labelDe: 'Comfort Food', labelEn: 'Comfort Food' },
  { value: 'one-pot', labelDe: 'One Pot', labelEn: 'One Pot' },
  { value: 'meal-prep', labelDe: 'Meal Prep', labelEn: 'Meal Prep' },
  { value: 'family-friendly', labelDe: 'Familienfreundlich', labelEn: 'Family Friendly' },
] as const;

// Meal Types
export const MEAL_TYPES = [
  { value: 'breakfast', labelDe: 'Frühstück', labelEn: 'Breakfast', icon: '🌅' },
  { value: 'lunch', labelDe: 'Mittagessen', labelEn: 'Lunch', icon: '🍱' },
  { value: 'dinner', labelDe: 'Abendessen', labelEn: 'Dinner', icon: '🍽️' },
  { value: 'snack', labelDe: 'Snack', labelEn: 'Snack', icon: '🍿' },
] as const;

// Pantry Locations
export const PANTRY_LOCATIONS = [
  { value: 'fridge', labelDe: 'Kühlschrank', labelEn: 'Fridge', icon: '🧊' },
  { value: 'freezer', labelDe: 'Gefrierschrank', labelEn: 'Freezer', icon: '❄️' },
  { value: 'pantry', labelDe: 'Vorratskammer', labelEn: 'Pantry', icon: '🏺' },
  { value: 'cabinet', labelDe: 'Schrank', labelEn: 'Cabinet', icon: '🗄️' },
] as const;

// Pantry Categories
export const PANTRY_CATEGORIES = [
  { value: 'produce', labelDe: 'Obst & Gemüse', labelEn: 'Produce', icon: '🥬' },
  { value: 'dairy', labelDe: 'Milchprodukte', labelEn: 'Dairy', icon: '🥛' },
  { value: 'meat', labelDe: 'Fleisch & Fisch', labelEn: 'Meat & Fish', icon: '🥩' },
  { value: 'grains', labelDe: 'Getreide', labelEn: 'Grains', icon: '🌾' },
  { value: 'canned', labelDe: 'Konserven', labelEn: 'Canned', icon: '🥫' },
  { value: 'spices', labelDe: 'Gewürze', labelEn: 'Spices', icon: '🧂' },
  { value: 'beverages', labelDe: 'Getränke', labelEn: 'Beverages', icon: '🥤' },
  { value: 'snacks', labelDe: 'Snacks', labelEn: 'Snacks', icon: '🍿' },
  { value: 'other', labelDe: 'Sonstiges', labelEn: 'Other', icon: '📦' },
] as const;

// Days of the Week
export const WEEKDAYS = [
  { value: 0, labelDe: 'Sonntag', labelEn: 'Sunday', short: 'So' },
  { value: 1, labelDe: 'Montag', labelEn: 'Monday', short: 'Mo' },
  { value: 2, labelDe: 'Dienstag', labelEn: 'Tuesday', short: 'Di' },
  { value: 3, labelDe: 'Mittwoch', labelEn: 'Wednesday', short: 'Mi' },
  { value: 4, labelDe: 'Donnerstag', labelEn: 'Thursday', short: 'Do' },
  { value: 5, labelDe: 'Freitag', labelEn: 'Friday', short: 'Fr' },
  { value: 6, labelDe: 'Samstag', labelEn: 'Saturday', short: 'Sa' },
] as const;

// Common Pantry Item Icons
export const PANTRY_ICONS = [
  '🍚', '🍝', '🫒', '🥫', '🌾', '🧈', '🥛', '🥚',
  '🧀', '🍞', '🥖', '🧂', '🧄', '🧅', '🥔', '🥕',
  '🍅', '🥒', '🌶️', '🫑', '🥬', '🥦', '🍄', '🌽',
] as const;

// Default Servings
export const DEFAULT_SERVINGS = 2;

// Default Prep/Cook Times (in minutes)
export const DEFAULT_PREP_TIME = 15;
export const DEFAULT_COOK_TIME = 30;

// Image Placeholders
export const RECIPE_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200';

// Date Formats
export const DATE_FORMAT_SHORT = 'dd.MM.yyyy'; // German style
export const DATE_FORMAT_LONG = 'EEEE, dd. MMMM yyyy';
export const DATE_FORMAT_ISO = 'yyyy-MM-dd';
