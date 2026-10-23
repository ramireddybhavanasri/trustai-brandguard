import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { BrandSource, Priority, SourceCategory, SourceStatus } from '../../types/brandguard';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: BrandSource) => void;
  editingSource?: BrandSource | null;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSource,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SourceCategory>('brand_fact');
  const [content, setContent] = useState('');
  const [approvedWording, setApprovedWording] = useState('');
  const [restrictedPattern, setRestrictedPattern] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [productTarget, setProductTarget] = useState('NOVA smartphone');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<SourceStatus>('approved');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingSource) {
      setTitle(editingSource.title);
      setType(editingSource.type);
      setContent(editingSource.content);
      setApprovedWording(editingSource.approvedWording || '');
      setRestrictedPattern(editingSource.restrictedPattern || '');
      setSupportingEvidence(editingSource.supportingEvidence || '');
      setProductTarget(editingSource.productTarget || 'NOVA smartphone');
      setPriority(editingSource.priority);
      setStatus(editingSource.status);
      setTags(editingSource.tags || []);
      setTagInput((editingSource.tags || []).join(', '));
      setExpiryDate(editingSource.expiryDate || '');
    } else {
      setTitle('');
      setType('brand_fact');
      setContent('');
      setApprovedWording('');
      setRestrictedPattern('');
      setSupportingEvidence('');
      setProductTarget('NOVA smartphone');
      setPriority('medium');
      setStatus('approved');
      setTags(['nova', 'specs']);
      setTagInput('nova, specs');
      setExpiryDate('');
    }
    setValidationError('');
  }, [editingSource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a source title.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Please provide the content or rule description.');
      return;
    }

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const updatedSource: BrandSource = {
      id: editingSource ? editingSource.id : `src-${Date.now()}`,
      title: title.trim(),
      type,
      content: content.trim(),
      approvedWording: approvedWording.trim() || undefined,
      restrictedPattern: restrictedPattern.trim() || undefined,
      supportingEvidence: supportingEvidence.trim() || undefined,
      productTarget: productTarget.trim() || undefined,
      priority,
      status,
      tags: parsedTags,
      expiryDate: expiryDate || undefined,
      createdAt: editingSource ? editingSource.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedSource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {editingSource ? 'Edit Source Entry' : 'Add New Source to Library'}
            </h3>
            <p className="text-xs text-neutral-500">
              Configure authoritative facts, tone guidelines, claims, or terminology rules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Source Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NOVA Camera 50 MP Spec"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Category Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SourceCategory)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="brand_fact">Approved Brand Fact</option>
                <option value="guideline">Brand Guideline</option>
                <option value="claim">Approved Claim & Evidence</option>
                <option value="preferred_term">Preferred Terminology</option>
                <option value="restricted_term">Restricted Terminology</option>
                <option value="asset">Approved Asset</option>
                <option value="accessibility">Accessibility Rule</option>
                <option value="custom_rule">Custom Rule</option>
              </select>
            </div>
          </div>

          {/* Content Description */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Rule or Fact Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full verified specification, tone rule, or rationale..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          {/* Conditional Fields based on category */}
          {(type === 'brand_fact' || type === 'preferred_term' || type === 'restricted_term') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  {type === 'brand_fact' ? 'Expected Value / Spec' : 'Approved Wording / Replacement'}
                </label>
                <input
                  type="text"
                  value={approvedWording}
                  onChange={(e) => setApprovedWording(e.target.value)}
                  placeholder={type === 'brand_fact' ? 'e.g. 50 MP' : 'e.g. customer-centric'}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-md text-xs bg-white"
                />
              </div>

              {(type === 'preferred_term' || type === 'restricted_term') && (
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Restricted Term / Pattern to Flag
                  </label>
                  <input
                    type="text"
                    value={restrictedPattern}
                    onChange={(e) => setRestrictedPattern(e.target.value)}
                    placeholder="e.g. user-focused or cheapest"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md text-xs bg-white"
                  />
                </div>
              )}

              {type === 'brand_fact' && (
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Product Target</label>
                  <input
                    type="text"
                    value={productTarget}
                    onChange={(e) => setProductTarget(e.target.value)}
                    placeholder="e.g. NOVA smartphone"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md text-xs bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Supporting Evidence URL */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Supporting Evidence / Reference URL
            </label>
            <input
              type="text"
              value={supportingEvidence}
              onChange={(e) => setSupportingEvidence(e.target.value)}
              placeholder="https://... or certificate ID"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              For claims, empty evidence means the claim will be flagged as requiring evidence before publication.
            </p>
          </div>

          {/* Status, Priority, Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Approval Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SourceStatus)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs font-medium"
              >
                <option value="approved">Approved (Authoritative)</option>
                <option value="draft">Draft (Ignored in checks)</option>
                <option value="pending_review">Pending Review (Ignored in checks)</option>
                <option value="archived">Archived (Ignored in checks)</option>
              </select>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Only Approved sources are used in checks.
              </p>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs"
              >
                <option value="high">High (Strict Flagging)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (Advisory)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. nova, specs, camera, 2026"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs"
            >
              {editingSource ? 'Save Changes' : 'Create Source Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
