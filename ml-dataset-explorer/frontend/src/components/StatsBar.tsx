import React from 'react';
import { Stats } from '../types';

interface Props { stats: Stats | null; }

const icons: Record<string, string> = {
  total: '⬡',
  tabular: '⊞',
  image: '⊟',
  text: '≡',
  audio: '◎',
};

const labels: Record<string, string> = {
  total: 'Total',
  tabular: 'Tabular',
  image: 'Image',
  text: 'Text',
  audio: 'Audio',
};

const colors: Record<string, string> = {
  total: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300',
  tabular: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300',
  image: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-300',
  text: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300',
  audio: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300',
};

export const StatsBar: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  const entries = ['total', 'tabular', 'image', 'text', 'audio'];

  return (
    <div className="grid grid-cols-5 gap-3 mb-8 animate-fade-in">
      {entries.map(key => (
        <div
          key={key}
          className={`bg-gradient-to-br ${colors[key]} border rounded-xl p-4 flex flex-col items-center gap-1`}
        >
          <span className="text-2xl">{icons[key]}</span>
          <span className="text-2xl font-display font-bold text-white">
            {stats[key as keyof Stats]}
          </span>
          <span className="text-xs font-mono uppercase tracking-widest opacity-70">
            {labels[key]}
          </span>
        </div>
      ))}
    </div>
  );
};
