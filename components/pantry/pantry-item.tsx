'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { updatePantryQuantity, deletePantryItem } from '@/app/actions/pantry';
import { Button } from '@/components/ui/button';
import { PANTRY_CATEGORIES, PANTRY_LOCATIONS } from '@/lib/constants';

interface PantryItemProps {
  item: {
    id: string;
    nameDe: string | null;
    nameEn: string | null;
    quantity: number;
    unit: string;
    location: string | null;
    category: string | null;
    icon: string | null;
    expiryDate: string | null;
    lowStockThreshold: number | null;
  };
  locale: string;
  onEdit: () => void;
}

export default function PantryItem({ item, locale, onEdit }: PantryItemProps) {
  const [isPending, startTransition] = useTransition();
  const name = locale === 'de' ? (item.nameDe || item.nameEn) : (item.nameEn || item.nameDe);

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

  const isLowStock = item.lowStockThreshold !== null && item.quantity <= item.lowStockThreshold;

  const categoryInfo = PANTRY_CATEGORIES.find(cat => cat.value === item.category);
  const locationInfo = PANTRY_LOCATIONS.find(loc => loc.value === item.location);

  return (
    <div
      className={`border rounded-xl p-4 hover:shadow-md transition-all ${isExpired
          ? 'border-red-500/30 bg-red-950/20'
          : isExpiringSoon
            ? 'border-orange-500/30 bg-orange-950/20'
            : isLowStock
              ? 'border-yellow-500/30 bg-yellow-950/20'
              : 'border-white/10 bg-zinc-900/50 backdrop-blur-md hover:border-white/20'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 border border-white/5">
          {item.icon || '📦'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{name || 'Unnamed Item'}</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
            {locationInfo && (
              <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full">
                {locationInfo.icon} {locale === 'de' ? locationInfo.labelDe : locationInfo.labelEn}
              </span>
            )}
            {categoryInfo && (
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                {categoryInfo.icon} {locale === 'de' ? categoryInfo.labelDe : categoryInfo.labelEn}
              </span>
            )}
            {isLowStock && (
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                <AlertCircle size={12} />
                Niedriger Bestand
              </span>
            )}
            {item.expiryDate && (
              <span
                className={`px-2 py-0.5 rounded-full border ${isExpired
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : isExpiringSoon
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      : 'bg-white/5 border-white/5'
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
              className="h-8 w-8 p-0 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20"
            >
              <Minus size={14} />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center text-white">
              {item.quantity} {item.unit}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleIncrement}
              disabled={isPending}
              className="h-8 w-8 p-0 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20"
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
            className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
