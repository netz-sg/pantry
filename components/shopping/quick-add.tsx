'use client';

import { useState, useTransition } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addShoppingItem } from '@/app/actions/shopping';

interface QuickAddProps {
  onItemAdded: () => void;
  locale: string;
}

export default function QuickAdd({ onItemAdded, locale }: QuickAddProps) {
  const [value, setValue] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const formData = new FormData();
    formData.append('nameDe', value);
    formData.append('nameEn', value);
    formData.append('quantity', '1');
    formData.append('unit', 'Stk'); // Default unit

    startTransition(async () => {
      try {
        await addShoppingItem(formData);
        setValue('');
        onItemAdded();
      } catch (error) {
        console.error('Failed to add item', error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Schnell hinzufügen (z.B. Milch)..."
          disabled={isPending}
          className="h-14 pl-5 pr-12 rounded-2xl bg-zinc-900/50 border-white/10 text-lg text-white placeholder:text-zinc-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 shadow-lg shadow-black/5 transition-all w-full"
        />
        <div className="absolute right-2">
            <Button
            type="submit"
            size="sm"
            disabled={!value.trim() || isPending}
            className={`h-10 w-10 rounded-xl transition-all ${value.trim() ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-transparent text-zinc-600'}`}
            >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
            </Button>
        </div>
      </div>
    </form>
  );
}
