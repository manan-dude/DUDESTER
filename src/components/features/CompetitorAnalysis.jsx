// src/components/features/CompetitorAnalysis.jsx
// Enhanced Competitor Analysis with Beautiful Output Display

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Download, Loader2, Building2, Users, DollarSign,
  Globe, Target, Award, AlertTriangle, Lightbulb, Package,
  BarChart3, Zap, Shield, TrendingDown, ExternalLink, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { competitorAPI } from '../../services/api';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody } from '../ui/Card';

export default function CompetitorAnalysis() {
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: ({ name, url }) => competitorAPI.analyze(name, url),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        toast.success('Analysis completed!');
      } else {
        toast.error('Invalid response format');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Error analyzing competitor');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!companyName.trim() || !companyUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    analysisMutation.mutate({ name: companyName, url: companyUrl });
  };

  const handleExport = () => {
    if (!analysisResult) return;
    
    const exportData = {
      analysis_date: new Date().toLocaleString(),
      ...analysisResult
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-analysis-${analysisResult.competitor_name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analysis exported successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Competitor Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze competitors and get actionable insights
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Company Information
              </h2>
              <p className="text-sm text-gray-500">
                Enter competitor details to analyze
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tech Startup Inc."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                required
                disabled={analysisMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company URL
              </label>
              <input
                type="url"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                required
                disabled={analysisMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={analysisMutation.isPending}
            >
              {analysisMutation.isPending ? 'Analyzing...' : 'Analyze Competitor'}
            </Button>
          </form>

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
                    Analyzing competitor...
                  </p>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    Scraping web data and evaluating insights
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
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-teal-500" />
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      {analysisResult.competitor_name}
                    </h3>
                    <a 
                      href={analysisResult.competitor_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      {analysisResult.competitor_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Target Company:</strong> {analysisResult.target_company}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  {analysisResult.justification}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Market Position */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Market Position
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.market_position}
              </p>
            </CardBody>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Target Audience
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.target_audience}
              </p>
            </CardBody>
          </Card>

          {/* Pricing Strategy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Pricing Strategy
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.pricing_strategy}
              </p>
            </CardBody>
          </Card>

          {/* Key Products & Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Key Products & Services
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {analysisResult.key_products_services.map((product, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{product}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Technology Stack
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.technology_stack}
              </p>
            </CardBody>
          </Card>

          {/* Funding & Revenue */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Funding & Revenue
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.funding_revenue}
              </p>
            </CardBody>
          </Card>

          {/* Geographic Presence */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Geographic Presence
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.geographic_presence}
              </p>
            </CardBody>
          </Card>

          {/* Key Strength */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Key Strength
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysisResult.key_strength}
              </p>
            </CardBody>
          </Card>

          {/* Competitive Advantages */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Competitive Advantages
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {analysisResult.competitive_advantages.map((advantage, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                    <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{advantage}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Weaknesses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Weaknesses
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {analysisResult.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Recent News */}
          {analysisResult.recent_news && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Recent News & Updates
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysisResult.recent_news}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Social Media Presence */}
          {analysisResult.social_media_presence && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Social Media Presence
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysisResult.social_media_presence}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() => {
                setCompanyName('');
                setCompanyUrl('');
                setAnalysisResult(null);
              }}
              variant="outline"
            >
              Analyze Another Competitor
            </Button>
            <Button onClick={handleExport} variant="primary">
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}