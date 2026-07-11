"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  BriefcaseIcon, UsersIcon, ShieldCheckIcon, SettingsIcon,
  UserCheckIcon, UserXIcon, CrownIcon, TrendingUpIcon
} from "lucide-react";

interface AdminStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  admin_users: number;
  oauth_users: number;
  recent_registrations: number;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetchStats();
  }, [token, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError("Failed to load admin data. You may not have admin access.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-dark mb-2">Access Denied</h1>
          <p className="text-ink/60 mb-6">{error}</p>
          <div className="space-y-3">
            <Link 
              href="/dashboard" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors block"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/login" 
              className="w-full bg-primary/10 hover:bg-primary/5 text-ink font-medium py-3 px-4 rounded-xl transition-colors block"
            >
              Login as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-primary-dark">CareerCure</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
                <CrownIcon className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-ink/60 hover:text-primary-dark text-sm font-medium"
              >
                User Dashboard
              </Link>
              <div className="text-sm text-ink/50">
                Welcome, {user?.email || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Admin Dashboard</h1>
          <p className="text-ink/60">Manage users and monitor system statistics</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">Total Users</p>
                  <p className="text-3xl font-bold text-primary-dark">{stats.total_users}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">Active Users</p>
                  <p className="text-3xl font-bold text-accent">{stats.active_users}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-xl">
                  <UserCheckIcon className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">Verified Users</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.verified_users}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">OAuth Users</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.oauth_users}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <UserXIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">Recent Signups</p>
                  <p className="text-sm text-ink/50">Last 7 days</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.recent_registrations}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <TrendingUpIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/60">Admin Users</p>
                  <p className="text-3xl font-bold text-red-600">{stats.admin_users}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <CrownIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users" className="group">
            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-dark">User Management</h3>
                  <p className="text-sm text-ink/60">View and manage all users</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/system" className="group">
            <div className="bg-surface rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <SettingsIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-dark">System Info</h3>
                  <p className="text-sm text-ink/60">View system configuration</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-paper rounded-xl p-6 border border-line opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 p-3 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6 text-ink/40" />
              </div>
              <div>
                <h3 className="font-semibold text-ink/50">Analytics</h3>
                <p className="text-sm text-ink/40">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
