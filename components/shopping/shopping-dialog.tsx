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
      <DialogContent className="sm:max-w-[400px] bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Artikel hinzufügen</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nameDe" className="text-zinc-400">Name</Label>
              <Input
                id="nameDe"
                name="nameDe"
                required
                placeholder="z.B. Milch"
                className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
              />
            </div>
            {/* English name removed */}
          </div>

          <div className="hidden">
            <Input type="hidden" name="quantity" value="1" />
            <Input type="hidden" name="unit" value="Stk" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              Hinzufügen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
