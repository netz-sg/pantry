'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PantryItem from '@/components/pantry/pantry-item';
import PantryDialog from '@/components/pantry/pantry-dialog';
import PantryStats from '@/components/pantry/pantry-stats';
import PantryQuickAdd from '@/components/pantry/pantry-quick-add';
import { getPantryItems } from '@/app/actions/pantry';
import { PANTRY_LOCATIONS, PANTRY_CATEGORIES } from '@/lib/constants';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

interface PantryItem {
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
  createdAt: Date | null;
}

type SortOption = 'name-asc' | 'quantity-desc' | 'expiry-asc' | 'recent';
type StatusFilter = 'all' | 'expiring' | 'expired' | 'fresh';

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const locale = 'en' as 'de' | 'en';
  const t = useTranslations('pantry');
  const tCommon = useTranslations('common');

  useEffect(() => {
    loadItems();
  }, [locale]);

  const loadItems = async () => {
    const data = await getPantryItems();
    setItems(data);
  };

  const handleAddClick = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEditClick = (item: PantryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadItems();
    }
  };

  // Filter and sort logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.nameDe?.toLowerCase().includes(query) ||
        item.nameEn?.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.location === locationFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(item => {
        if (!item.expiryDate) {
          return statusFilter === 'fresh';
        }
        const expiryDate = new Date(item.expiryDate);

        if (statusFilter === 'expired') {
          return expiryDate < now;
        } else if (statusFilter === 'expiring') {
          return expiryDate > now && expiryDate <= sevenDaysFromNow;
        } else if (statusFilter === 'fresh') {
          return expiryDate > sevenDaysFromNow;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.nameDe || '').localeCompare(b.nameDe || '');
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'expiry-asc':
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'recent':
        default:
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [items, searchQuery, locationFilter, categoryFilter, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery || locationFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{t('title')}</h1>
          <p className="text-zinc-400 text-lg">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleAddClick} className="bg-white hover:bg-zinc-200 text-black rounded-xl font-bold px-6 py-6 shadow-lg shadow-white/5 transition-all hover:-translate-y-0.5">
          <Plus size={20} className="mr-2" />
          {t('addItem')}
        </Button>
      </div>

      <div className="h-px bg-white/10" />

      {/* Stats Dashboard */}
      <PantryStats items={items} locale={locale} />

      {/* Quick Add */}
      <PantryQuickAdd onItemAdded={loadItems} locale={locale} />

      {/* Search and Filters */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCommon('search') + '...'}
              className="h-12 pl-12 pr-4 rounded-xl bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {/* Location Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLocationFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${locationFilter === 'all'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('allLocations')}
              </button>
              {PANTRY_LOCATIONS.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => setLocationFilter(loc.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${locationFilter === loc.value
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                    } border`}
                >
                  {loc.icon} {locale === 'de' ? loc.labelDe : loc.labelEn}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${categoryFilter === 'all'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('allCategories')}
              </button>
              {PANTRY_CATEGORIES.slice(0, 5).map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${categoryFilter === cat.value
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                    } border`}
                >
                  {cat.icon} {locale === 'de' ? cat.labelDe : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === 'all'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('allStatus')}
              </button>
              <button
                onClick={() => setStatusFilter('fresh')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === 'fresh'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('fresh')}
              </button>
              <button
                onClick={() => setStatusFilter('expiring')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === 'expiring'
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('expiringSoon')}
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === 'expired'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5'
                  } border`}
              >
                {t('expired')}
              </button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-900/50 border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              <option value="recent">{t('recentlyAdded')}</option>
              <option value="name-asc">{t('nameAZ')}</option>
              <option value="quantity-desc">{t('quantityHighLow')}</option>
              <option value="expiry-asc">{t('expiryDateSort')}</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
              >
                <X size={14} />
                {t('clearFilters')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/50 backdrop-blur-md rounded-[32px] border-4 border-dashed border-white/10">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-amber-500/20">
            <Package size={40} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{t('noItems')}</h3>
          <p className="text-zinc-400 mb-8 max-w-sm text-lg">{t('noItemsDescription')}</p>
          <Button onClick={handleAddClick} className="h-12 px-8 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 transition-all hover:-translate-y-1 shadow-xl shadow-white/5">
            {t('addFirstItem')}
          </Button>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/50 backdrop-blur-md rounded-[32px] border-2 border-dashed border-white/10">
          <Search size={40} className="text-zinc-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{t('noItemsFound')}</h3>
          <p className="text-zinc-400 mb-6">{t('adjustFilters')}</p>
          <Button onClick={clearFilters} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            {t('clearFilters')}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-400">
              {t('itemsOf', { filtered: filteredAndSortedItems.length, total: items.length })}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => (
              <PantryItem
                key={item.id}
                item={item}
                locale={locale}
                onEdit={() => handleEditClick(item)}
              />
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <PantryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        locale={locale}
        editItem={editItem}
      />
    </div>
  );
}
