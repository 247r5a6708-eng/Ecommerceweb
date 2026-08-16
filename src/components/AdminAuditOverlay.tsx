import { useState, useEffect } from 'react';
import { validateCatalogIntegrity, batchFixIssues } from '../services/catalogService';
import { ShieldAlert, X, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminAuditOverlay() {
  const { userProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isFixing, setIsFixing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'Warning' | 'Missing Data'>('All');

  // Check if admin: either explicitly flagged, or the main user email
  const isAdmin = userProfile?.isAdmin || userProfile?.email === 'kumarrachith0@gmail.com';

  if (!isAdmin) return null;


  const toggleSelection = (idx: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedIndices(newSet);
  };

  const toggleAll = () => {
    const visibleIndices = report?.issues
      ?.map((issue: any, index: number) => ({ issue, index }))
      ?.filter(({ issue }: any) => filterSeverity === 'All' || getSeverity(issue.type) === filterSeverity)
      ?.map(({ index }: any) => index) || [];

    const allVisibleSelected = visibleIndices.length > 0 && visibleIndices.every((i: number) => selectedIndices.has(i));

    if (allVisibleSelected) {
      const newSet = new Set(selectedIndices);
      visibleIndices.forEach((i: number) => newSet.delete(i));
      setSelectedIndices(newSet);
    } else {
      const newSet = new Set(selectedIndices);
      visibleIndices.forEach((i: number) => newSet.add(i));
      setSelectedIndices(newSet);
    }
  };

  const handleBatchFix = async () => {
    if (selectedIndices.size === 0) return;
    setIsFixing(true);
    try {
      const issuesToFix = Array.from(selectedIndices).map(idx => report.issues[idx]);
      await batchFixIssues(issuesToFix);
      await runAudit();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFixing(false);
    }
  };

  
  const getSeverity = (type: string) => {
    if (type === 'missing_sku') return 'Critical';
    if (type === 'invalid_sku') return 'Warning';
    if (type === 'missing_image') return 'Missing Data';
    return 'Warning';
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const results = await validateCatalogIntegrity();
      setReport(results);
      setSelectedIndices(new Set());
      if (!isOpen) setIsOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <>
      {/* Floating Admin Button */}
      <button 
        onClick={() => isOpen ? setIsOpen(false) : runAudit()}
        className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg shadow-red-500/20 transition-all flex items-center justify-center group"
      >
        <ShieldAlert className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out text-sm font-bold">
          Admin Audit
        </span>
      </button>

      {/* Audit Report Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-6 z-50 w-96 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">Catalog Audit Report</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={runAudit} disabled={isAuditing} className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {isAuditing && !report ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-4" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scanning catalog integrity...</p>
                </div>
              ) : report ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Missing SKUs</p>
                      <p className={`text-2xl font-bold ${report.missingSKUs > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {report.missingSKUs}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Invalid SKUs</p>
                      <p className={`text-2xl font-bold ${report.invalidSKUs > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        {report.invalidSKUs}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Missing Images</p>
                      <p className={`text-2xl font-bold ${report.missingImages > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        {report.missingImages}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-bold flex items-center h-8">
                        {report.issues?.length > 0 ? (
                          <span className="text-red-500 flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> Action Req.</span>
                        ) : (
                          <span className="text-green-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Healthy</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Issues */}
                  <div>
                    
                    
                    <div className="flex flex-col space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Identified Issues</h4>
                        <select
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value as any)}
                          className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300"
                        >
                          <option value="All">All Severities</option>
                          <option value="Critical">Critical</option>
                          <option value="Warning">Warning</option>
                          <option value="Missing Data">Missing Data</option>
                        </select>
                      </div>

                      {report.issues && report.issues.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={toggleAll}
                            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                          >
                            {(() => {
                              const visibleCount = report.issues.filter((issue: any) => filterSeverity === 'All' || getSeverity(issue.type) === filterSeverity).length;
                              const visibleSelectedCount = report.issues.filter((issue: any, idx: number) => (filterSeverity === 'All' || getSeverity(issue.type) === filterSeverity) && selectedIndices.has(idx)).length;
                              return visibleCount > 0 && visibleSelectedCount === visibleCount ? 'Deselect All' : 'Select All';
                            })()}
                          </button>
                          <button
                            onClick={handleBatchFix}
                            disabled={selectedIndices.size === 0 || isFixing}
                            className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {isFixing ? 'Fixing...' : `Fix Selected (${selectedIndices.size})`}
                          </button>
                        </div>
                      )}
                    </div>

                    {report.issues && report.issues.length > 0 ? (
                      <ul className="space-y-3">
                        {report.issues
                          .map((issue: any, index: number) => ({ issue, index }))
                          .filter(({ issue }: any) => filterSeverity === 'All' || getSeverity(issue.type) === filterSeverity)
                          .map(({ issue, index: idx }: any) => (
                          <li key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3 rounded-lg flex items-start space-x-3 text-sm cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" onClick={() => toggleSelection(idx)}>
  <div className="pt-0.5">
    <input 
      type="checkbox" 
      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" 
      checked={selectedIndices.has(idx)}
      onChange={() => {}} // handled by parent onClick
    />
  </div>
  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-red-900 dark:text-red-200">{issue.type === 'missing_sku' ? 'Missing SKU' : issue.type === 'invalid_sku' ? 'Invalid Format' : 'Missing Image'}</p>
                              <p className="text-red-800 dark:text-red-300 mt-0.5 text-xs">{issue.message}</p>
                              <div className="flex space-x-3 mt-2 text-[10px] font-mono text-red-600/70 dark:text-red-400/70">
                                {issue.variantId && <span>Var: {issue.variantId}</span>}
                                {issue.skuId && <span>SKU: {issue.skuId}</span>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="font-bold text-green-900 dark:text-green-200 text-sm">All Data Mapped Correctly</p>
                        <p className="text-green-700 dark:text-green-300 text-xs mt-1">No missing variants or broken references found.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
