import React, { useState, useEffect } from 'react';
import { Dataset, DatasetCreate, DatasetUpdate } from '../types';

interface Props {
  mode: 'create' | 'edit';
  dataset?: Dataset;
  onClose: () => void;
  onSubmit: (data: DatasetCreate | DatasetUpdate) => Promise<void>;
}

const TYPES = ['Tabular', 'Image', 'Text', 'Audio'];
const STATUSES = ['Not Explored', 'Exploring', 'Ready for Training', 'Trained'];

export const DatasetModal: React.FC<Props> = ({ mode, dataset, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Tabular',
    rows: '',
    features: '',
    status: 'Not Explored',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && dataset) {
      setForm({
        name: dataset.name,
        description: dataset.description || '',
        type: dataset.type,
        rows: String(dataset.rows),
        features: String(dataset.features),
        status: dataset.status,
      });
    }
  }, [mode, dataset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.rows || !form.features) { setError('Rows and features are required.'); return; }
    setLoading(true);
    try {
      if (mode === 'create') {
        await onSubmit({
          name: form.name,
          description: form.description,
          type: form.type,
          rows: Number(form.rows),
          features: Number(form.features),
          status: form.status,
        } as DatasetCreate);
      } else {
        await onSubmit({
          description: form.description,
          type: form.type,
          rows: Number(form.rows),
          features: Number(form.features),
          status: form.status,
        } as DatasetUpdate);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/25 focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-colors";
  const labelClass = "block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="font-display text-xl text-white">
            {mode === 'create' ? 'Add New Dataset' : 'Edit Dataset'}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name (create only) */}
          {mode === 'create' && (
            <div>
              <label className={labelClass}>Dataset Name</label>
              <input
                required
                className={inputClass}
                placeholder="e.g. Iris Dataset"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <label className={labelClass}>Dataset Name</label>
              <div className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/40 text-sm font-mono">
                {form.name}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="Brief description of the dataset..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Rows + Features */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Number of Rows</label>
              <input
                type="number"
                min="1"
                required
                className={inputClass}
                placeholder="e.g. 150"
                value={form.rows}
                onChange={e => setForm(f => ({ ...f, rows: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Number of Features</label>
              <input
                type="number"
                min="1"
                required
                className={inputClass}
                placeholder="e.g. 4"
                value={form.features}
                onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-mono transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Dataset' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
