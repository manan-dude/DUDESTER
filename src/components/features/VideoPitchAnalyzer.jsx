// src/components/features/VideoPitchAnalyzer.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Video, Upload, Youtube, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { videoAPI } from '../../services/api';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody } from '../ui/Card';

export default function VideoPitchAnalyzer() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // YouTube Analysis Mutation
  const youtubeAnalysisMutation = useMutation({
    mutationFn: (url) => videoAPI.analyzeYouTube(url),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        toast.success('Video analysis completed!');
      } else {
        toast.error('Invalid response format');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Error analyzing video');
    },
  });

  // Video Upload Mutation
  const videoUploadMutation = useMutation({
    mutationFn: (file) => videoAPI.uploadVideo(file, setUploadProgress),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        setUploadProgress(0);
        toast.success('Video analysis completed!');
      } else {
        toast.error('Analysis failed');
      }
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error(error.message || 'Error uploading video');
    },
  });

  // Handle YouTube Form Submit
  const handleYouTubeSubmit = (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    youtubeAnalysisMutation.mutate(youtubeUrl);
  };

  // Handle Video Upload
  const handleFileUpload = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    videoUploadMutation.mutate(selectedFile);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const isLoading = youtubeAnalysisMutation.isPending || videoUploadMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Video Pitch Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze video pitches from YouTube or upload your own
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Video Input
              </h2>
              <p className="text-sm text-gray-500">
                Choose your input method
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                activeTab === 'youtube'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span className="font-medium">YouTube URL</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload Video</span>
            </button>
          </div>

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleYouTubeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={youtubeAnalysisMutation.isPending}
                  disabled={isLoading}
                >
                  {youtubeAnalysisMutation.isPending ? 'Analyzing...' : '🎬 Analyze Video Pitch'}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="video/*"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {videoUploadMutation.isPending && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={videoUploadMutation.isPending}
                  disabled={isLoading}
                >
                  {videoUploadMutation.isPending ? 'Processing...' : '📤 Upload & Analyze'}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="font-medium text-teal-900 dark:text-teal-100">
                    Analyzing video...
                  </p>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    This may take a few moments. Please don't close this page.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Video Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Video Information
              </h3>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                <p className="font-medium text-[var(--color-text)]">
                  {analysisResult.video_title || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-[var(--color-text)]">
                  {analysisResult.duration || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Channel</p>
                <p className="font-medium text-[var(--color-text)]">
                  {analysisResult.channel || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">URL</p>
                <a
                  href={analysisResult.youtube_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View Original
                </a>
              </div>
            </CardBody>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Executive Summary
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.executive_summary || 'No summary available'}
              </p>
            </CardBody>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Key Insights
              </h3>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {analysisResult.key_insights?.length > 0 ? (
                  analysisResult.key_insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-teal-500 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No insights available</p>
                )}
              </ul>
            </CardBody>
          </Card>

          {/* Main Points */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Main Points
              </h3>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {analysisResult.main_points?.length > 0 ? (
                  analysisResult.main_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-teal-500 mt-1">{index + 1}.</span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No main points available</p>
                )}
              </ul>
            </CardBody>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
