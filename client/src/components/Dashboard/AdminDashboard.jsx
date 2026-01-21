const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
// src/components/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import StatCard from '../Cards/StatCard';
import ApplicationList from '../Applications/ApplicationList';
import ClientList from '../Clients/ClientList';
import Chart from 'react-apexcharts';

export default function AdminDashboard() {
  const { data: stats, loading } = useApi('/api/admin/stats');
  const [filter, setFilter] = useState('all');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Welcome back, Admin
              </p>
            </div>
            
            {/* FILTER CONTROLS */}
            <div className="flex flex-wrap gap-2">
              {['all', 'this_week', 'this_month'].map(option => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon="📋"
            trend="+12%"
            color="blue"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon="👥"
            trend="+8%"
            color="teal"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon="✅"
            trend="+3%"
            color="green"
          />
          <StatCard
            title="Revenue (AUD)"
            value={`$${(stats.revenue / 1000).toFixed(1)}K`}
            icon="💰"
            trend="+15%"
            color="amber"
          />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* APPLICATION STATUS CHART */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Application Status Overview
            </h2>
            <Chart
              type="area"
              series={[{
                name: 'Applications',
                data: stats.applicationTrend
              }]}
              options={{
                chart: { toolbar: { show: false } },
                colors: ['#38bdf8'],
                stroke: { curve: 'smooth' }
              }}
              height={300}
            />
          </div>

          {/* VISA BREAKDOWN */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Visa Types
            </h2>
            <Chart
              type="donut"
              series={[
                stats.visa189Count,
                stats.visa190Count,
                stats.visa491Count
              ]}
              options={{
                labels: ['189', '190', '491'],
                colors: ['#38bdf8', '#0ea5e9', '#0284c7']
              }}
              height={300}
            />
          </div>
        </div>

        {/* TABLES SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RECENT APPLICATIONS */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Applications
              </h2>
            </div>
            <ApplicationList limit={5} />
          </div>

          {/* ACTIVE CLIENTS */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Active Clients
              </h2>
            </div>
            <ClientList limit={5} status="active" />
          </div>
        </div>
      </div>
    </div>
  );
}
