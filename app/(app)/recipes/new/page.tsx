import RecipeForm from '@/components/recipes/recipe-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewRecipePage() {
  const locale = 'de';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <Link
          href="/recipes"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Neues Rezept</h1>
          <p className="text-zinc-500 text-sm">Erstelle ein neues Rezept für dein Kochbuch</p>
        </div>
      </div>

      {/* Form */}
      <RecipeForm locale={locale} />
    </div>
  );
}
