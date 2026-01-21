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
}

export default function ShoppingItem({ item, locale }: ShoppingItemProps) {
  const [isPending, startTransition] = useTransition();
  const name = locale === 'de' ? item.nameDe : item.nameEn;

  const handleToggle = () => {
    startTransition(() => {
      toggleShoppingItem(item.id);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteShoppingItem(item.id);
    });
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        item.checked
          ? 'bg-zinc-50 border-zinc-200'
          : 'bg-white border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            item.checked ? 'line-through text-zinc-400' : 'text-zinc-900'
          }`}
        >
          {name || 'Unnamed Item'}
        </p>
        <p className={`text-sm ${item.checked ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {item.quantity} {item.unit}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isPending}
        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 flex-shrink-0"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
