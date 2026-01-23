'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trash2, ShoppingBag, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShoppingItem from '@/components/shopping/shopping-item';
import ShoppingDialog from '@/components/shopping/shopping-dialog';
import QuickAdd from '@/components/shopping/quick-add';
import { getShoppingList, clearCheckedItems } from '@/app/actions/shopping';
import { categorizeItem, getCategoryLabel, CATEGORIES_LIST } from '@/lib/shopping-utils';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

interface ShoppingListItem {
  id: string;
  nameDe: string | null;
  nameEn: string | null;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  recipeId: string | null;
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const locale = 'en' as 'de' | 'en';
  const t = useTranslations('shopping');
  const tCommon = useTranslations('common');

  useEffect(() => {
    loadItems();
  }, [locale]);

  const loadItems = async () => {
    const data = await getShoppingList();
    setItems(data);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadItems();
    }
  };

  const handleClearChecked = async () => {
    // Optimistic update could go here, but for safety we confirm
    if (confirm(t('confirmClearChecked'))) {
      await clearCheckedItems();
      loadItems();
    }
  };

  // Grouping Logic
  const { groupedItems, sortedCategories, uncheckedCount, checkedItems, progress } = useMemo(() => {
    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);

    // Group unchecked items
    const groups: Record<string, ShoppingListItem[]> = {};

    unchecked.forEach(item => {
      const name = locale === 'de' ? item.nameDe : item.nameEn;
      const catKey = categorizeItem(name || '');
      if (!groups[catKey]) groups[catKey] = [];
      groups[catKey].push(item);
    });

    // Calculate progress
    const total = items.length;
    const done = checked.length;
    const prog = total === 0 ? 0 : Math.round((done / total) * 100);

    // Sort categories based on the defined list order, with 'other' at the end
    const categoryOrder = CATEGORIES_LIST.map(c => c.id);
    const sorted = Object.keys(groups).sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;

      const idxA = categoryOrder.indexOf(a);
      const idxB = categoryOrder.indexOf(b);

      // If both are known categories, sort by predefined order
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // If one is unknown (shouldn't happen with current logic but safe fallback), push to end
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;

      return a.localeCompare(b);
    });

    return {
      groupedItems: groups,
      sortedCategories: sorted,
      uncheckedCount: unchecked.length,
      checkedItems: checked,
      progress: prog
    };
  }, [items, locale]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700">

      {/* Header Section */}
      <div className="space-y-6 sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl -mx-4 px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('title')}</h1>
            <p className="text-zinc-400 text-sm">
              {uncheckedCount > 0
                ? t('itemsOpen', { count: uncheckedCount })
                : t('allDone')}
            </p>
          </div>

          {/* Progress Ring or Percentage */}
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <div className="text-right">
                <span className="text-2xl font-black text-white/20">{progress}%</span>
              </div>
            )}
            <Button
              onClick={() => setDialogOpen(true)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white bg-white/5 hover:bg-white/10 rounded-full"
            >
              <ShoppingBag size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {items.length > 0 && (
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Quick Add */}
        <QuickAdd onItemAdded={loadItems} locale={locale} />
      </div>

      {/* Main List */}
      <div className="space-y-8 min-h-[300px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <ShoppingBag className="text-zinc-600" size={32} />
            </div>
            <p className="text-zinc-500">{t('emptyList')}</p>
          </div>
        ) : (
          <>
            {/* Categories */}
            {sortedCategories.map(catKey => (
              <div key={catKey} className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  {getCategoryLabel(catKey, locale as 'de' | 'en')}
                </h3>
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm divide-y divide-white/5 shadow-sm">
                  {groupedItems[catKey].map(item => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      locale={locale}
                      onUpdate={loadItems}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Checked Items Section */}
            {checkedItems.length > 0 && (
              <div className="pt-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                    {t('done')} ({checkedItems.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChecked}
                    className="h-6 text-xs text-red-900 hover:text-red-400 hover:bg-red-950/30 px-2 rounded-full"
                  >
                    {t('clearAll')}
                  </Button>
                </div>
                <div className="space-y-1 opacity-60 hover:opacity-100 transition-opacity">
                  {checkedItems.map(item => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      locale={locale}
                      onUpdate={loadItems}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ShoppingDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        locale={locale}
      />
    </div>
  );
}

