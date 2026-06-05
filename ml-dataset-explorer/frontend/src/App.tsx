import React, { useState, useEffect, useCallback } from 'react';
import { Dataset } from './types';
import { getAllDatasets, createDataset, updateDataset, deleteDataset, getStats } from './api/datasets';
import { DatasetCard } from './components/DatasetCard';
import { DatasetModal } from './components/DatasetModal';
import { StatsBar } from './components/StatsBar';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; dataset: Dataset };

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState<import('./types').Stats | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAll = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const [ds, st] = await Promise.all([getAllDatasets(q), getStats()]);
      setDatasets(ds);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAll(search || undefined), 300);
    return () => clearTimeout(timer);
  }, [search, fetchAll]);

  const handleCreate = async (data: any) => {
    await createDataset(data);
    fetchAll(search || undefined);
  };

  const handleEdit = async (data: any) => {
    if (modal.open && modal.mode === 'edit') {
      await updateDataset(modal.dataset.id, data);
      fetchAll(search || undefined);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteId === id) {
      await deleteDataset(id);
      setDeleteId(null);
      fetchAll(search || undefined);
    } else {
      setDeleteId(id);
      setTimeout(() => setDeleteId(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Top bar */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm">ML</div>
            <div>
              <h1 className="font-display text-white text-lg leading-none">Dataset Explorer</h1>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Machine Learning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">⌕</span>
              <input
                type="text"
                placeholder="Search datasets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:border-indigo-500/50 transition-colors w-52 font-body"
              />
            </div>

            <button
              onClick={() => setModal({ open: true, mode: 'create' })}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-mono px-4 py-2 rounded-xl transition-colors"
            >
              <span>+</span> New Dataset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Delete confirm banner */}
        {deleteId !== null && (
          <div className="mb-6 bg-red-500/10 border border-red-500/25 rounded-xl px-5 py-3 flex items-center justify-between animate-slide-in">
            <span className="text-red-300 text-sm font-mono">Click Delete again to confirm removal of this dataset.</span>
            <button onClick={() => setDeleteId(null)} className="text-red-400/60 hover:text-red-300 text-sm font-mono">Dismiss</button>
          </div>
        )}

        {/* Dataset grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-2xl h-52 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl opacity-20">⬡</div>
            <p className="font-display text-white/30 text-xl">No datasets found</p>
            <p className="text-white/20 text-sm font-body">
              {search ? `No results for "${search}"` : 'Add your first dataset to get started'}
            </p>
            {!search && (
              <button
                onClick={() => setModal({ open: true, mode: 'create' })}
                className="mt-2 text-sm font-mono text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
              >
                + Add Dataset
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((ds, i) => (
              <div key={ds.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <DatasetCard
                  dataset={ds}
                  onEdit={d => setModal({ open: true, mode: 'edit', dataset: d })}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal.open && (
        <DatasetModal
          mode={modal.mode}
          dataset={modal.mode === 'edit' ? modal.dataset : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
        />
      )}
    </div>
  );
}

export default App;
