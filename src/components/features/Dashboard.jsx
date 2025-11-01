// src/components/features/Dashboard.jsx
// Enhanced Dashboard with Recent Activity Tracking

import { Card, CardHeader, CardBody } from '../ui/Card';
import { 
  TrendingUp, Video, FileText, MessageSquare, 
  ArrowRight, Activity, Clock, FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivity } from '../../context/ActivityContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { getRecentActivities } = useActivity();
  const recentActivities = getRecentActivities(5);

  const features = [
    {
      title: 'Competitor Analysis',
      description: 'Analyze competitors and get actionable insights',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-700',
      path: '/competitor-analysis',
    },
    {
      title: 'Video Pitch Analyzer',
      description: 'Extract insights from YouTube pitch videos',
      icon: Video,
      color: 'from-red-500 to-red-700',
      path: '/video-pitch',
    },
    {
      title: 'AI Analyzer',
      description: 'Extract and visualize plots, tables from PDFs',
      icon: FileText,
      color: 'from-purple-500 to-purple-700',
      path: '/ai-analyzer',
    },
    {
      title: 'Ask Your Startup',
      description: 'Upload documents and ask questions with AI',
      icon: MessageSquare,
      color: 'from-teal-500 to-teal-700',
      path: '/ask-your-startup',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'competitor_analysis':
        return TrendingUp;
      case 'video_analysis':
        return Video;
      case 'pdf_analysis':
        return FileText;
      case 'document_upload':
      case 'rag_query':
        return MessageSquare;
      default:
        return FileCheck;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'competitor_analysis':
        return 'text-blue-500';
      case 'video_analysis':
        return 'text-red-500';
      case 'pdf_analysis':
        return 'text-purple-500';
      case 'document_upload':
      case 'rag_query':
        return 'text-teal-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Choose a tool to get started
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={feature.path}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium">
                          Get Started
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Recent Activity
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity. Start using the tools to see your activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`mt-1 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}