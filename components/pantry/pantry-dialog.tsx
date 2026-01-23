'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addPantryItem, updatePantryItem } from '@/app/actions/pantry';
import { PANTRY_LOCATIONS, PANTRY_CATEGORIES, PANTRY_ICONS, UNITS } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface PantryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  editItem?: {
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
  } | null;
}

export default function PantryDialog({ open, onOpenChange, locale, editItem }: PantryDialogProps) {
  const isEditing = !!editItem;
  const t = useTranslations('pantry');
  const tCommon = useTranslations('common');

  const handleSubmit = async (formData: FormData) => {
    if (isEditing && editItem) {
      await updatePantryItem(editItem.id, formData);
    } else {
      await addPantryItem(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? t('editItem') : t('newItem')}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nameDe" className="text-zinc-400">{t('itemName')}</Label>
              <Input
                id="nameDe"
                name="nameDe"
                required
                placeholder="z.B. Tomaten"
                defaultValue={editItem?.nameDe || ''}
                className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
              />
            </div>
            {/* English name field removed as per request */}
            <input type="hidden" name="nameEn" value={editItem?.nameEn || ''} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-zinc-400">{t('quantity')} *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.1"
                required
                defaultValue={editItem?.quantity || 1}
                className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-zinc-400">{t('unit')} *</Label>
              <select
                id="unit"
                name="unit"
                className="w-full px-3 py-2 border border-white/10 text-white bg-zinc-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                defaultValue={editItem?.unit || 'Stk'}
                required
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {locale === 'de' ? unit.labelDe : unit.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-zinc-400">{t('location')}</Label>
            <select
              id="location"
              name="location"
              className="w-full px-3 py-2 border border-white/10 text-white bg-zinc-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              defaultValue={editItem?.location || ''}
            >
              <option value="">{t('noLocation')}</option>
              {PANTRY_LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.icon} {locale === 'de' ? loc.labelDe : loc.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-zinc-400">{t('category')}</Label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-white/10 text-white bg-zinc-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              defaultValue={editItem?.category || 'other'}
            >
              {PANTRY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {locale === 'de' ? cat.labelDe : cat.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon" className="text-zinc-400">{t('icon')}</Label>
            <div className="grid grid-cols-8 gap-2">
              {PANTRY_ICONS.map((iconOption) => (
                <label
                  key={iconOption}
                  className="cursor-pointer flex items-center justify-center h-10 border border-white/10 rounded-lg hover:bg-white/5 transition-colors has-[:checked]:border-white/40 has-[:checked]:bg-white/10"
                >
                  <input
                    type="radio"
                    name="icon"
                    value={iconOption}
                    defaultChecked={editItem?.icon === iconOption || (!editItem && iconOption === PANTRY_ICONS[0])}
                    className="sr-only"
                  />
                  <span className="text-xl">{iconOption}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-zinc-400">{t('expiryDate')}</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              defaultValue={editItem?.expiryDate || ''}
              className="bg-zinc-950 border-white/10 text-white focus-visible:ring-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold" className="text-zinc-400">{t('lowStockThreshold')}</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              step="0.1"
              placeholder="z.B. 2"
              defaultValue={editItem?.lowStockThreshold || ''}
              className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
            />
            <p className="text-xs text-zinc-500">{t('lowStockWarning')}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              {isEditing ? tCommon('save') : tCommon('add')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
