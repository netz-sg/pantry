'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, Trash2, Edit } from 'lucide-react';
import { updatePantryQuantity, deletePantryItem } from '@/app/actions/pantry';
import { Button } from '@/components/ui/button';

interface PantryItemProps {
  item: {
    id: string;
    nameDe: string | null;
    nameEn: string | null;
    quantity: number;
    unit: string;
    location: string | null;
    icon: string | null;
    expiryDate: string | null;
  };
  locale: string;
  onEdit: () => void;
}

export default function PantryItem({ item, locale, onEdit }: PantryItemProps) {
  const [isPending, startTransition] = useTransition();
  const name = locale === 'de' ? item.nameDe : item.nameEn;

  const handleIncrement = () => {
    startTransition(() => {
      updatePantryQuantity(item.id, 1);
    });
  };

  const handleDecrement = () => {
    if (item.quantity > 0) {
      startTransition(() => {
        updatePantryQuantity(item.id, -1);
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Möchtest du diesen Artikel wirklich löschen?')) {
      startTransition(() => {
        deletePantryItem(item.id);
      });
    }
  };

  const isExpiringSoon = item.expiryDate
    ? new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

  const isExpired = item.expiryDate ? new Date(item.expiryDate) < new Date() : false;

  return (
    <div
      className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
        isExpired ? 'border-red-200 bg-red-50/50' : isExpiringSoon ? 'border-orange-200' : 'border-zinc-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-2xl flex-shrink-0">
          {item.icon || '📦'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 truncate">{name || 'Unnamed Item'}</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
            {item.location && (
              <span className="px-2 py-0.5 bg-zinc-100 rounded-full">{item.location}</span>
            )}
            {item.expiryDate && (
              <span
                className={`px-2 py-0.5 rounded-full ${
                  isExpired
                    ? 'bg-red-100 text-red-700'
                    : isExpiringSoon
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-zinc-100'
                }`}
              >
                {new Date(item.expiryDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecrement}
              disabled={isPending || item.quantity === 0}
              className="h-8 w-8 p-0"
            >
              <Minus size={14} />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {item.quantity} {item.unit}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleIncrement}
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
