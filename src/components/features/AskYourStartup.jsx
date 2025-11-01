// src/components/features/AskYourStartup.jsx
// RAG-based Document Q&A System with Markdown Support and Fixed Chat

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, MessageSquare, Send, Sparkles, 
  Loader2, CheckCircle, BookOpen, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AskYourStartup() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [collectionName, setCollectionName] = useState(null);
  const [chunksCreated, setChunksCreated] = useState(0);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`http://localhost:8000/api/rag/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCollectionName(data.data.collection_name);
        setChunksCreated(data.data.chunks_created);
        toast.success('Document uploaded and indexed successfully!');
      } else {
        toast.error('Upload failed');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Error uploading document');
    }
  });

  // Query RAG mutation
  const queryMutation = useMutation({
    mutationFn: async ({ collection_name, query }) => {
      const response = await fetch(`http://localhost:8000/api/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_name,
          query,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Query failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setChatHistory(prev => [...prev, {
          type: 'user',
          message: data.data.query,
          timestamp: new Date()
        }, {
          type: 'assistant',
          message: data.data.answer,
          timestamp: new Date()
        }]);
        setQuery('');
        toast.success('Answer received!');
      } else {
        toast.error('Query failed');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Error querying document');
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

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    uploadMutation.mutate(selectedFile);
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (!collectionName) {
      toast.error('Please upload a document first');
      return;
    }
    
    queryMutation.mutate({ collection_name: collectionName, query: query.trim() });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCollectionName(null);
    setChunksCreated(0);
    setQuery('');
    setChatHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Ask Your Startup
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your documents and ask questions - get instant answers powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Upload Document
                  </h2>
                  <p className="text-sm text-gray-500">
                    PDF files only (Max 10MB)
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {!collectionName ? (
                <>
                  {/* Drag and Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center transition-all
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
                      disabled={uploadMutation.isPending}
                    />
                    
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    
                    {!selectedFile ? (
                      <>
                        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                          Drop PDF here or click
                        </p>
                        <p className="text-xs text-gray-500">
                          Max 10MB
                        </p>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                          📄 {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={handleUpload}
                        variant="primary"
                        fullWidth
                        loading={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload & Index'}
                      </Button>
                    </motion.div>
                  )}

                  {/* Loading State */}
                  {uploadMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                    >
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                        <div>
                          <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                            Processing document...
                          </p>
                          <p className="text-xs text-teal-700 dark:text-teal-300">
                            Creating searchable index
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                          Document Indexed
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {chunksCreated} searchable chunks created
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    fullWidth
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Upload New Document
                  </Button>
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  Tips
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span>Upload pitch decks, business plans, or research documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span>Ask specific questions about your document</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span>Get instant answers based on document content</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Ask Questions
                  </h2>
                  <p className="text-sm text-gray-500">
                    {collectionName ? 'Chat with your document' : 'Upload a document to start'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="flex-1 flex flex-col min-h-0">
              {/* Chat History - Scrollable */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      {collectionName 
                        ? 'Start asking questions about your document'
                        : 'Upload a document to begin'
                      }
                    </p>
                    {collectionName && (
                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                        <p className="font-medium">Try asking:</p>
                        <ul className="space-y-1 text-xs">
                          <li>"What is the main idea of this document?"</li>
                          <li>"Summarize the key points"</li>
                          <li>"What are the financial projections?"</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {chatHistory.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-lg ${
                            item.type === 'user'
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {item.type === 'user' ? (
                            <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Custom styles for markdown elements
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc" {...props} />,
                                  ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                                  code: ({node, inline, ...props}) => 
                                    inline ? (
                                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs" {...props} />
                                    ) : (
                                      <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto" {...props} />
                                    ),
                                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                                  em: ({node, ...props}) => <em className="italic" {...props} />,
                                }}
                              >
                                {item.message}
                              </ReactMarkdown>
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${
                            item.type === 'user' 
                              ? 'text-teal-100' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}

                {/* Loading indicator */}
                {queryMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Searching document...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Form - Fixed at bottom */}
              <form onSubmit={handleQuerySubmit} className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={collectionName ? "Ask anything about your document..." : "Upload a document first"}
                  disabled={!collectionName || queryMutation.isPending}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!collectionName || queryMutation.isPending || !query.trim()}
                  loading={queryMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}