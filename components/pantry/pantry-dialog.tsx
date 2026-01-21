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
import { PANTRY_LOCATIONS, PANTRY_ICONS, UNITS } from '@/lib/constants';

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
    icon: string | null;
    expiryDate: string | null;
  } | null;
}

export default function PantryDialog({ open, onOpenChange, locale, editItem }: PantryDialogProps) {
  const isEditing = !!editItem;

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Artikel bearbeiten' : 'Neuer Vorrat'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nameDe">Name (Deutsch) *</Label>
              <Input
                id="nameDe"
                name="nameDe"
                required
                placeholder="z.B. Tomaten"
                defaultValue={editItem?.nameDe || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Name (English)</Label>
              <Input
                id="nameEn"
                name="nameEn"
                placeholder="e.g. Tomatoes"
                defaultValue={editItem?.nameEn || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Menge *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.1"
                required
                defaultValue={editItem?.quantity || 1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Einheit *</Label>
              <select
                id="unit"
                name="unit"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
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
            <Label htmlFor="location">Lagerort</Label>
            <select
              id="location"
              name="location"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
              defaultValue={editItem?.location || ''}
            >
              <option value="">Keine Angabe</option>
              {PANTRY_LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.icon} {locale === 'de' ? loc.labelDe : loc.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {PANTRY_ICONS.map((iconOption) => (
                <label
                  key={iconOption}
                  className="cursor-pointer flex items-center justify-center h-10 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-100"
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
            <Label htmlFor="expiryDate">Ablaufdatum (optional)</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              defaultValue={editItem?.expiryDate || ''}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Speichern' : 'Hinzufügen'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
