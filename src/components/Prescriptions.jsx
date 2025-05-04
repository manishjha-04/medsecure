import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore, { ROLES } from '../store/authStore';
import usePatientStore from '../store/patientStore';
import PermissionGuard from './PermissionGuard';

// Sample prescription data with PDF URLs
const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'presc-001',
    patientId: 'pt-001',
    patientName: 'John Doe',
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2023-05-15',
    endDate: '2023-11-15',
    prescribedBy: 'Dr. John Smith',
    department: 'Cardiology',
    status: 'Active',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'presc-002',
    patientId: 'pt-002',
    patientName: 'Jane Smith',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-04-01',
    endDate: '2023-10-01',
    prescribedBy: 'Dr. John Smith',
    department: 'Endocrinology',
    status: 'Active',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'presc-003',
    patientId: 'pt-003',
    patientName: 'Robert Johnson',
    medication: 'Naproxen',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-03-01',
    endDate: '2023-06-01',
    prescribedBy: 'Dr. John Smith',
    department: 'Rheumatology',
    status: 'Expired',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'presc-004',
    patientId: 'pt-001',
    patientName: 'John Doe',
    medication: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    startDate: '2023-05-20',
    endDate: '2023-11-20',
    prescribedBy: 'Dr. John Smith',
    department: 'Cardiology',
    status: 'Active',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

const Prescriptions = () => {
  const { user } = useAuthStore();
  const { patients } = usePatientStore();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    // Simulate loading prescriptions
    setIsLoading(true);
    
    // Filter prescriptions based on user role
    let filteredPrescriptions = [...SAMPLE_PRESCRIPTIONS];
    
    // If user is a patient, show only their prescriptions
    if (user?.roles.includes(ROLES.PATIENT)) {
      filteredPrescriptions = filteredPrescriptions.filter(
        prescription => prescription.patientId === user.id
      );
    }
    
    setTimeout(() => {
      setPrescriptions(filteredPrescriptions);
      setIsLoading(false);
    }, 500);
  }, [user]);

  const viewPrescriptionPdf = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Prescriptions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view patient prescriptions
          </p>
        </div>
        <PermissionGuard
          action="create"
          resource="prescription"
        >
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Prescription
            </button>
          </div>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <li key={prescription.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {prescription.medication} {prescription.dosage}
                            </h3>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            For: {prescription.patientName} | Prescribed by: {prescription.prescribedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewPrescriptionPdf(prescription)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View PDF
                        </button>
                        <PermissionGuard
                          action="edit"
                          resource="prescription"
                        >
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                            Edit
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {prescription.startDate} to {prescription.endDate}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {prescription.frequency}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {prescription.department}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No prescriptions found.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Prescription for {selectedPrescription.patientName}
                    </h3>
                    <div className="mt-4 h-[70vh]">
                      <iframe
                        src={selectedPrescription.pdfUrl}
                        title="Prescription PDF"
                        className="w-full h-full border-2 border-gray-300 rounded"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closePdfModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => window.open(selectedPrescription.pdfUrl, '_blank')}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions; 