// src/components/features/AIAnalyzer.jsx
// Complete PDF Analysis Component with Tabs and Table Rendering

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
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'visualizations'

  // Real API integration matching your backend
  const analysisMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`https://analysisbackend-production.up.railway.app/api/ai-analyzer/analyze`, {
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
        setActiveTab('summary'); // Start with summary tab
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

  // Helper to render tables as HTML tables
  const renderTable = (tableData) => {
    if (typeof tableData === 'object' && tableData.Title && tableData.Data) {
      // Handle JSON array format (most common from backend)
      if (Array.isArray(tableData.Data)) {
        const rows = tableData.Data;
        if (rows.length === 0) {
          return (
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {tableData.Title}
              </p>
              <p className="text-sm text-gray-500">No data available</p>
            </div>
          );
        }

        // First row is usually headers
        const headers = rows[0];
        const dataRows = rows.slice(1);

        return (
          <div className="overflow-x-auto">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {tableData.Title}
            </p>
            <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <thead className="bg-teal-500 text-white">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-semibold border border-gray-300 dark:border-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Handle string format (legacy)
      if (typeof tableData.Data === 'string') {
        const rows = tableData.Data.split('\n').filter(row => row.trim());
        
        return (
          <div className="overflow-x-auto">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {tableData.Title}
            </p>
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <tbody>
                {rows.map((row, idx) => {
                  const cells = row.split(/[,|\t]/).map(cell => cell.trim());
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                      {cells.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Fallback for other data types
      return (
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {tableData.Title}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {JSON.stringify(tableData.Data)}
          </p>
        </div>
      );
    }
    
    return (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {typeof tableData === 'string' ? tableData : JSON.stringify(tableData)}
      </p>
    );
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

      {/* Analysis Results with Tabs */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Tab Navigation */}
            <Card>
              <CardBody className="p-0">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'summary'
                        ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    📊 Document Analysis Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('visualizations')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'visualizations'
                        ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    🖼️ Extracted Visualizations
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* Tab Content */}
            {activeTab === 'summary' ? (
              /* DOCUMENT ANALYSIS SUMMARY TAB */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Analysis Summary Card */}
                <Card className="border-2 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Analysis Summary
                      </h3>
                    </div>
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

                {/* Document Analysis Details */}
                {analysisResult.analysis_summary && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Comprehensive Insights
                      </h3>
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
                                  {Array.isArray(analysisResult.analysis_summary.data_summary.key_metrics) 
                                    ? analysisResult.analysis_summary.data_summary.key_metrics.join(', ')
                                    : analysisResult.analysis_summary.data_summary.key_metrics}
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
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </p>
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
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {analysisResult.analysis_summary.visual_analysis.chart_types}
                                </p>
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
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {analysisResult.analysis_summary.visual_analysis.quality_assessment}
                                </p>
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
              </motion.div>
            ) : (
              /* EXTRACTED VISUALIZATIONS TAB */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {analysisResult.extracted_pages && analysisResult.extracted_pages.length > 0 ? (
                  analysisResult.extracted_pages.map((page, pageIdx) => (
                    <Card key={pageIdx}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-[var(--color-text)]">
                            📄 Page {page.page_num}
                          </h3>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-6">
                        {/* Display Tables */}
                        {page.extracted_data?.Tables && page.extracted_data.Tables.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-md font-semibold text-[var(--color-text)] flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-blue-500" />
                              Tables Extracted
                            </h4>
                            {page.extracted_data.Tables.map((table, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                {renderTable(table)}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Display Plots */}
                        {page.extracted_data?.Plots && page.extracted_data.Plots.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-md font-semibold text-[var(--color-text)] flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-purple-500" />
                              Plots & Charts
                            </h4>
                            {page.extracted_data.Plots.map((plot, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
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
                        
                        {/* Display Page Screenshot */}
                        {page.image_b64 && (
                          <div>
                            <h4 className="text-md font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-green-500" />
                              Page Screenshot
                            </h4>
                            <img
                              src={`data:image/png;base64,${page.image_b64}`}
                              alt={`Page ${page.page_num}`}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardBody className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No visualizations extracted from the document
                      </p>
                    </CardBody>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={() => {
                  setSelectedFile(null);
                  setAnalysisResult(null);
                  setActiveTab('summary');
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