import React from 'react';
import { useApi } from '../../hooks/useApi';

// Mock data to ensure it looks beautiful even before your DB is populated
const mockApplications = [
  { id: 'APP-9281', name: 'Arjun Thapa', subclass: '189', status: 'Approved', date: '2026-01-15' },
  { id: 'APP-9282', name: 'Sarah Jenkins', subclass: '190', status: 'Processing', date: '2026-01-18' },
  { id: 'APP-9283', name: 'Rohan Sharma', subclass: '491', status: 'Review', date: '2026-01-20' },
  { id: 'APP-9284', name: 'Emily Chen', subclass: '189', status: 'Pending', date: '2026-01-21' },
];

const statusStyles = {
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
};

export default function ApplicationList({ limit }) {
  // Use real data from your backend once the route is ready
  const { data: realApplications, loading } = useApi('/api/admin/applications/recent');
  
  // Fallback to mock data if backend isn't ready or loading
  const apps = (realApplications || mockApplications).slice(0, limit || 5);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50">
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Client</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Subclass</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {apps.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{app.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{app.id}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visa {app.subclass}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[app.status]}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-500 hover:text-blue-700 text-xs font-bold transition-opacity opacity-0 group-hover:opacity-100">
                  VIEW DETAILS
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {!apps.length && !loading && (
        <div className="p-12 text-center text-slate-500">
          No recent applications found.
        </div>
      )}
    </div>
  );
}