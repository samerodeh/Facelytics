import React, { useEffect, useState } from 'react';
import { embeddingAPI, ComparisonResponse, EmbeddingResponse, EmbeddingListResponse } from '../services/api';
import FileUpload from '../components/FileUpload';
import LoadingButton from '../components/LoadingButton';
import { AlertCircle, CheckCircle, Users, UserCheck, GitCompare, Trash2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'compare' | 'manage' | 'list'>('create');
  // List embeddings state
  const [embeddings, setEmbeddings] = useState<{ id: number; person_name: string }[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const loadEmbeddings = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res: EmbeddingListResponse = await embeddingAPI.listEmbeddings();
      if (res.success && res.embeddings) {
        setEmbeddings(res.embeddings);
      } else {
        setListError(res.error || 'Failed to load embeddings');
      }
    } catch (e: any) {
      setListError(e.response?.data?.detail || 'Failed to load embeddings');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      loadEmbeddings();
    }
  }, [activeTab]);
  
  // Create embedding states
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [personName, setPersonName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compare faces states
  const [compareFile1, setCompareFile1] = useState<File | null>(null);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<ComparisonResponse | null>(null);

  // Manage embeddings states
  const [deletePersonName, setDeletePersonName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateEmbedding = async () => {
    if (!createFile || !personName.trim()) {
      setCreateMessage({ type: 'error', text: 'Please select a file and enter a person name.' });
      return;
    }

    setCreateLoading(true);
    setCreateMessage(null);

    try {
      const response: EmbeddingResponse = await embeddingAPI.createEmbedding(createFile, personName.trim());
      if (response.success) {
        setCreateMessage({ type: 'success', text: response.message });
        setPersonName('');
        setCreateFile(null);
      } else {
        setCreateMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setCreateMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create embedding.' });
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
      const response: ComparisonResponse = await embeddingAPI.compareFaces(compareFile1, compareFile2);
      setCompareResult(response);
    } catch (error: any) {
      setCompareResult({ 
        match: false, 
        message: error.response?.data?.detail || 'Failed to compare faces.' 
      });
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDeleteEmbedding = async () => {
    if (!deletePersonName.trim()) {
      setDeleteMessage({ type: 'error', text: 'Please enter a person name to delete.' });
      return;
    }

    setDeleteLoading(true);
    setDeleteMessage(null);

    try {
      const response: EmbeddingResponse = await embeddingAPI.deleteEmbedding(deletePersonName.trim());
      if (response.success) {
        setDeleteMessage({ type: 'success', text: response.message });
        setDeletePersonName('');
      } else {
        setDeleteMessage({ type: 'error', text: response.message || response.error || 'Failed to delete embedding.' });
      }
    } catch (error: any) {
      setDeleteMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to delete embedding.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Embedding', icon: Users },
    { id: 'compare', label: 'Compare Faces', icon: GitCompare },
    { id: 'manage', label: 'Manage Embeddings', icon: UserCheck },
    { id: 'list', label: 'Embeddings', icon: Users },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Create Embedding Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Face Embedding</h2>
                <p className="text-gray-600">Upload an image to create a face embedding for a person.</p>
              </div>

              {createMessage && (
                <div className={`p-4 rounded-lg flex items-start space-x-2 ${
                  createMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {createMessage.type === 'success' ? (
                    <CheckCircle size={20} className="text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-500 mt-0.5" />
                  )}
                  <span className={`text-sm ${
                    createMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {createMessage.text}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person Name
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <FileUpload onFileSelect={setCreateFile} />
              </div>

              <LoadingButton
                onClick={handleCreateEmbedding}
                isLoading={createLoading}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                Create Embedding
              </LoadingButton>
            </div>
          )}

          {/* List Embeddings Tab */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Embeddings</h2>
                  <p className="text-gray-600">All saved person names in the database.</p>
                </div>
                <button
                  onClick={loadEmbeddings}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Refresh
                </button>
              </div>

              {listError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {listError}
                </div>
              )}

              {listLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : embeddings.length === 0 ? (
                <div className="text-gray-500">No embeddings found.</div>
              ) : (
                <ul className="divide-y divide-gray-200 bg-white rounded-lg border">
                  {embeddings.map((e) => (
                    <li key={e.id} className="px-4 py-3 flex items-center justify-between">
                      <span className="text-gray-800">{e.person_name}</span>
                      <span className="text-xs text-gray-400">ID: {e.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Compare Faces Tab */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare Faces</h2>
                <p className="text-gray-600">Upload two images to compare if they contain the same person.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Image
                  </label>
                  <FileUpload onFileSelect={setCompareFile1} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second Image
                  </label>
                  <FileUpload onFileSelect={setCompareFile2} />
                </div>
              </div>

              <LoadingButton
                onClick={handleCompareFaces}
                isLoading={compareLoading}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                Compare Faces
              </LoadingButton>

              {compareResult && (
                <div className={`p-6 rounded-lg border-2 ${
                  compareResult.match 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {compareResult.match ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <AlertCircle size={24} className="text-red-500" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${
                        compareResult.match ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {compareResult.match ? 'Match Found!' : 'No Match'}
                      </h3>
                      {compareResult.similarity !== undefined && (
                        <p className={`text-sm ${
                          compareResult.match ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Similarity: {(compareResult.similarity * 100).toFixed(1)}%
                        </p>
                      )}
                      {compareResult.message && (
                        <p className={`text-sm ${
                          compareResult.match ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {compareResult.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manage Embeddings Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Embeddings</h2>
                <p className="text-gray-600">Delete existing face embeddings from the database.</p>
              </div>

              {deleteMessage && (
                <div className={`p-4 rounded-lg flex items-start space-x-2 ${
                  deleteMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {deleteMessage.type === 'success' ? (
                    <CheckCircle size={20} className="text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-500 mt-0.5" />
                  )}
                  <span className={`text-sm ${
                    deleteMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {deleteMessage.text}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person Name to Delete
                </label>
                <input
                  type="text"
                  value={deletePersonName}
                  onChange={(e) => setDeletePersonName(e.target.value)}
                  placeholder="Enter person's name to delete their embedding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <LoadingButton
                onClick={handleDeleteEmbedding}
                isLoading={deleteLoading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 size={20} />
                Delete Embedding
              </LoadingButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
