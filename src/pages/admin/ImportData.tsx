
import React, { useState } from 'react';
import { createImportedProducts } from '../../services/catalogService';
import { motion } from 'motion/react';
import { Loader2, Upload, FileText, Database } from 'lucide-react';

export default function AdminImport() {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setParsedPreview([]);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        
        const response = await fetch('/api/admin/parse-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            base64Data: base64String,
            mimeType: file.type || (file.name.endsWith('.csv') ? 'text/csv' : 'application/pdf')
          })
        });
        
        if (!response.ok) throw new Error('Failed to parse file');
        
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setParsedPreview(data.products);
        } else {
          alert('No products could be extracted from this file.');
        }
        setImporting(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert('Error parsing file');
      setImporting(false);
    }
  };

  const saveImportedProducts = async () => {
    setLoading(true);
    try {
      await createImportedProducts(parsedPreview);
      setParsedPreview([]);
      alert('Products imported to database successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Data Import</h2>
      <p className="text-gray-500 mb-8">Upload a CSV or PDF file. The Gemini AI engine will parse natural language to structure your database catalog.</p>

      {parsedPreview.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:bg-gray-50 hover:border-gray-400 transition-all bg-white">
          {importing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
              <p className="text-lg font-bold text-gray-900">Parsing Document with Gemini AI...</p>
              <p className="text-sm text-gray-500 mt-2">Extracting relational catalog data.</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Catalog File</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Supported formats: .csv, .pdf.</p>
              <label className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" /> Browse Files
                <input type="file" accept=".csv, .pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-900">Data Extraction Preview</h3>
              <p className="text-sm text-gray-500">Found {parsedPreview.length} products in the document.</p>
            </div>
            <div className="space-x-3">
              <button 
                onClick={() => setParsedPreview([])}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveImportedProducts}
                disabled={loading}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                Save to Catalog
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white sticky top-0 shadow-sm">
                <tr>
                  <th className="p-4 font-bold text-gray-900">Product Name</th>
                  <th className="p-4 font-bold text-gray-900">Brand</th>
                  <th className="p-4 font-bold text-gray-900">Category</th>
                  <th className="p-4 font-bold text-gray-900">Price</th>
                  <th className="p-4 font-bold text-gray-900">Extracted SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedPreview.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{p.name}</td>
                    <td className="p-4 text-gray-600">{p.brand || '-'}</td>
                    <td className="p-4 text-gray-600">{p.category || 'General'}</td>
                    <td className="p-4 font-bold text-gray-900">₹{p.price}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{p.sku || 'Auto-generated'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
