import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore, { ROLES } from '../store/authStore';
import usePatientStore from '../store/patientStore';
import PermissionGuard from './PermissionGuard';

// Sample lab result data
const SAMPLE_LAB_RESULTS = [
  {
    id: 'lab-001',
    patientId: 'pt-001',
    patientName: 'John Doe',
    testName: 'Complete Blood Count (CBC)',
    testDate: '2023-05-10',
    collectedBy: 'Lab Technician Alice',
    orderedBy: 'Dr. John Smith',
    department: 'Cardiology',
    status: 'Completed',
    results: [
      { name: 'White Blood Cell (WBC)', value: '7.5', unit: 'x10^9/L', reference: '4.0-11.0', flag: 'Normal' },
      { name: 'Red Blood Cell (RBC)', value: '5.1', unit: 'x10^12/L', reference: '4.5-6.0', flag: 'Normal' },
      { name: 'Hemoglobin (Hgb)', value: '14.2', unit: 'g/dL', reference: '13.5-17.5', flag: 'Normal' },
      { name: 'Hematocrit (Hct)', value: '42', unit: '%', reference: '41-50', flag: 'Normal' },
      { name: 'Platelet Count', value: '250', unit: 'x10^9/L', reference: '150-450', flag: 'Normal' }
    ]
  },
  {
    id: 'lab-002',
    patientId: 'pt-002',
    patientName: 'Jane Smith',
    testName: 'Comprehensive Metabolic Panel',
    testDate: '2023-04-25',
    collectedBy: 'Lab Technician Bob',
    orderedBy: 'Dr. John Smith',
    department: 'Endocrinology',
    status: 'Completed',
    results: [
      { name: 'Glucose', value: '142', unit: 'mg/dL', reference: '70-99', flag: 'High' },
      { name: 'Calcium', value: '9.5', unit: 'mg/dL', reference: '8.6-10.2', flag: 'Normal' },
      { name: 'Sodium', value: '140', unit: 'mmol/L', reference: '136-145', flag: 'Normal' },
      { name: 'Potassium', value: '4.0', unit: 'mmol/L', reference: '3.5-5.0', flag: 'Normal' },
      { name: 'CO2', value: '24', unit: 'mmol/L', reference: '23-29', flag: 'Normal' },
      { name: 'Chloride', value: '101', unit: 'mmol/L', reference: '98-107', flag: 'Normal' },
      { name: 'BUN', value: '15', unit: 'mg/dL', reference: '7-20', flag: 'Normal' },
      { name: 'Creatinine', value: '0.8', unit: 'mg/dL', reference: '0.6-1.2', flag: 'Normal' }
    ]
  },
  {
    id: 'lab-003',
    patientId: 'pt-003',
    patientName: 'Robert Johnson',
    testName: 'Lipid Panel',
    testDate: '2023-03-15',
    collectedBy: 'Lab Technician Charlie',
    orderedBy: 'Dr. John Smith',
    department: 'Rheumatology',
    status: 'Completed',
    results: [
      { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', reference: '<200', flag: 'High' },
      { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', reference: '>40', flag: 'Normal' },
      { name: 'LDL Cholesterol', value: '130', unit: 'mg/dL', reference: '<100', flag: 'High' },
      { name: 'Triglycerides', value: '175', unit: 'mg/dL', reference: '<150', flag: 'High' }
    ]
  },
  {
    id: 'lab-004',
    patientId: 'pt-001',
    patientName: 'John Doe',
    testName: 'Liver Function Tests',
    testDate: '2023-05-12',
    collectedBy: 'Lab Technician Alice',
    orderedBy: 'Dr. John Smith',
    department: 'Cardiology',
    status: 'Completed',
    results: [
      { name: 'ALT', value: '25', unit: 'U/L', reference: '7-56', flag: 'Normal' },
      { name: 'AST', value: '30', unit: 'U/L', reference: '8-48', flag: 'Normal' },
      { name: 'ALP', value: '72', unit: 'U/L', reference: '45-115', flag: 'Normal' },
      { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', reference: '0.1-1.2', flag: 'Normal' }
    ]
  }
];

const LabResults = () => {
  const { user } = useAuthStore();
  const [labResults, setLabResults] = useState([]);
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    // Simulate loading lab results
    setIsLoading(true);
    
    // Filter lab results based on user role
    let filteredResults = [...SAMPLE_LAB_RESULTS];
    
    // If user is a patient, show only their lab results
    if (user?.roles.includes(ROLES.PATIENT)) {
      filteredResults = filteredResults.filter(
        result => result.patientId === user.id
      );
    }
    
    // Sort by date (newest first)
    filteredResults.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
    
    setTimeout(() => {
      setLabResults(filteredResults);
      setIsLoading(false);
    }, 500);
  }, [user]);

  const viewLabResult = (labResult) => {
    setSelectedLabResult(labResult);
    setShowResultModal(true);
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setSelectedLabResult(null);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Laboratory Results</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage patient laboratory test results
          </p>
        </div>
        <PermissionGuard
          action="create"
          resource="lab_result"
        >
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Record New Result
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
            {labResults.length > 0 ? (
              labResults.map((labResult) => (
                <li key={labResult.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {labResult.testName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Patient: {labResult.patientName} | Date: {formatDate(labResult.testDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <button
                          onClick={() => viewLabResult(labResult)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Results
                        </button>
                        <PermissionGuard
                          action="edit"
                          resource="lab_result"
                        >
                          <button className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                            Edit
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Ordered by: {labResult.orderedBy}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {labResult.department}
                        </p>
                      </div>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {labResult.status}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No laboratory results found.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Lab Result Detail Modal */}
      {showResultModal && selectedLabResult && (
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {selectedLabResult.testName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Patient: {selectedLabResult.patientName} | Date: {formatDate(selectedLabResult.testDate)}
                        </p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {selectedLabResult.status}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Test
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Result
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Units
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Reference Range
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Flag
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedLabResult.results.map((result, index) => (
                                    <tr key={index} className={result.flag !== 'Normal' ? 'bg-red-50' : undefined}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {result.name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.value}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.unit}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.reference}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          result.flag === 'Normal' 
                                            ? 'bg-green-100 text-green-800' 
                                            : result.flag === 'High'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {result.flag}
                                        </span>
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
                    
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Ordered By</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedLabResult.orderedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Collected By</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedLabResult.collectedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedLabResult.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeResultModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabResults; 