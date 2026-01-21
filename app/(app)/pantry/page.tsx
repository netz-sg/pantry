'use client';

import { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PantryItem from '@/components/pantry/pantry-item';
import PantryDialog from '@/components/pantry/pantry-dialog';
import { getPantryItems } from '@/app/actions/pantry';

export const dynamic = 'force-dynamic';

interface PantryItem {
  id: string;
  nameDe: string | null;
  nameEn: string | null;
  quantity: number;
  unit: string;
  location: string | null;
  icon: string | null;
  expiryDate: string | null;
}

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);
  const locale = 'de';

  useEffect(() => {
    loadItems();
  }, [locale]);

  const loadItems = async () => {
    const data = await getPantryItems();
    setItems(data);
  };

  const handleAddClick = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEditClick = (item: PantryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadItems();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
        <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Vorratskammer</h1>
          <p className="text-zinc-500 text-lg">
             Behalte den Überblick über deine Bestände.
          </p>
        </div>
        <Button onClick={handleAddClick} className="bg-black hover:bg-zinc-800 text-white rounded-xl font-bold px-6 py-6 shadow-lg shadow-zinc-900/10 transition-all hover:-translate-y-0.5">
          <Plus size={20} className="mr-2" />
          Artikel erfassen
        </Button>
      </div>

       <div className="h-px bg-zinc-100" />

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[32px] border-4 border-dashed border-zinc-100">
           <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
             <Package size={40} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-3">Gähnende Leere</h3>
          <p className="text-zinc-500 mb-8 max-w-sm text-lg">Erfasse deine Vorräte, um Lebensmittelverschwendung zu vermeiden.</p>
          <Button onClick={handleAddClick} className="h-12 px-8 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all hover:-translate-y-1 shadow-xl">
            Ersten Artikel hinzufügen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <PantryItem
              key={item.id}
              item={item}
              locale={locale}
              onEdit={() => handleEditClick(item)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <PantryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        locale={locale}
        editItem={editItem}
      />
    </div>
  );
}
