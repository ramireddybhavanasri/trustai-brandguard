import React from 'react';
import { X, Printer, Download, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReviewRecord } from '../../types/brandguard';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewRecord | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  review,
}) => {
  if (!isOpen || !review) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    // Build CSV headers and rows
    const headers = [
      'Finding ID',
      'Category',
      'Severity',
      'Matched Text',
      'Explanation',
      'Linked Source',
      'Suggested Correction',
      'Resolution Status',
      'Override Reason',
    ];

    const rows = review.findings.map((f) => [
      `"${f.id}"`,
      `"${f.category}"`,
      `"${f.severity}"`,
      `"${(f.matchedText || '').replace(/"/g, '""')}"`,
      `"${(f.explanation || '').replace(/"/g, '""')}"`,
      `"${(f.sourceTitle || '').replace(/"/g, '""')}"`,
      `"${(f.suggestedCorrection || '').replace(/"/g, '""')}"`,
      `"${f.resolutionStatus}"`,
      `"${(f.overrideReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      `# TrustAI BrandGuard Governance Report\n` +
      `# Draft: "${review.title.replace(/"/g, '""')}"\n` +
      `# Channel: "${review.channel}", Product: "${review.brandOrProduct}"\n` +
      `# Score: ${review.complianceScore.overall}/100, Status: "${review.status}"\n` +
      `# Generated: "${new Date().toISOString()}"\n\n` +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brandguard_report_${review.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar (no-print) */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-semibold text-neutral-900">Governance Review Audit Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 ml-2"
              aria-label="Close report modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-neutral-800 font-sans">
          {/* Letterhead */}
          <div className="border-b border-neutral-200 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
                <span className="text-lg font-bold text-neutral-900 tracking-tight">TrustAI BrandGuard</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Official Brand Governance Certification & Audit Report
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono text-neutral-500 block">Report ID: {review.id}</span>
              <span className="text-neutral-500 block">Date: {new Date().toLocaleDateString()}</span>
              <span className="font-semibold text-teal-800 uppercase block mt-1">
                Status: {review.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Draft Meta Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Draft Title</span>
              <span className="font-medium text-neutral-900">{review.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Target Channel</span>
              <span className="font-medium text-neutral-900 capitalize">{review.channel}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Brand / Product</span>
              <span className="font-medium text-neutral-900">{review.brandOrProduct}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Compliance Score</span>
              <span className="font-mono font-bold text-teal-700 text-sm">
                {review.complianceScore.overall} / 100
              </span>
            </div>
          </div>

          {/* Content Comparison */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-neutral-900 mb-1 text-xs uppercase tracking-wider">
                1. Original Submitted Copy
              </h4>
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 font-mono text-xs text-neutral-800 leading-relaxed">
                {review.originalContent}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-1 text-xs uppercase tracking-wider">
                2. Final Revised Copy (With Human Corrections)
              </h4>
              <div className="p-3 bg-emerald-50/50 rounded border border-emerald-200 font-mono text-xs text-neutral-900 leading-relaxed">
                {review.currentContent}
              </div>
            </div>
          </div>

          {/* Findings Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
              3. Evaluated Governance Findings ({review.findings.length})
            </h4>
            {review.findings.length === 0 ? (
              <p className="text-neutral-500 italic">No violations flagged.</p>
            ) : (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Severity & Type</th>
                      <th className="px-3 py-2 font-semibold">Flagged Text</th>
                      <th className="px-3 py-2 font-semibold">Explanation & Linked Source</th>
                      <th className="px-3 py-2 font-semibold">Correction & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {review.findings.map((f) => (
                      <tr key={f.id} className="text-[11px]">
                        <td className="px-3 py-2">
                          <span className="font-semibold uppercase tracking-wider block">
                            {f.severity.replace('_', ' ')}
                          </span>
                          <span className="text-neutral-500 capitalize">{f.category}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-rose-700">"{f.matchedText}"</td>
                        <td className="px-3 py-2">
                          <p className="text-neutral-700 leading-snug">{f.explanation}</p>
                          {f.sourceTitle && (
                            <span className="text-[10px] text-neutral-500 block mt-0.5 font-medium">
                              Ref: {f.sourceTitle}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-emerald-800 capitalize block">
                            {f.resolutionStatus}
                          </span>
                          {f.suggestedCorrection && (
                            <span className="text-neutral-600 text-[10px] block font-mono">
                              → {f.suggestedCorrection}
                            </span>
                          )}
                          {f.overrideReason && (
                            <span className="text-neutral-500 text-[10px] block italic">
                              Override: {f.overrideReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Notes & Reviewer Sign-off */}
          {review.comments && review.comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
                4. Reviewer Audit Sign-off Log
              </h4>
              <div className="space-y-2">
                {review.comments.map((comm) => (
                  <div key={comm.id} className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                      <span className="font-semibold text-neutral-800">
                        {comm.author} ({comm.role})
                      </span>
                      <span>{new Date(comm.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Governance Disclaimer */}
          <div className="pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
            <strong>Platform Limitation Notice:</strong> TrustAI BrandGuard operates via deterministic rule-checking
            against authorized source library records. A compliance score of 100/100 certifies adherence to configured
            guidelines and specifications, but does not substitute for human editorial verification.
          </div>
        </div>
      </div>
    </div>
  );
};
