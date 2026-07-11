"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  BriefcaseIcon, ArrowLeftIcon, DatabaseIcon, SettingsIcon,
  CheckCircleIcon, XCircleIcon, ServerIcon, UserIcon, ShieldIcon
} from "lucide-react";

interface SystemInfo {
  database: {
    status: string;
    version: string;
  };
  oauth: {
    google_configured: boolean;
    linkedin_configured: boolean;
  };
  content: {
    user_profiles: number;
  };
  admin_user: {
    id: number;
    email: string;
    name: string;
  };
}

export default function SystemInfo() {
  const { token } = useAuth();
  const router = useRouter();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetchSystemInfo();
  }, [token, router]);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/system/info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system info');
      }

      const data = await response.json();
      setSystemInfo(data);
    } catch (err) {
      console.error('Error fetching system info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-primary-dark">CareerCure</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Information</h1>
          <p className="text-gray-600">View system configuration and health status</p>
        </div>

        {systemInfo && (
          <div className="space-y-6">
            {/* Database Status */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DatabaseIcon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Database</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Connection Status</span>
                  <div className="flex items-center gap-2">
                    {systemInfo.database.status === "Connected" ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Error</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Version</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {systemInfo.database.status === "Connected" 
                      ? systemInfo.database.version.split(' ')[0]
                      : "Unknown"
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* OAuth Configuration */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ShieldIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">OAuth Configuration</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Google OAuth</span>
                  <div className="flex items-center gap-2">
                    {systemInfo.oauth.google_configured ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Configured</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Not Configured</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">LinkedIn OAuth</span>
                  <div className="flex items-center gap-2">
                    {systemInfo.oauth.linkedin_configured ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Configured</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Not Configured</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {(!systemInfo.oauth.google_configured || !systemInfo.oauth.linkedin_configured) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Setup Required:</strong> Update your <code className="bg-yellow-100 px-1 rounded">.env</code> file with OAuth credentials to enable social login.
                  </p>
                </div>
              )}
            </div>

            {/* Content Statistics */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ServerIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Content Statistics</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">User Profiles</span>
                  <span className="text-2xl font-bold text-purple-600">{systemInfo.content.user_profiles}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">API Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Server Time</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Admin User */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <UserIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Current Session</h2>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium">
                    {systemInfo.admin_user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{systemInfo.admin_user.name}</div>
                  <div className="text-sm text-gray-500">{systemInfo.admin_user.email}</div>
                  <div className="text-xs text-red-600 font-medium">Admin User ID: {systemInfo.admin_user.id}</div>
                </div>
              </div>
            </div>

            {/* API Documentation Link */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">API Documentation</h3>
                  <p className="text-sm text-gray-600">View interactive API documentation and test endpoints</p>
                </div>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-d text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Open API Docs
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}