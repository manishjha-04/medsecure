import { useState, useEffect } from 'react';
import PermissionGuard from './PermissionGuard';
import { ROLES } from '../store/authStore';
import { getAuditLog } from '../services/permit';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('permissions');
  const [permissionMatrix, setPermissionMatrix] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [abacRules, setAbacRules] = useState([]);

  // Define resources
  const resources = [
    { id: 'patient', name: 'Patient' },
    { id: 'medical_record', name: 'Medical Record' },
    { id: 'system', name: 'System' },
    { id: 'prescription', name: 'Prescription' },
    { id: 'billing', name: 'Billing' },
    { id: 'lab_result', name: 'Lab Result' },
  ];

  // Define actions
  const actions = [
    { id: 'view', name: 'View' },
    { id: 'create', name: 'Create' },
    { id: 'edit', name: 'Edit' },
    { id: 'delete', name: 'Delete' },
    { id: 'manage', name: 'Manage' },
    { id: 'approve', name: 'Approve' },
    { id: 'administer', name: 'Administer' }
  ];

  // Initial permission matrix (would typically come from Permit.io API)
  useEffect(() => {
    // Simulate loading permissions from Permit.io
    setTimeout(() => {
      setPermissionMatrix({
        [ROLES.ADMIN]: {
          patient: ['view', 'create', 'edit', 'delete'],
          medical_record: ['view', 'create', 'edit', 'delete'],
          system: ['view', 'manage'],
          prescription: ['view', 'create', 'approve'],
          billing: ['view', 'create', 'manage'],
          lab_result: ['view', 'create', 'edit', 'delete']
        },
        [ROLES.DOCTOR]: {
          patient: ['view', 'create', 'edit'],
          medical_record: ['view', 'create', 'edit'],
          prescription: ['view', 'create', 'approve'],
          billing: ['view'],
          lab_result: ['view']
        },
        [ROLES.NURSE]: {
          patient: ['view'],
          medical_record: ['view', 'create'],
          prescription: ['view', 'administer'],
          lab_result: ['view']
        },
        [ROLES.PATIENT]: {
          medical_record: ['view'],
          prescription: ['view'],
          billing: ['view']
        }
      });
      
      // Sample ABAC rules
      setAbacRules([
        {
          id: 1,
          name: "Patient Self-View",
          description: "Patients can only view their own records",
          role: "patient",
          resource: "patient",
          action: "view",
          condition: "user.id === resource.id"
        },
        {
          id: 2,
          name: "Emergency Nurse Escalation",
          description: "Nurses in emergency department can edit patient info",
          role: "nurse",
          resource: "patient",
          action: "edit",
          condition: "user.department === 'Emergency'"
        },
        {
          id: 3,
          name: "Doctor Specialty Restriction",
          description: "Doctors can only approve prescriptions in their specialty",
          role: "doctor",
          resource: "prescription",
          action: "approve",
          condition: "resource.department === user.department"
        },
        {
          id: 4,
          name: "Cross-Tenant Restriction",
          description: "Users can only access resources in their own tenant/hospital",
          role: "all",
          resource: "all",
          action: "all",
          condition: "user.tenant === resource.tenant"
        }
      ]);
      
      // Get audit logs
      setAuditLogs(getAuditLog() || [
        {
          timestamp: new Date().toISOString(),
          userId: "doctor-smith",
          action: "view",
          resource: "patient", 
          allowed: true,
          reason: "Role-based permission applied"
        },
        {
          timestamp: new Date().toISOString(),
          userId: "patient-doe",
          action: "edit",
          resource: "medical_record",
          allowed: false,
          reason: "Role-based permission applied"
        },
        {
          timestamp: new Date().toISOString(),
          userId: "nurse-johnson",
          action: "administer",
          resource: "prescription",
          allowed: true,
          reason: "Role-based permission applied"
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle permission toggle
  const togglePermission = (role, resource, action) => {
    setPermissionMatrix(prevMatrix => {
      const updatedMatrix = { ...prevMatrix };
      
      // If the role has the permission, remove it
      if (updatedMatrix[role][resource].includes(action)) {
        updatedMatrix[role][resource] = updatedMatrix[role][resource].filter(a => a !== action);
      } else {
        // Otherwise, add it
        updatedMatrix[role][resource] = [...updatedMatrix[role][resource], action];
      }
      
      // In a real app, here you would call Permit.io API to update the permission
      console.log(`Updated permission for ${role} on ${resource}: ${action}`);
      
      // Add to audit log
      setAuditLogs(prev => [
        {
          timestamp: new Date().toISOString(),
          userId: "admin-user",
          action: updatedMatrix[role][resource].includes(action) ? "grant" : "revoke",
          resource: `${resource}:${action}`,
          allowed: true,
          reason: `Admin modified ${role} permissions`
        },
        ...prev
      ]);
      
      return updatedMatrix;
    });
  };

  return (
    <PermissionGuard
      action="manage"
      resource="system"
      fallback={
        <div className="text-center py-10">
          <p className="text-red-500">You do not have permission to access the admin panel.</p>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage system permissions with Permit.io
        </p>

        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['permissions', 'abac', 'audit', 'tenants'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab === 'abac' ? 'ABAC Rules' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'permissions' && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Role Permissions Matrix</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure which roles have access to which resources and actions.
            </p>

            {isLoading ? (
              <div className="mt-4 text-center py-10">
                <p className="text-gray-500">Loading permissions...</p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      {Object.keys(ROLES).map(roleKey => (
                        <th key={roleKey} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {ROLES[roleKey].replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.flatMap(resource => 
                      actions.map(action => (
                        <tr key={`${resource.id}-${action.id}`}>
                          {action.id === actions[0].id ? (
                            <td rowSpan={actions.length} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                              {resource.name}
                            </td>
                          ) : null}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {action.name}
                          </td>
                          {Object.values(ROLES).map(role => (
                            <td key={`${resource.id}-${action.id}-${role}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={permissionMatrix[role]?.[resource.id]?.includes(action.id) || false}
                                onChange={() => togglePermission(role, resource.id, action.id)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'abac' && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attribute-Based Access Control Rules</h2>
            <p className="mt-1 text-sm text-gray-500">
              Define contextual authorization rules based on user and resource attributes.
            </p>
            
            <div className="mt-6 grid grid-cols-1 gap-4">
              {abacRules.map(rule => (
                <div key={rule.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{rule.name}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">{rule.description}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900">{rule.role === 'all' ? 'All Roles' : rule.role}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Resource</dt>
                        <dd className="mt-1 text-sm text-gray-900">{rule.resource === 'all' ? 'All Resources' : rule.resource}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Action</dt>
                        <dd className="mt-1 text-sm text-gray-900">{rule.action === 'all' ? 'All Actions' : rule.action}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Condition</dt>
                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{rule.condition}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
              
              <div className="text-center py-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add New Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Authorization Audit Logs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review all permission checks and policy modifications.
            </p>
            
            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Timestamp
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
                              Result
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {auditLogs.map((log, index) => (
                            <tr key={index} className={log.allowed ? '' : 'bg-red-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {log.userId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.action}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.resource}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.allowed ? 'Allowed' : 'Denied'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Multi-Tenancy Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage hospital/clinic boundaries and cross-tenant access policies.
            </p>
            
            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <ul className="divide-y divide-gray-200">
                <li>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white font-semibold">HC</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">
                            Hospital Central
                          </div>
                          <div className="text-sm text-gray-500">
                            Tenant ID: hospital_central
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="mr-1">4 Departments</span> • <span className="mx-1">24 Users</span> • <span className="mx-1">143 Resources</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-semibold">EN</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600">
                            Eastside Neurology
                          </div>
                          <div className="text-sm text-gray-500">
                            Tenant ID: clinic_eastside
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="mr-1">2 Departments</span> • <span className="mx-1">8 Users</span> • <span className="mx-1">62 Resources</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li className="px-4 py-4 sm:px-6 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add New Tenant
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default Admin; 