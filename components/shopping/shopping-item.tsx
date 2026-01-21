'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toggleShoppingItem, deleteShoppingItem } from '@/app/actions/shopping';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ShoppingItemProps {
  item: {
    id: string;
    nameDe: string | null;
    nameEn: string | null;
    quantity: number | null;
    unit: string | null;
    checked: boolean;
    recipeId: string | null;
  };
  locale: string;
  onUpdate: () => void;
}

export default function ShoppingItem({ item, locale, onUpdate }: ShoppingItemProps) {
  const [isPending, startTransition] = useTransition();
  const name = locale === 'de' ? item.nameDe : item.nameEn;

  const handleToggle = () => {
    startTransition(async () => {
      await toggleShoppingItem(item.id);
      onUpdate();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteShoppingItem(item.id);
      onUpdate();
    });
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 transition-all group ${
        item.checked
          ? 'bg-transparent'
          : 'bg-zinc-900/0 hover:bg-white/5'
      }`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
            item.checked 
                ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                : 'border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
        }`}
      />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span
          className={`font-medium text-lg leading-none transition-all ${
            item.checked ? 'line-through text-zinc-600' : 'text-zinc-100'
          }`}
        >
          {name || 'Unknown'}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isPending}
        className={`h-8 w-8 p-0 rounded-full transition-all ${item.checked ? 'text-zinc-700 hover:text-red-400 opacity-50 hover:opacity-100' : 'text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100'}`}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
