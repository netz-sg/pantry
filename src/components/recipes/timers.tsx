'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { BellRing, Pause, Play, Timer as TimerIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { timerMinutes } from './types';

/*
  Timer leben in einem Speicher auf Modulebene. So laufen sie weiter,
  wenn man zwischen Rezept und Kochmodus wechselt. Mehrere gleichzeitig sind möglich.
*/

export interface KitchenTimer {
  key: string;
  label: string;
  doneText: string;
  total: number;
  /** Zeitpunkt in ms, an dem der Timer abläuft. null, wenn angehalten. */
  endsAt: number | null;
  /** Restzeit in ms, solange angehalten */
  pausedLeft: number;
  done: boolean;
}

interface Snapshot {
  timers: KitchenTimer[];
  now: number;
}

const EMPTY: Snapshot = { timers: [], now: 0 };
let snap: Snapshot = EMPTY;
const listeners = new Set<() => void>();
let tick: ReturnType<typeof setInterval> | null = null;
let audio: AudioContext | null = null;

function emit(next: Snapshot) {
  snap = next;
  for (const l of listeners) l();
  const running = next.timers.some((t) => t.endsAt != null && !t.done);
  if (running && !tick) tick = setInterval(onTick, 250);
  if (!running && tick) {
    clearInterval(tick);
    tick = null;
  }
}

function onTick() {
  const now = Date.now();
  let changed = false;
  const timers = snap.timers.map((t) => {
    if (!t.done && t.endsAt != null && t.endsAt <= now) {
      changed = true;
      ring(t);
      return { ...t, done: true, endsAt: now, pausedLeft: 0 };
    }
    return t;
  });
  emit({ timers: changed ? timers : snap.timers, now });
}

function ensureAudio() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio ??= new Ctx();
    if (audio.state === 'suspended') void audio.resume();
  } catch {
    audio = null;
  }
}

/** Drei kurze Töne und Vibration, wenn das Gerät es kann. */
function ring(t: KitchenTimer) {
  try {
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  } catch {
    /* ohne Vibration */
  }
  if (audio) {
    try {
      const start = audio.currentTime + 0.05;
      for (let i = 0; i < 3; i++) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        const s = start + i * 0.45;
        gain.gain.setValueAtTime(0.0001, s);
        gain.gain.exponentialRampToValueAtTime(0.4, s + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, s + 0.3);
        osc.connect(gain).connect(audio.destination);
        osc.start(s);
        osc.stop(s + 0.32);
      }
    } catch {
      /* ohne Ton */
    }
  }
  toast(t.doneText, { id: `timer-${t.key}`, duration: 15000 });
}

export const timerStore = {
  start(key: string, seconds: number, label: string, doneText: string) {
    ensureAudio();
    const now = Date.now();
    const rest = snap.timers.filter((t) => t.key !== key);
    emit({
      timers: [
        ...rest,
        {
          key,
          label,
          doneText,
          total: seconds * 1000,
          endsAt: now + seconds * 1000,
          pausedLeft: 0,
          done: false,
        },
      ],
      now,
    });
  },
  pause(key: string) {
    const now = Date.now();
    emit({
      now,
      timers: snap.timers.map((t) =>
        t.key === key && t.endsAt != null && !t.done
          ? { ...t, pausedLeft: Math.max(0, t.endsAt - now), endsAt: null }
          : t,
      ),
    });
  },
  resume(key: string) {
    ensureAudio();
    const now = Date.now();
    emit({
      now,
      timers: snap.timers.map((t) =>
        t.key === key && t.endsAt == null && !t.done ? { ...t, endsAt: now + t.pausedLeft } : t,
      ),
    });
  },
  cancel(key: string) {
    emit({ now: Date.now(), timers: snap.timers.filter((t) => t.key !== key) });
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTimers() {
  return useSyncExternalStore(
    subscribe,
    () => snap,
    () => EMPTY,
  );
}

export function leftMs(t: KitchenTimer, now: number) {
  if (t.done) return 0;
  return t.endsAt == null ? t.pausedLeft : Math.max(0, t.endsAt - now);
}

export function formatClock(ms: number) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Timer-Knopf an einem Schritt. Startet, zeigt den Countdown und lässt sich anhalten oder beenden. */
export function TimerButton({
  timerKey,
  seconds,
  label,
  size = 'md',
}: {
  timerKey: string;
  seconds: number;
  label: string;
  size?: 'md' | 'lg';
}) {
  const t = useTranslations('recipes.timer');
  const tc = useTranslations('common');
  const { timers, now } = useTimers();
  const timer = timers.find((x) => x.key === timerKey);
  const time = tc('minutes', { count: timerMinutes(seconds) });
  const big = size === 'lg';
  const pill = cn(
    'inline-flex items-center gap-1.5 rounded-full font-semibold tabular transition-colors',
    big ? 'h-12 px-5 text-body' : 'h-9 px-3.5 text-subhead',
  );

  if (!timer) {
    return (
      <button
        type="button"
        onClick={() => timerStore.start(timerKey, seconds, label, t('finishedToast', { label }))}
        aria-label={t('start', { time })}
        className={cn(pill, 'no-print bg-tint-soft text-tint hover:bg-tint-soft/80')}
      >
        <TimerIcon className={big ? 'size-5' : 'size-4'} aria-hidden />
        {t('short', { time })}
      </button>
    );
  }

  const ms = leftMs(timer, now);
  return (
    <span className="no-print inline-flex items-center gap-1.5">
      <span
        role="timer"
        aria-live={timer.done ? 'assertive' : 'off'}
        className={cn(pill, timer.done ? 'animate-pulse bg-orange text-white' : 'bg-tint text-on-tint')}
      >
        {timer.done ? (
          <BellRing className={big ? 'size-5' : 'size-4'} aria-hidden />
        ) : (
          <TimerIcon className={big ? 'size-5' : 'size-4'} aria-hidden />
        )}
        {timer.done ? t('finished') : formatClock(ms)}
      </span>
      {!timer.done ? (
        <button
          type="button"
          onClick={() => (timer.endsAt == null ? timerStore.resume(timerKey) : timerStore.pause(timerKey))}
          aria-label={timer.endsAt == null ? t('resume') : t('pause')}
          className={cn(
            'grid place-items-center rounded-full bg-fill text-label hover:bg-fill-strong',
            big ? 'size-12' : 'size-11',
          )}
        >
          {timer.endsAt == null ? (
            <Play className="size-4 fill-current" />
          ) : (
            <Pause className="size-4 fill-current" />
          )}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => timerStore.cancel(timerKey)}
        aria-label={t('cancel')}
        className={cn(
          'grid place-items-center rounded-full bg-fill text-label hover:bg-fill-strong',
          big ? 'size-12' : 'size-11',
        )}
      >
        <X className="size-4" />
      </button>
    </span>
  );
}

/** Leiste mit allen laufenden Timern, z. B. oben im Kochmodus. */
export function TimerTray({ className }: { className?: string }) {
  const t = useTranslations('recipes.timer');
  const { timers, now } = useTimers();
  if (!timers.length) return null;
  return (
    <section aria-label={t('running')} className={cn('no-scrollbar flex gap-2 overflow-x-auto', className)}>
      {timers.map((x) => (
        <div
          key={x.key}
          className={cn(
            'tabular flex h-11 shrink-0 items-center gap-1 rounded-full pr-1 pl-3.5 text-subhead font-semibold',
            x.done ? 'animate-pulse bg-orange text-white' : 'bg-surface text-label shadow-elevated',
          )}
        >
          {x.done ? (
            <BellRing className="size-4" aria-hidden />
          ) : (
            <TimerIcon className="size-4 text-tint" aria-hidden />
          )}
          <span className="ml-1">{x.label}</span>
          <span role="timer" className={cn('ml-1.5', !x.done && 'text-tint')}>
            {x.done ? t('finished') : formatClock(leftMs(x, now))}
          </span>
          {!x.done ? (
            <button
              type="button"
              onClick={() => (x.endsAt == null ? timerStore.resume(x.key) : timerStore.pause(x.key))}
              aria-label={`${x.endsAt == null ? t('resume') : t('pause')}, ${x.label}`}
              className="ml-1 grid size-9 place-items-center rounded-full hover:bg-fill"
            >
              {x.endsAt == null ? (
                <Play className="size-3.5 fill-current" />
              ) : (
                <Pause className="size-3.5 fill-current" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => timerStore.cancel(x.key)}
            aria-label={`${t('cancel')}, ${x.label}`}
            className={cn(
              'grid size-9 place-items-center rounded-full',
              x.done ? 'hover:bg-white/20' : 'hover:bg-fill',
            )}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
