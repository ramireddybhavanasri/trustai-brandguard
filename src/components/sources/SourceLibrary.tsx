import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { BrandSource, SourceCategory, SourceStatus, Priority } from '../../types/brandguard';
import { StatusBadge } from '../common/StatusBadge';
import { SourceModal } from './SourceModal';

interface SourceLibraryProps {
  sources: BrandSource[];
  onSaveSource: (source: BrandSource) => void;
  onDeleteSource: (sourceId: string) => void;
  onDuplicateSource: (source: BrandSource) => void;
}

export const SourceLibrary: React.FC<SourceLibraryProps> = ({
  sources,
  onSaveSource,
  onDeleteSource,
  onDuplicateSource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<BrandSource | null>(null);
  const [viewingEvidenceSource, setViewingEvidenceSource] = useState<BrandSource | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<BrandSource | null>(null);

  // Filtered & Sorted sources
  const filteredSources = useMemo(() => {
    return sources
      .filter((s) => {
        if (selectedCategory !== 'all' && s.type !== selectedCategory) return false;
        if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
        if (selectedPriority !== 'all' && s.priority !== selectedPriority) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchContent = s.content.toLowerCase().includes(q);
          const matchTag = s.tags.some((t) => t.toLowerCase().includes(q));
          const matchProduct = s.productTarget?.toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchTag && !matchProduct) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [sources, selectedCategory, selectedStatus, selectedPriority, searchQuery, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sources.length };
    sources.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return counts;
  }, [sources]);

  const handleEdit = (source: BrandSource) => {
    setEditingSource(source);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSource(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (source: BrandSource) => {
    const duplicated: BrandSource = {
      ...source,
      id: `src-${Date.now()}`,
      title: `${source.title} (Copy)`,
      status: 'draft', // duplicated sources start as draft safely
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onDuplicateSource(duplicated);
  };

  const handleToggleArchive = (source: BrandSource) => {
    const updated: BrandSource = {
      ...source,
      status: source.status === 'archived' ? 'approved' : 'archived',
      updatedAt: new Date().toISOString(),
    };
    onSaveSource(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Explanation of Authoritative Governance */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Authoritative Brand Knowledge Base</h2>
            <p className="text-xs text-neutral-500">
              Only sources with <span className="font-semibold text-emerald-700">Approved</span> status are used
              by the brand checking engine. Draft or pending sources do not influence review results.
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Source Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, content, or tags..."
              className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-md text-xs bg-white text-neutral-700 font-medium"
            >
              <option value="all">All Categories ({sources.length})</option>
              <option value="brand_fact">Brand Facts ({categoryCounts['brand_fact'] || 0})</option>
              <option value="guideline">Guidelines ({categoryCounts['guideline'] || 0})</option>
              <option value="claim">Claims & Evidence ({categoryCounts['claim'] || 0})</option>
              <option value="preferred_term">Preferred Terms ({categoryCounts['preferred_term'] || 0})</option>
              <option value="restricted_term">Restricted Terms ({categoryCounts['restricted_term'] || 0})</option>
              <option value="accessibility">Accessibility Rules ({categoryCounts['accessibility'] || 0})</option>
              <option value="custom_rule">Custom Rules ({categoryCounts['custom_rule'] || 0})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-md text-xs bg-white text-neutral-700"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved (Authoritative)</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-md text-xs bg-white text-neutral-700"
            >
              <option value="newest">Sort: Newest Updated</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="alphabetical">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sources Grid / List */}
      {filteredSources.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center shadow-2xs">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">No matching brand sources found</h3>
          <p className="text-xs text-neutral-500 mt-1 mb-4">
            Try adjusting your search criteria or create a new source for your brand guidelines.
          </p>
          <button
            onClick={handleAdd}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md"
          >
            Add New Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            const isApproved = source.status === 'approved';
            return (
              <div
                key={source.id}
                className={`bg-white rounded-lg border transition-all shadow-2xs flex flex-col justify-between ${
                  isApproved
                    ? 'border-neutral-200 hover:border-neutral-300'
                    : 'border-dashed border-neutral-300 bg-neutral-50/60'
                }`}
              >
                {/* Card Top */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                      {source.type.replace('_', ' ')}
                    </span>
                    <StatusBadge status={source.status} type="source" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                      {source.title}
                    </h3>
                    {source.productTarget && (
                      <span className="text-[11px] text-teal-700 font-medium">
                        Target: {source.productTarget}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {source.content}
                  </p>

                  {/* Highlights / specifics */}
                  {source.approvedWording && (
                    <div className="p-2 rounded bg-neutral-50 border border-neutral-200 text-xs">
                      <span className="text-[10px] uppercase font-semibold text-neutral-500 block">
                        Approved Standard:
                      </span>
                      <span className="font-mono text-neutral-800 font-medium text-xs">
                        {source.approvedWording}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {source.tags && source.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-neutral-500">
                      {source.tags.map((t, idx) => (
                        <span key={idx}>
                          #{t}
                          {idx < source.tags.length - 1 ? ' ·' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-neutral-600 font-mono">
                    Priority: <span className="capitalize font-semibold text-neutral-700">{source.priority}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {source.supportingEvidence && (
                      <button
                        onClick={() => setViewingEvidenceSource(source)}
                        title="View supporting evidence"
                        className="p-1.5 text-neutral-500 hover:text-teal-700 hover:bg-neutral-200/60 rounded"
                        aria-label="View evidence"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(source)}
                      title="Duplicate source"
                      className="p-1.5 text-neutral-500 hover:text-teal-700 hover:bg-neutral-200/60 rounded"
                      aria-label="Duplicate source"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(source)}
                      title="Edit source"
                      className="p-1.5 text-neutral-500 hover:text-teal-700 hover:bg-neutral-200/60 rounded"
                      aria-label="Edit source"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(source)}
                      title={source.status === 'archived' ? 'Restore source' : 'Archive source'}
                      className="p-1.5 text-neutral-500 hover:text-amber-700 hover:bg-neutral-200/60 rounded"
                      aria-label="Archive or restore"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSourceToDelete(source)}
                      title="Delete source"
                      className="p-1.5 text-neutral-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                      aria-label="Delete source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Source Modal */}
      <SourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveSource}
        editingSource={editingSource}
      />

      {/* Evidence Viewer Modal */}
      {viewingEvidenceSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Supporting Evidence & References
                </h3>
                <p className="text-xs text-neutral-500">{viewingEvidenceSource.title}</p>
              </div>
              <button
                onClick={() => setViewingEvidenceSource(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs space-y-2">
              <span className="font-semibold text-neutral-700 block">Documented Reference:</span>
              <p className="font-mono text-neutral-800 break-all text-[11px]">
                {viewingEvidenceSource.supportingEvidence || 'No supporting URL provided.'}
              </p>
            </div>
            <p className="text-xs text-neutral-500">
              When content checks evaluate claims, this citation provides the audit basis for approving or
              substantiating promotional statements.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingEvidenceSource(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-neutral-900">Delete Source Entry?</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold">"{sourceToDelete.title}"</span>?
              Subsequent brand checks will no longer enforce this rule or fact.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSourceToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSource(sourceToDelete.id);
                  setSourceToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md"
              >
                Delete Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
