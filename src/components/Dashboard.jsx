import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore, { ROLES } from '../store/authStore';
import usePatientStore from '../store/patientStore';
import PermissionGuard from './PermissionGuard';
import { checkResourcePermission } from '../services/permitService';
import PermitAuditLog from './PermitAuditLog';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { patients } = usePatientStore();
  const [authorizedRecords, setAuthorizedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Count total records
  const totalRecords = patients.reduce(
    (acc, patient) => acc + patient.medicalRecords.length,
    0
  );

  // Filter records based on permissions
  useEffect(() => {
    const loadAuthorizedRecords = async () => {
      if (!user) {
        setAuthorizedRecords([]);
        setIsLoading(false);
        return;
      }

      // Get all records with patient information
      const allRecordsWithPatientInfo = patients.flatMap(patient => 
        patient.medicalRecords.map(record => ({
          ...record,
          patientName: patient.name,
          patientId: patient.id
        }))
      ).sort((a, b) => new Date(b.date) - new Date(a.date));

      // If user is an admin or doctor, show all records
      if (user.roles.includes(ROLES.ADMIN) || user.roles.includes(ROLES.DOCTOR)) {
        setAuthorizedRecords(allRecordsWithPatientInfo.slice(0, 5));
        setIsLoading(false);
        return;
      }

      // For patients, only show their own records
      if (user.roles.includes(ROLES.PATIENT)) {
        const patientRecords = allRecordsWithPatientInfo.filter(
          record => record.patientId === user.id
        );
        setAuthorizedRecords(patientRecords.slice(0, 5));
        setIsLoading(false);
        return;
      }

      // For other roles, check each record individually
      const checkedRecords = [];
      
      for (const record of allRecordsWithPatientInfo.slice(0, 10)) {
        const hasPermission = await checkResourcePermission(
          user,
          'view',
          { 
            type: 'medical_record',
            patientId: record.patientId
          },
          user.tenant
        );
        
        if (hasPermission) {
          checkedRecords.push(record);
          if (checkedRecords.length >= 5) break;
        }
      }
      
      setAuthorizedRecords(checkedRecords);
      setIsLoading(false);
    };

    loadAuthorizedRecords();
  }, [user, patients]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="mt-4">
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome, {user?.firstName}!</h2>
            <p className="text-gray-600">
              You are logged in as <span className="capitalize font-semibold">{user?.roles[0]}</span>
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Statistics Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{patients.length}</dd>
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <PermissionGuard
                  action="view"
                  resource="patient"
                  resourceInstance={user.roles.includes(ROLES.PATIENT) ? { id: user.id } : null}
                  fallback={<div className="text-xs text-gray-500">No access to patient list</div>}
                >
                  <Link to="/patients" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all patients <span aria-hidden="true">&rarr;</span>
                  </Link>
                </PermissionGuard>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Medical Records</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalRecords}</dd>
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <PermissionGuard
                  action="view"
                  resource="medical_record"
                  resourceInstance={user.roles.includes(ROLES.PATIENT) ? { patientId: user.id } : null}
                  fallback={<div className="text-xs text-gray-500">No access to medical records</div>}
                >
                  <Link to="/records" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all records <span aria-hidden="true">&rarr;</span>
                  </Link>
                </PermissionGuard>
              </div>
            </div>

            <PermissionGuard
              action="manage"
              resource="system"
              fallback={null}
            >
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">System Administration</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">Admin</dd>
                  </dl>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <Link to="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Go to admin panel <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </PermissionGuard>
          </div>
          
          <div className="mt-8">
            <PermissionGuard
              action="view"
              resource="medical_record"
              resourceInstance={user.roles.includes(ROLES.PATIENT) ? { patientId: user.id } : null}
              fallback={null}
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Medical Records</h3>
                </div>
                
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin mr-3 h-5 w-5 text-indigo-500" 
                           viewBox="0 0 24 24">
                        <div className="h-5 w-5 border-2 rounded-full border-opacity-75 border-b-transparent border-indigo-600"></div>
                      </div>
                      <span>Loading records...</span>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {authorizedRecords.length > 0 ? (
                      authorizedRecords.map(record => (
                        <li key={record.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {record.type} for {record.patientName}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {record.date}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {record.description}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <PermissionGuard
                                action="view"
                                resource="patient"
                                resourceInstance={{ id: record.patientId }}
                                fallback={null}
                              >
                                <Link 
                                  to={`/patients/${record.patientId}`} 
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View patient
                                </Link>
                              </PermissionGuard>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                        No records available
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PermissionGuard
          action="administer"
          resource="system"
        >
          <PermitAuditLog />
        </PermissionGuard>
      </div>
    </div>
  );
};

export default Dashboard; 