'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShoppingItem from '@/components/shopping/shopping-item';
import ShoppingDialog from '@/components/shopping/shopping-dialog';
import { getShoppingList, clearCheckedItems } from '@/app/actions/shopping';

export const dynamic = 'force-dynamic';

interface ShoppingListItem {
  id: string;
  nameDe: string | null;
  nameEn: string | null;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  recipeId: string | null;
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const locale = 'de';

  useEffect(() => {
    loadItems();
  }, [locale]);

  const loadItems = async () => {
    const data = await getShoppingList();
    setItems(data);
  };

  const handleAddClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadItems();
    }
  };

  const handleClearChecked = async () => {
    if (confirm('Möchtest du alle erledigten Artikel löschen?')) {
      await clearCheckedItems();
      loadItems();
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-zinc-200/50 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Einkaufsliste</h1>
          <p className="text-zinc-500 font-medium text-lg">
             <span className="text-black font-bold">{uncheckedItems.length}</span> Dinge zu erledigen
          </p>
        </div>
        <div className="flex gap-3">
          {checkedItems.length > 0 && (
            <Button variant="ghost" onClick={handleClearChecked} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
              <Trash2 size={18} className="mr-2" />
              Aufräumen
            </Button>
          )}
          <Button onClick={handleAddClick} className="bg-black hover:bg-zinc-800 text-white rounded-xl font-bold px-6 shadow-lg shadow-zinc-900/20">
            <Plus size={18} className="mr-2" />
            Hinzufügen
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[32px] border-4 border-dashed border-zinc-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
             <ShoppingBag size={40} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-3">
            Alles erledigt!
          </h3>
          <p className="text-zinc-500 mb-8 max-w-sm text-lg">
            Deine Liste ist leer. Zeit, den Kühlschrank wieder aufzufüllen?
          </p>
          <Button onClick={handleAddClick} className="h-12 px-8 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all hover:-translate-y-1 shadow-xl">
            Ersten Artikel hinzufügen
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-zinc-200/50 min-h-[500px]">
          {/* Unchecked Items */}
          {uncheckedItems.length > 0 && (
            <div className="space-y-4 mb-10">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 mb-4">
                Noch zu kaufen
              </h3>
              <div className="space-y-2">
                {uncheckedItems.map((item) => (
                  <ShoppingItem key={item.id} item={item} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em] px-2 mb-4">
                Bereits im Wagen ({checkedItems.length})
              </h3>
              <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                {checkedItems.map((item) => (
                  <ShoppingItem key={item.id} item={item} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Dialog */}
      <ShoppingDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        locale={locale}
      />
    </div>
  );
}
