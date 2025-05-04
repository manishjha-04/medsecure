import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import usePatientStore from '../store/patientStore';
import useAuthStore from '../store/authStore';
import PermissionGuard from './PermissionGuard';
import { ROLES } from '../store/authStore';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPatientById, addMedicalRecord } = usePatientStore();
  const { user } = useAuthStore();
  
  const patient = getPatientById(id);
  
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: '',
    description: '',
  });
  
  // Check if the current user has access to this patient's data
  useEffect(() => {
    // If no user or no patient, do nothing
    if (!user || !patient) return;
    
    // Patients should only access their own records
    if (user.roles.includes(ROLES.PATIENT) && user.id !== patient.id) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, patient, navigate]);
  
  if (!patient) {
    return <div className="text-center py-10">Patient not found</div>;
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newRecord.type || !newRecord.description) {
      return;
    }
    
    addMedicalRecord(patient.id, {
      ...newRecord,
      createdBy: user.id,
    });
    
    setNewRecord({
      type: '',
      description: '',
    });
    
    setShowAddRecordForm(false);
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and medical records</p>
        </div>
        <div>
          <PermissionGuard
            action="edit"
            resource="patient"
            resourceInstance={{ id: patient.id }}
            fallback={null}
          >
            <Link
              to={`/patients/${patient.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
            >
              Edit Patient
            </Link>
          </PermissionGuard>
          <Link
            to="/patients"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Patients
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.name}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Age</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.age}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.gender}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.diagnosis}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Medical Records</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <PermissionGuard
                action="create"
                resource="medical_record"
                resourceInstance={{ patientId: patient.id }}
                fallback={null}
              >
                {!showAddRecordForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddRecordForm(true)}
                    className="mb-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Medical Record
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="mb-4 bg-white p-4 rounded shadow">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Record Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={newRecord.type}
                          onChange={handleInputChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="Lab Result">Lab Result</option>
                          <option value="Prescription">Prescription</option>
                          <option value="X-Ray">X-Ray</option>
                          <option value="MRI">MRI</option>
                          <option value="Notes">Notes</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={newRecord.description}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddRecordForm(false)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </PermissionGuard>
              
              <PermissionGuard
                action="view"
                resource="medical_record"
                resourceInstance={{ patientId: patient.id }}
                fallback={<div className="text-sm text-gray-500">You don't have permission to view medical records.</div>}
              >
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {patient.medicalRecords.length > 0 ? (
                    patient.medicalRecords.map((record) => (
                      <li key={record.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            <span className="font-medium">{record.type}</span> - {record.date}
                            <p className="text-gray-500 mt-1">{record.description}</p>
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="pl-3 pr-4 py-3 text-sm text-gray-500">No medical records available</li>
                  )}
                </ul>
              </PermissionGuard>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PatientDetail; 