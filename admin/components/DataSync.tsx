"use client";

import { useState } from 'react';
import { RefreshCwIcon, DatabaseIcon, BriefcaseIcon, BookOpenIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

interface DataSyncStats {
  jobs_added: number;
  courses_added: number;
  total_jobs: number;
  total_courses: number;
  errors: string[];
}

export default function DataSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<DataSyncStats | null>(null);
  const [error, setError] = useState<string>('');

  const syncData = async () => {
    setSyncing(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/sync-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          update_jobs: true,
          update_courses: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      const data: DataSyncStats = await response.json();
      setLastSync(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DatabaseIcon className="w-5 h-5 text-lavender-500" />
            External Data Sync
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Update jobs and courses from external APIs and platforms
          </p>
        </div>
        
        <button
          onClick={syncData}
          disabled={syncing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${syncing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-lavender-500 hover:bg-lavender-600 text-white'
            }
          `}
        >
          <RefreshCwIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
            <BriefcaseIcon className="w-4 h-4" />
            Job Sources
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• JSearch API (RapidAPI) - Free tier</li>
            <li>• Adzuna API - Free tier</li>
            <li>• Manual curation</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 flex items-center gap-2 mb-2">
            <BookOpenIcon className="w-4 h-4" />
            Course Sources
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Udemy courses</li>
            <li>• Coursera content</li>
            <li>• edX programs</li>
          </ul>
        </div>
      </div>

      {/* Last Sync Results */}
      {lastSync && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            Last Sync Results
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lastSync.jobs_added}</div>
              <div className="text-xs text-gray-500">Jobs Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lastSync.courses_added}</div>
              <div className="text-xs text-gray-500">Courses Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{lastSync.total_jobs}</div>
              <div className="text-xs text-gray-500">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{lastSync.total_courses}</div>
              <div className="text-xs text-gray-500">Total Courses</div>
            </div>
          </div>
          
          {lastSync.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4" />
                Sync Errors
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {lastSync.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircleIcon className="w-4 h-4" />
            <span className="font-medium">Sync Failed</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* API Configuration Help */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">API Configuration</h3>
        <p className="text-sm text-yellow-700 mb-2">
          To enable automatic job fetching, configure these API keys in your backend .env file:
        </p>
        <ul className="text-xs text-yellow-600 space-y-1">
          <li><strong>JSEARCH_API_KEY</strong> - Get free key from RapidAPI (100 requests/month)</li>
          <li><strong>ADZUNA_API_ID & ADZUNA_API_KEY</strong> - Free tier at developer.adzuna.com</li>
        </ul>
      </div>
    </div>
  );
}