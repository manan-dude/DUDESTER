// src/components/features/AIAnalyzer.jsx
// Complete PDF Analysis Component - Fixed Object Rendering Issue

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Upload, FileText, Download, BarChart3, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  FileSearch, Loader2, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';

export default function AIAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Real API integration matching your backend
  const analysisMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`http://localhost:8000/api/ai-analyzer/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysisResult(data.data);
        toast.success('Analysis completed successfully!');
      } else {
        toast.error('Analysis returned no data');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Error analyzing document');
    }
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    analysisMutation.mutate(selectedFile);
  };

  const handleExport = () => {
    if (!analysisResult) return;
    
    // Create a comprehensive text export
    const exportData = {
      fileName: selectedFile?.name,
      analysisDate: new Date().toLocaleString(),
      ...analysisResult
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${selectedFile?.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analysis exported successfully!');
  };

  // Helper function to safely render data (handles objects, arrays, and strings)
  const renderData = (data) => {
    if (!data) return 'N/A';
    
    // If it's an object with Title and Data properties
    if (typeof data === 'object' && data.Title && data.Data) {
      return (
        <div className="space-y-2">
          <p className="font-medium text-gray-600 dark:text-gray-400">{data.Title}</p>
          <p className="text-gray-700 dark:text-gray-300">{data.Data}</p>
        </div>
      );
    }
    
    // If it's a plain object, stringify it
    if (typeof data === 'object' && !Array.isArray(data)) {
      return JSON.stringify(data, null, 2);
    }
    
    // If it's an array, join it
    if (Array.isArray(data)) {
      return data.join(', ');
    }
    
    // If it's a string or number, return as-is
    return String(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          AI Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract and visualize plots, tables, and graphs from PDFs
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Upload PDF Document
              </h2>
              <p className="text-sm text-gray-500">
                Supports PDF files (Max 10MB)
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragActive 
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-teal-400'
              }
            `}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={analysisMutation.isPending}
            />
            
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            
            {!selectedFile ? (
              <>
                <p className="text-lg font-medium text-[var(--color-text)] mb-2">
                  📄 Drop your PDF here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF files (Max 10MB)
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-teal-600 dark:text-teal-400">
                  📄 {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {selectedFile && !analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                onClick={handleAnalyze}
                variant="primary"
                fullWidth
                loading={analysisMutation.isPending}
                disabled={analysisMutation.isPending}
              >
                {analysisMutation.isPending ? 'Analyzing Document...' : 'Analyze Document'}
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {analysisMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="font-medium text-teal-900 dark:text-teal-100">
                    Analyzing document...
                  </p>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    Extracting visualizations, tables, and insights
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Analysis Summary
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Extracted Items
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                      {analysisResult.pages_analyzed} pages analyzed, {analysisResult.analysis_summary?.data_summary?.charts_found || 0} visualizations extracted
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Processing Status
                    </p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Complete
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Extracted Visualizations */}
            {analysisResult.extracted_pages && analysisResult.extracted_pages.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      📊 Extracted Visualizations
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tables, charts, and plots extracted from your document
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <h4 className="text-md font-semibold text-[var(--color-text)] mb-4">
                    📈 Extracted Plots & Charts
                  </h4>
                  <div className="space-y-6">
                    {analysisResult.extracted_pages.map((page, pageIdx) => (
                      <div key={pageIdx} className="space-y-4">
                        <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Page {page.page_num}
                        </h5>
                        
                        {/* Display Tables */}
                        {page.extracted_data?.Tables && page.extracted_data.Tables.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500">Tables:</p>
                            {page.extracted_data.Tables.map((table, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                {/* Handle object with Title and Data */}
                                {typeof table === 'object' && table.Title && table.Data ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                      {table.Title}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {table.Data}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {typeof table === 'string' ? table : JSON.stringify(table)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Display Plots */}
                        {page.extracted_data?.Plots && page.extracted_data.Plots.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500">Plots & Charts:</p>
                            {page.extracted_data.Plots.map((plot, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                {/* Handle object with Title and Data */}
                                {typeof plot === 'object' && plot.Title && plot.Data ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                      {plot.Title}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {plot.Data}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {typeof plot === 'string' ? plot : JSON.stringify(plot)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Display extracted image if available */}
                        {page.image_b64 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Page Screenshot:</p>
                            <img
                              src={`data:image/png;base64,${page.image_b64}`}
                              alt={`Page ${page.page_num}`}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Document Analysis Summary */}
            {analysisResult.analysis_summary && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Document Analysis Summary
                  </h3>
                  <p className="text-sm text-gray-500">
                    Comprehensive insights and key findings from the analyzed document
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Document Overview */}
                  {analysisResult.analysis_summary.document_overview && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-teal-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          📄 Document Overview
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Document Title:</p>
                            <p className="font-medium text-[var(--color-text)]">
                              {selectedFile?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Pages:</p>
                            <p className="font-medium text-[var(--color-text)]">
                              {analysisResult.analysis_summary.document_overview.pages_analyzed}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Document Type:</p>
                            <p className="font-medium text-[var(--color-text)]">
                              {analysisResult.analysis_summary.document_overview.document_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Analysis Date:</p>
                            <p className="font-medium text-[var(--color-text)]">
                              {new Date(analysisResult.analysis_summary.document_overview.analysis_timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {analysisResult.analysis_summary.key_insights && analysisResult.analysis_summary.key_insights.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          💡 Key Insights
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.analysis_summary.key_insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-500 mt-1">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Data Summary */}
                  {analysisResult.analysis_summary.data_summary && (
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          📊 Data Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Tables Found:</p>
                            <p className="text-xl font-bold text-[var(--color-text)]">
                              {analysisResult.analysis_summary.data_summary.tables_found}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Charts Found:</p>
                            <p className="text-xl font-bold text-[var(--color-text)]">
                              {analysisResult.analysis_summary.data_summary.charts_found}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Key Metrics:</p>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              {renderData(analysisResult.analysis_summary.data_summary.key_metrics)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date Range:</p>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              {analysisResult.analysis_summary.data_summary.date_range}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financial Metrics */}
                  {analysisResult.analysis_summary.financial_metrics && (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          💰 Financial Metrics
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(analysisResult.analysis_summary.financial_metrics).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </p>
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {renderData(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Analysis */}
                  {analysisResult.analysis_summary.visual_analysis && (
                    <div className="flex items-start gap-3">
                      <FileSearch className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          📈 Visual Analysis
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Chart Types:
                            </p>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {renderData(analysisResult.analysis_summary.visual_analysis.chart_types)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Completeness Score:
                            </p>
                            <p className="text-lg font-bold text-[var(--color-text)]">
                              {analysisResult.analysis_summary.visual_analysis.completeness_score}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Quality Assessment:
                            </p>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {renderData(analysisResult.analysis_summary.visual_analysis.quality_assessment)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.analysis_summary.recommendations && analysisResult.analysis_summary.recommendations.length > 0 && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          ✅ Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.analysis_summary.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {analysisResult.analysis_summary.risk_factors && analysisResult.analysis_summary.risk_factors.length > 0 && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text)] mb-3">
                          ⚠️ Risk Factors
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.analysis_summary.risk_factors.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {typeof risk === 'string' ? risk : JSON.stringify(risk)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Export Button */}
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={() => {
                  setSelectedFile(null);
                  setAnalysisResult(null);
                }}
                variant="outline"
              >
                Analyze Another Document
              </Button>
              <Button onClick={handleExport} variant="primary">
                <Download className="w-4 h-4 mr-2" />
                📥 Export Complete Analysis
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}