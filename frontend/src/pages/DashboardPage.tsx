import React, { useEffect, useState } from 'react';
import { embeddingAPI, ComparisonResponse, EmbeddingResponse, EmbeddingListResponse } from '../services/api';
import FileUpload from '../components/FileUpload';
import LoadingButton from '../components/LoadingButton';
import { getErrorMessage } from '../utils/http';
import {
  AlertCircle,
  CheckCircle,
  UserPlus,
  GitCompare,
  Settings2,
  Database,
  RefreshCw,
  Trash2,
  Pencil,
  ScanFace,
  Gauge,
} from 'lucide-react';

type TabId = 'create' | 'compare' | 'manage' | 'list';
type FeedbackMsg = { type: 'success' | 'error'; text: string } | null;

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'create', label: 'Enroll Face', icon: UserPlus },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'manage', label: 'Manage', icon: Settings2 },
  { id: 'list', label: 'Registry', icon: Database },
];

const Feedback: React.FC<{ feedback: FeedbackMsg }> = ({ feedback }) => {
  if (!feedback) return null;
  const ok = feedback.type === 'success';
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border p-4 ${
        ok ? 'border-accent/30 bg-accent-glow' : 'border-danger/30 bg-danger-bg'
      }`}
    >
      {ok ? (
        <CheckCircle size={18} className="mt-0.5 shrink-0 text-accent" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
      )}
      <span className={`text-sm ${ok ? 'text-accent-soft' : 'text-danger-soft'}`}>{feedback.text}</span>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('create');

  // Registry
  const [embeddings, setEmbeddings] = useState<{ id: number; person_name: string }[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const loadEmbeddings = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res: EmbeddingListResponse = await embeddingAPI.listEmbeddings();
      if (res.success && res.embeddings) setEmbeddings(res.embeddings);
      else setListError(res.error || 'Failed to load embeddings');
    } catch (e) {
      setListError(getErrorMessage(e, 'Failed to load embeddings'));
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadEmbeddings();
  }, []);

  // Create
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [personName, setPersonName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<FeedbackMsg>(null);

  // Compare
  const [compareFile1, setCompareFile1] = useState<File | null>(null);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<ComparisonResponse | null>(null);

  // Manage
  const [deletePersonName, setDeletePersonName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [manageMessage, setManageMessage] = useState<FeedbackMsg>(null);

  const handleCreateEmbedding = async () => {
    if (!createFile || !personName.trim()) {
      setCreateMessage({ type: 'error', text: 'Please select an image and enter a person name.' });
      return;
    }
    setCreateLoading(true);
    setCreateMessage(null);
    try {
      const res: EmbeddingResponse = await embeddingAPI.createEmbedding(createFile, personName.trim());
      if (res.success) {
        setCreateMessage({ type: 'success', text: res.message });
        setPersonName('');
        setCreateFile(null);
        loadEmbeddings();
      } else {
        setCreateMessage({ type: 'error', text: res.message });
      }
    } catch (error) {
      setCreateMessage({ type: 'error', text: getErrorMessage(error, 'Failed to create embedding.') });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCompareFaces = async () => {
    if (!compareFile1 || !compareFile2) {
      setCompareResult({ match: false, message: 'Please select both images to compare.' });
      return;
    }
    setCompareLoading(true);
    setCompareResult(null);
    try {
      const res: ComparisonResponse = await embeddingAPI.compareFaces(compareFile1, compareFile2);
      setCompareResult(res);
    } catch (error) {
      setCompareResult({ match: false, message: getErrorMessage(error, 'Failed to compare faces.') });
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDeleteEmbedding = async () => {
    if (!deletePersonName.trim()) {
      setManageMessage({ type: 'error', text: 'Enter a person name to delete.' });
      return;
    }
    setDeleteLoading(true);
    setManageMessage(null);
    try {
      const res: EmbeddingResponse = await embeddingAPI.deleteEmbedding(deletePersonName.trim());
      setManageMessage({
        type: res.success ? 'success' : 'error',
        text: res.message || res.error || 'Failed to delete embedding.',
      });
      if (res.success) {
        setDeletePersonName('');
        loadEmbeddings();
      }
    } catch (error) {
      setManageMessage({ type: 'error', text: getErrorMessage(error, 'Failed to delete embedding.') });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRenameEmbedding = async () => {
    if (!renameFrom.trim() || !renameTo.trim()) {
      setManageMessage({ type: 'error', text: 'Enter both the current and the new name.' });
      return;
    }
    setRenameLoading(true);
    setManageMessage(null);
    try {
      const res: EmbeddingResponse = await embeddingAPI.updateEmbedding(renameFrom.trim(), renameTo.trim());
      setManageMessage({
        type: res.success ? 'success' : 'error',
        text: res.message || res.error || 'Failed to rename embedding.',
      });
      if (res.success) {
        setRenameFrom('');
        setRenameTo('');
        loadEmbeddings();
      }
    } catch (error) {
      setManageMessage({ type: 'error', text: getErrorMessage(error, 'Failed to rename embedding.') });
    } finally {
      setRenameLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      {/* Overview band */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Console</p>
          <h1 className="mt-2 font-display text-3xl font-700 text-content sm:text-4xl">Recognition Dashboard</h1>
          <p className="mt-2 max-w-lg text-sm text-content-muted">
            Enroll faces, compare two images, and manage your biometric registry — all backed by InsightFace embeddings.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="panel flex items-center gap-3 px-4 py-3">
            <ScanFace size={20} className="text-accent" />
            <div>
              <p className="font-mono text-lg font-600 leading-none text-content">{embeddings.length}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-content-faint">Enrolled</p>
            </div>
          </div>
          <div className="panel flex items-center gap-3 px-4 py-3">
            <Gauge size={20} className="text-accent" />
            <div>
              <p className="font-mono text-lg font-600 leading-none text-content">0.60</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-content-faint">Threshold</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Tab rail */}
        <nav className="panel h-max p-2">
          <ul className="flex gap-2 lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <li key={tab.id} className="flex-1">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-accent-glow text-accent'
                        : 'text-content-muted hover:bg-surface-hover hover:text-content'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-accent' : ''} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <section className="panel p-6 sm:p-8">
          {activeTab === 'create' && (
            <div className="space-y-6">
              <header>
                <h2 className="font-display text-2xl font-700 text-content">Enroll a Face</h2>
                <p className="mt-1 text-sm text-content-muted">Upload an image to store a face embedding under a name.</p>
              </header>
              <Feedback feedback={createMessage} />
              <div>
                <label className="field-label">Person Name</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Face Image</label>
                <FileUpload onFileSelect={setCreateFile} />
              </div>
              <LoadingButton onClick={handleCreateEmbedding} isLoading={createLoading}>
                <UserPlus size={18} />
                Enroll Face
              </LoadingButton>
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="space-y-6">
              <header>
                <h2 className="font-display text-2xl font-700 text-content">Compare Faces</h2>
                <p className="mt-1 text-sm text-content-muted">Upload two images to check whether they show the same person.</p>
              </header>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="field-label">First Image</label>
                  <FileUpload onFileSelect={setCompareFile1} />
                </div>
                <div>
                  <label className="field-label">Second Image</label>
                  <FileUpload onFileSelect={setCompareFile2} />
                </div>
              </div>
              <LoadingButton onClick={handleCompareFaces} isLoading={compareLoading}>
                <GitCompare size={18} />
                Compare Faces
              </LoadingButton>

              {compareResult && (
                <div
                  className={`rounded-2xl border p-6 ${
                    compareResult.match ? 'border-accent/40 bg-accent-glow' : 'border-danger/30 bg-danger-bg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                        compareResult.match ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {compareResult.match ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-display text-lg font-700 ${compareResult.match ? 'text-accent' : 'text-danger-soft'}`}>
                        {compareResult.match ? 'Match Found' : 'No Match'}
                      </h3>
                      {compareResult.message && (
                        <p className="text-sm text-content-muted">{compareResult.message}</p>
                      )}
                      {compareResult.similarity !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between font-mono text-xs text-content-muted">
                            <span>Similarity</span>
                            <span className={compareResult.match ? 'text-accent' : 'text-danger-soft'}>
                              {(compareResult.similarity * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink">
                            <div
                              className={`h-full rounded-full ${compareResult.match ? 'bg-accent' : 'bg-danger'}`}
                              style={{ width: `${Math.max(0, Math.min(100, compareResult.similarity * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-8">
              <header>
                <h2 className="font-display text-2xl font-700 text-content">Manage Registry</h2>
                <p className="mt-1 text-sm text-content-muted">Rename or delete stored face embeddings.</p>
              </header>
              <Feedback feedback={manageMessage} />

              <div className="rounded-2xl border border-line bg-ink/40 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-content-muted">
                  <Pencil size={14} /> Rename
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={renameFrom}
                    onChange={(e) => setRenameFrom(e.target.value)}
                    placeholder="Current name"
                    className="field-input"
                  />
                  <input
                    type="text"
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    placeholder="New name"
                    className="field-input"
                  />
                </div>
                <LoadingButton onClick={handleRenameEmbedding} isLoading={renameLoading} variant="ghost" className="mt-4">
                  <Pencil size={16} />
                  Rename Embedding
                </LoadingButton>
              </div>

              <div className="rounded-2xl border border-danger/20 bg-danger-bg/40 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-danger-soft">
                  <Trash2 size={14} /> Delete
                </h3>
                <input
                  type="text"
                  value={deletePersonName}
                  onChange={(e) => setDeletePersonName(e.target.value)}
                  placeholder="Name to delete"
                  className="field-input focus:border-danger/60 focus:ring-danger/25"
                />
                <LoadingButton onClick={handleDeleteEmbedding} isLoading={deleteLoading} variant="danger" className="mt-4">
                  <Trash2 size={16} />
                  Delete Embedding
                </LoadingButton>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-6">
              <header className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-700 text-content">Registry</h2>
                  <p className="mt-1 text-sm text-content-muted">All enrolled identities in the database.</p>
                </div>
                <button onClick={loadEmbeddings} className="btn btn-ghost px-4 py-2 text-sm">
                  <RefreshCw size={16} className={listLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </header>

              {listError && (
                <div className="rounded-xl border border-danger/30 bg-danger-bg p-4 text-sm text-danger-soft">{listError}</div>
              )}

              {listLoading ? (
                <div className="py-12 text-center font-mono text-sm text-content-faint">Loading registry…</div>
              ) : embeddings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line py-12 text-center">
                  <Database size={28} className="mx-auto mb-3 text-content-faint" />
                  <p className="text-sm text-content-muted">No faces enrolled yet.</p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {embeddings.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 px-4 py-3 transition-colors hover:border-line-strong"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-glow font-display text-sm font-700 text-accent">
                        {e.person_name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-content">{e.person_name}</span>
                      <span className="font-mono text-xs text-content-faint">#{e.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
