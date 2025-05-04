import { useState, useEffect } from 'react';
import { getAuditLog } from '../services/permitService';
import PermissionGuard from './PermissionGuard';

/**
 * PermitAuditLog Component
 * 
 * Displays the authorization audit log from Permit.io, providing insights
 * into authorization decisions and access control for administrators.
 */
const PermitAuditLog = () => {
  const [auditLog, setAuditLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'allowed', 'denied'

  useEffect(() => {
    const fetchAuditLog = () => {
      try {
        // Get the audit log from the Permit.io service
        const log = getAuditLog();
        setAuditLog(log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (error) {
        console.error('Failed to fetch audit log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchAuditLog();

    // Set up periodic refresh
    const intervalId = setInterval(fetchAuditLog, 5000);

    // Clean up
    return () => clearInterval(intervalId);
  }, []);

  // Filter the audit log based on the selected filter
  const filteredLog = filter === 'all' 
    ? auditLog 
    : auditLog.filter(entry => 
        filter === 'allowed' ? entry.allowed : !entry.allowed
      );

  return (
    <PermissionGuard
      action="administer"
      resource="system"
      fallback={
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Access Restricted</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You don't have permission to view the authorization audit logs.</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Authorization Audit Log</h3>
            <p className="mt-1 text-sm text-gray-500">
              Real-time log of authorization decisions made by Permit.io
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Decisions</option>
              <option value="allowed">Allowed Only</option>
              <option value="denied">Denied Only</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading audit log...</span>
            </div>
          </div>
        ) : filteredLog.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' 
              ? 'No authorization decisions have been logged yet.' 
              : `No ${filter === 'allowed' ? 'allowed' : 'denied'} decisions found.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decision
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLog.map((entry, index) => (
                  <tr key={index} className={entry.allowed ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {entry.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entry.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.allowed ? 'Allowed' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default PermitAuditLog; 