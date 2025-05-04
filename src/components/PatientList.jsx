import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePatientStore from '../store/patientStore';
import useAuthStore from '../store/authStore';
import PermissionGuard from './PermissionGuard';
import { ROLES } from '../store/authStore';

const PatientList = () => {
  const { patients } = usePatientStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Filter patients based on user roles and permissions
  useEffect(() => {
    if (!user) {
      setFilteredPatients([]);
      return;
    }

    let accessiblePatients = [...patients];
    
    // If user is a patient, they should only see their own record
    if (user.roles.includes(ROLES.PATIENT)) {
      accessiblePatients = patients.filter(patient => patient.id === user.id);
    }
    
    // Apply search filter
    if (searchTerm) {
      accessiblePatients = accessiblePatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPatients(accessiblePatients);
  }, [patients, user, searchTerm]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Patients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all patients in your hospital system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <PermissionGuard
            action="create"
            resource="patient"
            fallback={null}
          >
            <Link
              to="/patients/new"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add patient
            </Link>
          </PermissionGuard>
        </div>
      </div>
      
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search patients..."
          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Age
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Gender
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Diagnosis
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {patient.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{patient.age}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{patient.gender}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{patient.diagnosis}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <PermissionGuard
                            action="view"
                            resource="patient"
                            resourceInstance={{ id: patient.id }}
                            fallback={null}
                          >
                            <Link to={`/patients/${patient.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </Link>
                          </PermissionGuard>
                          
                          <PermissionGuard
                            action="edit"
                            resource="patient"
                            resourceInstance={{ id: patient.id }}
                            fallback={null}
                          >
                            <Link to={`/patients/${patient.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </Link>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-sm text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList; 