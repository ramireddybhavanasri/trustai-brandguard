import React, { useState } from 'react';
import {
  Shield,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  User,
  Info,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AppSettings, DemonstrationRole } from '../../types/brandguard';

interface SettingsAndPrivacyProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onClearData: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
}

export const SettingsAndPrivacy: React.FC<SettingsAndPrivacyProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onClearData,
  onExportJSON,
  onImportJSON,
}) => {
  const [activeRole, setActiveRole] = useState<DemonstrationRole>(settings.activeRole);
  const [userName, setUserName] = useState(settings.activeUserName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleRoleSave = () => {
    onSaveSettings({
      ...settings,
      activeRole,
      activeUserName: userName.trim() || 'Demo User',
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          onImportJSON(content);
          setImportStatus('Data successfully imported and restored.');
          setTimeout(() => setImportStatus(null), 3000);
        } catch {
          setImportStatus('Error importing JSON. File format invalid.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Settings & Privacy Disclosure</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Transparent disclosure of storage architecture, local persistence, and demonstration parameters.
          </p>
        </div>
      </div>

      {/* Privacy & Storage Transparency Card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-6 space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Data Privacy & Local Storage Architecture
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              <strong>Zero External Leakage:</strong> All review drafts, brand sources, findings, and audit logs
              are stored exclusively within your local browser storage (<code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">localStorage</code>).
              Your marketing content is never transmitted to external cloud servers, third-party analytics, or unauthorized models.
            </p>
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1.5 text-neutral-700">
              <span className="font-semibold text-neutral-900 block">Demonstration & Storage Boundaries:</span>
              <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                <li>
                  <strong>Local to Current Device:</strong> Content saved in this browser does not synchronize to other machines or colleagues.
                </li>
                <li>
                  <strong>Demonstration Roles:</strong> User roles (Brand Compliance Lead, Marketing Manager, Content Creator) are simulated for workflow testing; they do not enforce backend cryptographic authentication.
                </li>
                <li>
                  <strong>Deterministic Rule Engine:</strong> Brand checks are powered by source-backed regex and specification matching. No paid AI services or API keys are required.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Active Demonstration Role Configuration */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600" />
          <span>Active Demonstration Persona</span>
        </h3>
        <p className="text-neutral-500">
          Switch your active demonstration persona to test how different team members interact with reviews, approvals, and revisions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Demonstration Role</label>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as DemonstrationRole)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs bg-white text-neutral-800"
            >
              <option value="Brand Compliance Lead">Brand Compliance Lead (Approvals & Source Admin)</option>
              <option value="Marketing Manager">Marketing Manager (Campaign Lead)</option>
              <option value="Content Creator">Content Creator (Draft Author)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Sarah Chen"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRoleSave}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md text-xs shadow-xs transition-colors"
          >
            Update Role Settings
          </button>
        </div>
      </div>

      {/* Data Management: Backup & Restore */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-neutral-900">Backup & State Management</h3>
        <p className="text-neutral-500">
          Export your current brand sources and reviews as JSON for offline backup or restore them onto another browser.
        </p>

        {importStatus && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={onExportJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-600" />
            <span>Export Application State (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-neutral-600" />
            <span>Import Application State (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset & Wipe Controls */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Demo Reset & Data Clearance</span>
        </h3>
        <p className="text-neutral-500">
          Restore standard sample data (including the NOVA 50 MP spec and initial drafts) or wipe all stored records.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset to Standard Seed Data</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear All Local Records</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-4 text-xs">
            <h4 className="text-sm font-semibold text-neutral-900">Reset Demo to Standard Seed Data?</h4>
            <p className="text-neutral-600 leading-relaxed">
              This will restore the standard approved sources (NOVA 50 MP camera, tone policies, claims) and sample reviews.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-4 text-xs">
            <h4 className="text-sm font-semibold text-rose-700">Clear All Local Records?</h4>
            <p className="text-neutral-600 leading-relaxed">
              This will remove all brand sources and review records from your browser. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearData();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
