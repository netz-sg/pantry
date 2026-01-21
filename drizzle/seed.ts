import { db } from '../db/drizzle';
import { users, recipes, recipeIngredients, recipeInstructions, pantryItems } from '../db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const [demoUser] = await db.insert(users).values({
    email: 'demo@pantry.app',
    passwordHash: hashedPassword,
    name: 'Demo User',
    locale: 'de',
  }).returning();

  console.log('✅ Created demo user:', demoUser.email);

  // Seed Recipes (converted from sample.md REZEPTE)

  // Recipe 1: Thai Basil Chicken
  const [recipe1] = await db.insert(recipes).values({
    userId: demoUser.id,
    titleDe: 'Thai Basil Chicken',
    titleEn: 'Thai Basil Chicken',
    subtitleDe: 'Pad Kra Pao',
    subtitleEn: 'Pad Kra Pao',
    descriptionDe: 'Der Streetfood-Klassiker aus Bangkok. Scharf, schnell und unglaublich aromatisch. Das Geheimnis liegt im Holy Basil.',
    descriptionEn: 'The street food classic from Bangkok. Spicy, fast, and incredibly aromatic. The secret lies in the Holy Basil.',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1200',
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    calories: 450,
    category: 'asiatisch',
    tags: ['Scharf', 'Wok', 'High Protein'],
    isPublic: true,
  }).returning();

  await db.insert(recipeIngredients).values([
    { recipeId: recipe1.id, nameDe: 'Hähnchenbrust (gehackt)', nameEn: 'Chicken breast (minced)', amount: 400, unit: 'g', order: 1 },
    { recipeId: recipe1.id, nameDe: 'Thai Holy Basil', nameEn: 'Thai Holy Basil', amount: 2, unit: 'Handvoll', order: 2 },
    { recipeId: recipe1.id, nameDe: 'Knoblauchzehen', nameEn: 'Garlic cloves', amount: 4, unit: 'Stk', order: 3 },
    { recipeId: recipe1.id, nameDe: 'Vogelaugenchili', nameEn: 'Bird\'s eye chili', amount: 3, unit: 'Stk', order: 4 },
    { recipeId: recipe1.id, nameDe: 'Sojasauce (Hell)', nameEn: 'Soy sauce (light)', amount: 1, unit: 'EL', order: 5 },
    { recipeId: recipe1.id, nameDe: 'Austernsauce', nameEn: 'Oyster sauce', amount: 2, unit: 'EL', order: 6 },
    { recipeId: recipe1.id, nameDe: 'Spiegelei (Crispy)', nameEn: 'Fried egg (crispy)', amount: 2, unit: 'Stk', order: 7 },
  ]);

  await db.insert(recipeInstructions).values([
    { recipeId: recipe1.id, stepNumber: 1, instructionDe: 'Chili und Knoblauch im Mörser zu einer groben Paste verarbeiten.', instructionEn: 'Grind chili and garlic in a mortar to a coarse paste.' },
    { recipeId: recipe1.id, stepNumber: 2, instructionDe: 'Wok extrem heiß werden lassen. Öl hineingeben.', instructionEn: 'Heat wok extremely hot. Add oil.' },
    { recipeId: recipe1.id, stepNumber: 3, instructionDe: 'Paste kurz anbraten (Achtung: Dämpfe!), dann Fleisch dazu.', instructionEn: 'Briefly fry paste (caution: fumes!), then add meat.' },
    { recipeId: recipe1.id, stepNumber: 4, instructionDe: 'Fleisch scharf anbraten, nicht kochen lassen.', instructionEn: 'Sear meat sharply, don\'t let it cook.' },
    { recipeId: recipe1.id, stepNumber: 5, instructionDe: 'Saucen mischen und über das Fleisch geben. Einkochen lassen.', instructionEn: 'Mix sauces and pour over meat. Let it reduce.' },
    { recipeId: recipe1.id, stepNumber: 6, instructionDe: 'Hitze aus. Basilikum unterheben, bis es gerade so welk ist.', instructionEn: 'Turn off heat. Fold in basil until just wilted.' },
  ]);

  // Recipe 2: Midnight Risotto
  const [recipe2] = await db.insert(recipes).values({
    userId: demoUser.id,
    titleDe: 'Midnight Risotto',
    titleEn: 'Midnight Risotto',
    subtitleDe: 'Mit Waldpilzen & Thymian',
    subtitleEn: 'With Wild Mushrooms & Thyme',
    descriptionDe: 'Ein tiefes, erdiges Gericht für späte Abende. Geduld ist die wichtigste Zutat hier.',
    descriptionEn: 'A deep, earthy dish for late evenings. Patience is the most important ingredient here.',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-411dbe6372bf?auto=format&fit=crop&q=80&w=1200',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    calories: 620,
    category: 'italienisch',
    tags: ['Vegetarisch', 'Slow Food', 'Dinner'],
    isPublic: true,
  }).returning();

  await db.insert(recipeIngredients).values([
    { recipeId: recipe2.id, nameDe: 'Arborio Reis', nameEn: 'Arborio rice', amount: 350, unit: 'g', order: 1 },
    { recipeId: recipe2.id, nameDe: 'Getrocknete Steinpilze', nameEn: 'Dried porcini mushrooms', amount: 30, unit: 'g', order: 2 },
    { recipeId: recipe2.id, nameDe: 'Frische Pilze (Mix)', nameEn: 'Fresh mushrooms (mix)', amount: 400, unit: 'g', order: 3 },
    { recipeId: recipe2.id, nameDe: 'Weißwein (Trocken)', nameEn: 'White wine (dry)', amount: 200, unit: 'ml', order: 4 },
    { recipeId: recipe2.id, nameDe: 'Gemüsefond', nameEn: 'Vegetable stock', amount: 1.2, unit: 'L', order: 5 },
    { recipeId: recipe2.id, nameDe: 'Parmigiano Reggiano', nameEn: 'Parmigiano Reggiano', amount: 80, unit: 'g', order: 6 },
    { recipeId: recipe2.id, nameDe: 'Kalte Butter', nameEn: 'Cold butter', amount: 60, unit: 'g', order: 7 },
  ]);

  await db.insert(recipeInstructions).values([
    { recipeId: recipe2.id, stepNumber: 1, instructionDe: 'Steinpilze in heißem Wasser einweichen. Sud auffangen!', instructionEn: 'Soak porcini in hot water. Save the liquid!' },
    { recipeId: recipe2.id, stepNumber: 2, instructionDe: 'Frische Pilze scharf anbraten, beiseite stellen.', instructionEn: 'Sear fresh mushrooms sharply, set aside.' },
    { recipeId: recipe2.id, stepNumber: 3, instructionDe: 'Reis in derselben Pfanne glasig dünsten.', instructionEn: 'Sauté rice in the same pan until translucent.' },
    { recipeId: recipe2.id, stepNumber: 4, instructionDe: 'Mit Wein ablöschen. Reduzieren lassen.', instructionEn: 'Deglaze with wine. Let reduce.' },
    { recipeId: recipe2.id, stepNumber: 5, instructionDe: 'Pilzsud und heißen Fond kellenweise zugeben.', instructionEn: 'Add mushroom liquid and hot stock ladle by ladle.' },
    { recipeId: recipe2.id, stepNumber: 6, instructionDe: 'Nach 18 Min: Pilze, Butter und Käse kräftig unterrühren (Mantecare).', instructionEn: 'After 18 min: Vigorously stir in mushrooms, butter and cheese (Mantecare).' },
  ]);

  // Recipe 3: Royal Shakshuka
  const [recipe3] = await db.insert(recipes).values({
    userId: demoUser.id,
    titleDe: 'Royal Shakshuka',
    titleEn: 'Royal Shakshuka',
    subtitleDe: 'Frühstück für Götter',
    subtitleEn: 'Breakfast for Gods',
    descriptionDe: 'Pochierte Eier in einer reichhaltigen, würzigen Tomatensauce mit Harissa und Feta.',
    descriptionEn: 'Poached eggs in a rich, spicy tomato sauce with harissa and feta.',
    imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&q=80&w=1200',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    calories: 380,
    category: 'frühstück',
    tags: ['One Pot', 'Low Carb', 'Spicy'],
    isPublic: true,
  }).returning();

  await db.insert(recipeIngredients).values([
    { recipeId: recipe3.id, nameDe: 'Dosen-Tomaten (San Marzano)', nameEn: 'Canned tomatoes (San Marzano)', amount: 1, unit: 'Dose', order: 1 },
    { recipeId: recipe3.id, nameDe: 'Eier (Bio)', nameEn: 'Eggs (organic)', amount: 4, unit: 'Stk', order: 2 },
    { recipeId: recipe3.id, nameDe: 'Rote Paprika', nameEn: 'Red bell pepper', amount: 1, unit: 'Stk', order: 3 },
    { recipeId: recipe3.id, nameDe: 'Zwiebel', nameEn: 'Onion', amount: 1, unit: 'Stk', order: 4 },
    { recipeId: recipe3.id, nameDe: 'Harissa Paste', nameEn: 'Harissa paste', amount: 1, unit: 'EL', order: 5 },
    { recipeId: recipe3.id, nameDe: 'Feta', nameEn: 'Feta', amount: 100, unit: 'g', order: 6 },
    { recipeId: recipe3.id, nameDe: 'Kreuzkümmel', nameEn: 'Cumin', amount: 1, unit: 'TL', order: 7 },
  ]);

  await db.insert(recipeInstructions).values([
    { recipeId: recipe3.id, stepNumber: 1, instructionDe: 'Zwiebeln und Paprika weich dünsten.', instructionEn: 'Sauté onions and bell pepper until soft.' },
    { recipeId: recipe3.id, stepNumber: 2, instructionDe: 'Gewürze und Harissa kurz mitrösten.', instructionEn: 'Briefly toast spices and harissa.' },
    { recipeId: recipe3.id, stepNumber: 3, instructionDe: 'Tomaten dazu, zerdrücken und 10 Min einköcheln.', instructionEn: 'Add tomatoes, crush and simmer for 10 min.' },
    { recipeId: recipe3.id, stepNumber: 4, instructionDe: 'Mulden formen, Eier hineinschlagen.', instructionEn: 'Make wells, crack eggs into them.' },
    { recipeId: recipe3.id, stepNumber: 5, instructionDe: 'Deckel drauf. 5-7 Min stocken lassen.', instructionEn: 'Cover. Let eggs set for 5-7 min.' },
    { recipeId: recipe3.id, stepNumber: 6, instructionDe: 'Mit Feta und Koriander garnieren.', instructionEn: 'Garnish with feta and cilantro.' },
  ]);

  console.log('✅ Created 3 sample recipes');

  // Seed Pantry Items (converted from sample.md VORRAT_ITEMS)
  await db.insert(pantryItems).values([
    { userId: demoUser.id, nameDe: 'Reis', nameEn: 'Rice', quantity: 2, unit: 'kg', icon: '🍚', location: 'pantry' },
    { userId: demoUser.id, nameDe: 'Nudeln', nameEn: 'Pasta', quantity: 500, unit: 'g', icon: '🍝', location: 'pantry' },
    { userId: demoUser.id, nameDe: 'Olivenöl', nameEn: 'Olive oil', quantity: 1, unit: 'L', icon: '🫒', location: 'cabinet' },
    { userId: demoUser.id, nameDe: 'Dosentomaten', nameEn: 'Canned tomatoes', quantity: 4, unit: 'Dosen', icon: '🥫', location: 'pantry' },
    { userId: demoUser.id, nameDe: 'Mehl', nameEn: 'Flour', quantity: 800, unit: 'g', icon: '🌾', location: 'pantry' },
  ]);

  console.log('✅ Created 5 pantry items');
  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('📧 Demo user: demo@pantry.app');
  console.log('🔑 Password: Demo123!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
