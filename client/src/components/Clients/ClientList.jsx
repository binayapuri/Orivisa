import React from 'react';
import { useApi } from '../../hooks/useApi';

// Mock data to ensure the dashboard looks full and professional immediately
const mockClients = [
  { id: 'C-101', name: 'Jagadesh Kumar', email: 'jkumar@example.com', status: 'active', lastInteraction: '2 hours ago' },
  { id: 'C-102', name: 'Nawin Adhikari', email: 'nadhikari@example.com', status: 'lead', lastInteraction: '1 day ago' },
  { id: 'C-103', name: 'Rupinder Singh', email: 'rsingh@example.com', status: 'active', lastInteraction: '3 days ago' },
  { id: 'C-104', name: 'Vikas Sidhu', email: 'vsidhu@example.com', status: 'pending', lastInteraction: '5 days ago' },
];

const statusStyles = {
  active: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/20 dark:text-green-400',
  pending: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
  lead: 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-700/50 dark:text-slate-400',
};

export default function ClientList({ limit, status }) {
  // Logic to fetch real client data later
  const { data: realClients, loading } = useApi('/api/admin/clients/active');
  
  // Use mock data if real data isn't available yet
  const clients = (realClients || mockClients).slice(0, limit || 5);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {clients.map((client) => (
              <tr key={client.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* AVATAR CIRCLE */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {client.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[client.status]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                    {client.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right hidden md:table-cell">
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                    {client.lastInteraction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
        <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 uppercase tracking-widest">
          View All Clients →
        </button>
      </div>
    </div>
  );
}