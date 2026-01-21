'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addShoppingItem } from '@/app/actions/shopping';
import { UNITS } from '@/lib/constants';

interface ShoppingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}

export default function ShoppingDialog({ open, onOpenChange, locale }: ShoppingDialogProps) {
  const handleSubmit = async (formData: FormData) => {
    await addShoppingItem(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Artikel hinzufügen</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nameDe">Name (Deutsch) *</Label>
              <Input
                id="nameDe"
                name="nameDe"
                required
                placeholder="z.B. Milch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Name (English)</Label>
              <Input
                id="nameEn"
                name="nameEn"
                placeholder="e.g. Milk"
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
                defaultValue="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Einheit *</Label>
              <select
                id="unit"
                name="unit"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                defaultValue="Stk"
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

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Hinzufügen
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
