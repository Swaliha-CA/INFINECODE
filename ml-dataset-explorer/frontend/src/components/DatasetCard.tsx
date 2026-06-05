import React from 'react';
import { Dataset } from '../types';

interface Props {
  dataset: Dataset;
  onEdit: (d: Dataset) => void;
  onDelete: (id: number) => void;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  Tabular: { icon: '⊞', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  Image:   { icon: '⊟', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  Text:    { icon: '≡', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  Audio:   { icon: '◎', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

const statusConfig: Record<string, string> = {
  'Not Explored':      'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  'Exploring':         'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Ready for Training':'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Trained':           'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const statusDot: Record<string, string> = {
  'Not Explored':      'bg-zinc-400',
  'Exploring':         'bg-blue-400 animate-pulse',
  'Ready for Training':'bg-amber-400',
  'Trained':           'bg-emerald-400',
};

export const DatasetCard: React.FC<Props> = ({ dataset, onEdit, onDelete }) => {
  const type = typeConfig[dataset.type] || typeConfig['Tabular'];
  const statusCls = statusConfig[dataset.status] || statusConfig['Not Explored'];
  const dotCls = statusDot[dataset.status] || statusDot['Not Explored'];

  return (
    <div className="card-hover bg-[#111118] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-white leading-snug truncate">{dataset.name}</h3>
          <p className="text-sm text-white/40 mt-1 line-clamp-2 font-body leading-relaxed">
            {dataset.description || 'No description provided.'}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-mono px-2.5 py-1 rounded-lg border ${type.color}`}>
          {type.icon} {dataset.type}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/4 rounded-xl p-3 text-center">
          <div className="text-xl font-display font-bold text-white">{dataset.rows.toLocaleString()}</div>
          <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mt-0.5">Rows</div>
        </div>
        <div className="bg-white/4 rounded-xl p-3 text-center">
          <div className="text-xl font-display font-bold text-white">{dataset.features}</div>
          <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mt-0.5">Features</div>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 self-start px-3 py-1.5 rounded-full border text-xs font-mono ${statusCls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
        {dataset.status}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-white/5">
        <button
          onClick={() => onEdit(dataset)}
          className="flex-1 text-sm font-mono py-2 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(dataset.id)}
          className="flex-1 text-sm font-mono py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
