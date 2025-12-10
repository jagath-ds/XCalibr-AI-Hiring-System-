// src/pages/admin/SystemLogPage.jsx

import React, { useState, useEffect } from 'react';
import { getSystemLogs } from '../api/api'; 
import { format } from 'date-fns'; // For formatting the date and time
import { FiShield } from 'react-icons/fi'; // Icon for empty state

const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getSystemLogs();
        setLogs(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch system logs:', err);
        setError('Failed to load system logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []); // The empty dependency array means this runs once on mount

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'UPDATE':
      case 'LOGIN_FAIL':
        return 'bg-yellow-100 text-yellow-800';
      case 'CREATE':
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status) => {
    return status === 'Success'
      ? 'text-green-500'
      : 'text-red-500';
  }

  // Helper component for loading state
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  // Helper component for empty state
  const EmptyState = () => (
    <div className="text-center py-16 bg-white rounded-lg shadow-md">
      <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No Logs Found</h3>
      <p className="mt-1 text-sm text-gray-500">
        There are no system activity logs to display yet.
      </p>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        System Activity Logs
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : !logs.length ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.logid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.admin ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {log.admin.firstname} {log.admin.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.admin.email}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Unknown
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                          log.actiontype
                        )}`}
                      >
                        {log.actiontype}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate">
                      {log.actiondescription}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(
                        new Date(log.timestamped),
                        'MMM d, yyyy, h:mm a'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogPage;