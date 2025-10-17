'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  lastLogin?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        // Redirect to signin if no token
        window.location.href = '/signin';
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch('http://localhost:4000/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token is invalid, redirect to signin
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - LexisSync</title>
        <meta name="description" content="Your legal research dashboard" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">LexisSync</h1>
                <span className="ml-4 text-gray-600">Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium text-gray-800">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome back, {user?.username}!
            </h2>
            <p className="text-gray-600 mb-4">
              Ready to dive into your legal research? Here's your personalized dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">Email</p>
                <p className="text-blue-600">{user?.email}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">Account Status</p>
                <p className="text-green-600">Active</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-800 font-medium">Last Login</p>
                <p className="text-purple-600">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Judgments</h3>
              <p className="text-gray-600 mb-4">Find relevant legal judgments using our AI-powered search.</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">Start Searching →</button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Document</h3>
              <p className="text-gray-600 mb-4">Upload and analyze legal documents with AI assistance.</p>
              <button className="text-green-600 hover:text-green-700 font-medium">Upload Now →</button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">My Repository</h3>
              <p className="text-gray-600 mb-4">Manage your personal collection of legal documents.</p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">View Repository →</button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <p className="text-gray-800 font-medium">Account created successfully</p>
                  <p className="text-gray-600 text-sm">Welcome to LexisSync!</p>
                </div>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Start using LexisSync to see your activity here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;