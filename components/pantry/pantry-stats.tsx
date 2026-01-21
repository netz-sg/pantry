'use client';

import { useMemo } from 'react';
import { Package, AlertTriangle, AlertCircle, MapPin } from 'lucide-react';
import { PANTRY_LOCATIONS } from '@/lib/constants';

interface PantryStatsProps {
  items: {
    id: string;
    quantity: number;
    location: string | null;
    expiryDate: string | null;
    lowStockThreshold: number | null;
  }[];
  locale: string;
}

export default function PantryStats({ items, locale }: PantryStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalItems = items.length;

    const expiringCount = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate > now && expiryDate <= sevenDaysFromNow;
    }).length;

    const expiredCount = items.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < now;
    }).length;

    const lowStockCount = items.filter(item =>
      item.lowStockThreshold !== null && item.quantity <= item.lowStockThreshold
    ).length;

    const locationBreakdown = PANTRY_LOCATIONS.map(loc => ({
      ...loc,
      count: items.filter(item => item.location === loc.value).length,
    })).filter(loc => loc.count > 0);

    return {
      totalItems,
      expiringCount,
      expiredCount,
      lowStockCount,
      locationBreakdown,
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Items */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gesamt</p>
        </div>
        <p className="text-4xl font-black text-white">{stats.totalItems}</p>
        <p className="text-xs text-zinc-400 mt-1">Artikel im Vorrat</p>
      </div>

      {/* Expiring Soon */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/30 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-orange-400" />
          </div>
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Bald Abgelaufen</p>
        </div>
        <p className="text-4xl font-black text-orange-400">{stats.expiringCount}</p>
        <p className="text-xs text-zinc-400 mt-1">In den nächsten 7 Tagen</p>
      </div>

      {/* Expired */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-xl p-6 hover:border-red-500/30 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Abgelaufen</p>
        </div>
        <p className="text-4xl font-black text-red-400">{stats.expiredCount}</p>
        <p className="text-xs text-zinc-400 mt-1">Entfernen empfohlen</p>
      </div>

      {/* Low Stock */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/30 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <AlertCircle size={20} className="text-yellow-400" />
          </div>
          <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Niedriger Bestand</p>
        </div>
        <p className="text-4xl font-black text-yellow-400">{stats.lowStockCount}</p>
        <p className="text-xs text-zinc-400 mt-1">Nachfüllen empfohlen</p>
      </div>

      {/* Location Breakdown - spans 2 or 4 columns */}
      {stats.locationBreakdown.length > 0 && (
        <div className="col-span-2 md:col-span-4 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MapPin size={20} className="text-blue-400" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-widest">Verteilung nach Lagerort</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.locationBreakdown.map(loc => (
              <div key={loc.value} className="flex items-center gap-3">
                <span className="text-2xl">{loc.icon}</span>
                <div>
                  <p className="text-lg font-bold text-white">{loc.count}</p>
                  <p className="text-xs text-zinc-400">{locale === 'de' ? loc.labelDe : loc.labelEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
