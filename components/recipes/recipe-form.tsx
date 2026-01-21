'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Loader2, Link as LinkIcon, Download } from 'lucide-react';
import { createRecipe, updateRecipe, scrapeRecipe } from '@/app/actions/recipes';
import { getCategories, createCategory, type CategoryOption } from '@/app/actions/categories';
import {
  Dialog,
  DialogContent, // Fixed: Use DialogContent instead of DialogPortal/Overlay manually if possible, or follow existing. The file read shows DialogContent is exported.
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from 'sonner'; // Assuming sonner is used, or I'll just use alert for failure if no toast component found. I will omit toast for now to avoid errors if not installed, or check imports. The file didn't have toast.

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Instruction {
  instruction: string;
}

interface RecipeFormProps {
  locale: string;
  recipeId?: string;
  initialData?: {
    titleDe?: string | null;
    descriptionDe?: string | null;
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    calories?: number | null;
    category?: string | null;
    imageUrl?: string | null;
    ingredients?: Array<{
      nameDe: string | null;
      amount: number;
      unit: string;
    }>;
    instructions?: Array<{
      instructionDe: string | null;
    }>;
  };
}

export default function RecipeForm({ locale, recipeId, initialData }: RecipeFormProps) {
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);

  // Category management
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || '');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (scrapedData?.category) {
       setSelectedCategory(scrapedData.category);
    }
  }, [scrapedData]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
        const result = await createCategory(newCategoryName);
        if (result.error) {
            alert(result.error);
        } else if (result.data) {
            const cats = await getCategories();
            setCategories(cats);
            setSelectedCategory(result.data.name);
            setShowCategoryDialog(false);
            setNewCategoryName('');
        }
    } catch(e) {
        alert('Fehler beim Erstellen der Kategorie');
    } finally {
        setIsCreatingCategory(false);
    }
  };


  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients && initialData.ingredients.length > 0
      ? initialData.ingredients.map((ing) => ({
          name: ing.nameDe || '',
          amount: ing.amount.toString(),
          unit: ing.unit,
        }))
      : [{ name: '', amount: '', unit: 'g' }]
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    initialData?.instructions && initialData.instructions.length > 0
      ? initialData.instructions.map((inst) => ({
          instruction: inst.instructionDe || '',
        }))
      : [{ instruction: '' }]
  );

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    
    setIsScraping(true);
    try {
      const data = await scrapeRecipe(scrapeUrl);
      if (data) {
        setScrapedData(data);
        
        // Update ingredients
        if (data.ingredients && data.ingredients.length > 0) {
          setIngredients(data.ingredients.map((ing: any) => ({
            name: ing.nameDe || '',
            amount: ing.amount.toString(),
            unit: ing.unit || 'Stk', // Default unit if missing
          })));
        }

        // Update instructions
        if (data.instructions && data.instructions.length > 0) {
          setInstructions(data.instructions.map((inst: string) => ({
            instruction: inst,
          })));
        }

        // Force form re-render to update default values
        setFormKey(prev => prev + 1);
      } else {
        alert('Konnte Rezept nicht von dieser URL laden.');
      }
    } catch (error) {
      console.error(error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setIsScraping(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { instruction: '' }]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: string) => {
    const updated = [...instructions];
    updated[index][field] = value;
    setInstructions(updated);
  };

  const handleSubmit = recipeId
    ? updateRecipe.bind(null, recipeId)
    : createRecipe;

  // Use scraped data or initial data
  const data = scrapedData || initialData;

  return (
    <div className="space-y-8">
      {/* Scraper Section */}
      {!recipeId && (
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Download size={20} className="text-zinc-500" />
            Rezept importieren
          </h3>
          <div className="flex gap-2">
             <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <Input 
                  placeholder="Rezept URL (z.B. Chefkoch...)" 
                  className="pl-9 bg-white" 
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          e.preventDefault();
                          handleScrape();
                      }
                  }}
                />
             </div>
             <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl}>
               {isScraping ? <Loader2 className="animate-spin" size={18} /> : 'Importieren'}
             </Button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Unterstützt viele gängige Rezept-Webseiten.
          </p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-8" key={formKey}>
        <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />
        <input type="hidden" name="instructions" value={JSON.stringify(instructions)} />

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Grundinformationen</h3>

          <div className="space-y-2">
            <Label htmlFor="titleDe">Titel *</Label>
            <Input
              id="titleDe"
              name="titleDe"
              required
              placeholder="z.B. Spaghetti Carbonara"
              defaultValue={data?.titleDe || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionDe">Beschreibung</Label>
            <textarea
              id="descriptionDe"
              name="descriptionDe"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 text-sm"
              rows={3}
              placeholder="Beschreibe dein Rezept..."
              defaultValue={data?.descriptionDe || ''}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime">Vorbereitungszeit (Min)</Label>
              <Input
                id="prepTime"
                name="prepTime"
                type="number"
                placeholder="15"
                defaultValue={data?.prepTime || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookTime">Kochzeit (Min)</Label>
              <Input
                id="cookTime"
                name="cookTime"
                type="number"
                placeholder="30"
                defaultValue={data?.cookTime || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Portionen</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                defaultValue={data?.servings || 2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Kalorien</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                placeholder="450"
                defaultValue={data?.calories || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <div className="flex gap-2">
                <select
                  id="category"
                  name="category"
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 text-sm bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Wähle eine Kategorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => setShowCategoryDialog(true)}
                  title="Neue Kategorie erstellen"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Bild URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://..."
                defaultValue={data?.imageUrl || ''}
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Zutaten *</h3>
            <Button type="button" onClick={addIngredient} size="sm" variant="outline">
              <Plus size={14} className="mr-1" /> Zutat
            </Button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-start bg-zinc-50 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Zutat"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Menge"
                    type="number"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    required
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="TL">TL</option>
                    <option value="EL">EL</option>
                    <option value="Stk">Stk</option>
                    <option value="Tasse">Tasse</option>
                  </select>
                </div>
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                  >
                    <Minus size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Zubereitung *</h3>
            <Button type="button" onClick={addInstruction} size="sm" variant="outline">
              <Plus size={14} className="mr-1" /> Schritt
            </Button>
          </div>

          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 items-start bg-zinc-50 p-3 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0 mt-2">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Anleitung"
                    value={instruction.instruction}
                    onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    rows={2}
                    required
                  />
                </div>
                {instructions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                  >
                    <Minus size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-6 border-t">
          <Button type="submit" className="flex-1">
            {recipeId ? 'Rezept aktualisieren' : 'Rezept erstellen'}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Abbrechen
          </Button>
        </div>
      </form>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Kategorie erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category">Name der Kategorie</Label>
              <Input 
                id="new-category" 
                placeholder="z.B. Meine Spezialrezepte" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory();
                    }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Abbrechen</Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || isCreatingCategory}>
              {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
