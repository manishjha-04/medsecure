import { useState, useEffect } from 'react';
import useAuthStore, { ROLES } from '../store/authStore';
import PermissionGuard from './PermissionGuard';

// Sample invoice data
const SAMPLE_INVOICES = [
  {
    id: 'inv-001',
    patientId: 'pt-001',
    patientName: 'John Doe',
    invoiceNumber: 'INV-2023-001',
    date: '2023-05-15',
    dueDate: '2023-06-15',
    department: 'Cardiology',
    amount: 450.00,
    status: 'Unpaid',
    items: [
      { description: 'Initial Consultation', amount: 150.00 },
      { description: 'Blood Pressure Test', amount: 50.00 },
      { description: 'ECG', amount: 200.00 },
      { description: 'Administration Fee', amount: 50.00 }
    ],
    insurance: {
      provider: 'BlueCross BlueShield',
      policyNumber: 'BC123456789',
      coveragePercentage: 80
    },
    notes: 'Please pay within 30 days of receipt.'
  },
  {
    id: 'inv-002',
    patientId: 'pt-002',
    patientName: 'Jane Smith',
    invoiceNumber: 'INV-2023-002',
    date: '2023-04-20',
    dueDate: '2023-05-20',
    department: 'Endocrinology',
    amount: 625.00,
    status: 'Paid',
    paidDate: '2023-05-10',
    transactionId: 'TRX-12345',
    items: [
      { description: 'Follow-up Consultation', amount: 100.00 },
      { description: 'Comprehensive Blood Panel', amount: 350.00 },
      { description: 'HbA1c Test', amount: 125.00 },
      { description: 'Administration Fee', amount: 50.00 }
    ],
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AE987654321',
      coveragePercentage: 70
    },
    notes: ''
  },
  {
    id: 'inv-003',
    patientId: 'pt-003',
    patientName: 'Robert Johnson',
    invoiceNumber: 'INV-2023-003',
    date: '2023-03-05',
    dueDate: '2023-04-05',
    department: 'Rheumatology',
    amount: 850.00,
    status: 'Overdue',
    items: [
      { description: 'Specialist Consultation', amount: 200.00 },
      { description: 'X-Ray', amount: 300.00 },
      { description: 'Joint Fluid Analysis', amount: 250.00 },
      { description: 'Physical Therapy Assessment', amount: 100.00 }
    ],
    insurance: {
      provider: 'UnitedHealthcare',
      policyNumber: 'UH543219876',
      coveragePercentage: 75
    },
    notes: 'This invoice is past due. Please contact our billing department.'
  },
  {
    id: 'inv-004',
    patientId: 'pt-001',
    patientName: 'John Doe',
    invoiceNumber: 'INV-2023-004',
    date: '2023-05-25',
    dueDate: '2023-06-25',
    department: 'Pharmacy',
    amount: 175.50,
    status: 'Unpaid',
    items: [
      { description: 'Lisinopril (30 tablets)', amount: 45.50 },
      { description: 'Atorvastatin (30 tablets)', amount: 85.00 },
      { description: 'Dispensing Fee', amount: 45.00 }
    ],
    insurance: {
      provider: 'BlueCross BlueShield',
      policyNumber: 'BC123456789',
      coveragePercentage: 80
    },
    notes: 'Prescription medications for hypertension and cholesterol.'
  }
];

const Billing = () => {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // Simulate loading invoices
    setIsLoading(true);
    
    // Filter invoices based on user role
    let filteredInvoices = [...SAMPLE_INVOICES];
    
    // If user is a patient, show only their invoices
    if (user?.roles.includes(ROLES.PATIENT)) {
      filteredInvoices = filteredInvoices.filter(
        invoice => invoice.patientId === user.id
      );
    }
    
    // Sort by date (newest first)
    filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setTimeout(() => {
      setInvoices(filteredInvoices);
      setIsLoading(false);
    }, 500);
  }, [user]);

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const handlePayment = () => {
    if (!selectedInvoice) return;
    
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      
      // Create updated invoice with payment details
      const updatedInvoice = {
        ...selectedInvoice,
        status: 'Paid',
        paidDate: new Date().toISOString().split('T')[0],
        transactionId: `TRX-${Math.floor(Math.random() * 100000)}`
      };
      
      // Update invoices list
      setInvoices(invoices.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      ));
      
      // Close modal
      closeInvoiceModal();
      
      // Show payment confirmation (in a real app, this would be a toast notification)
      alert(`Payment of $${selectedInvoice.amount.toFixed(2)} processed successfully.`);
    }, 2000);
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate patient responsibility
  const calculatePatientResponsibility = (invoice) => {
    if (!invoice.insurance) return invoice.amount;
    
    const coverage = invoice.amount * (invoice.insurance.coveragePercentage / 100);
    return invoice.amount - coverage;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Billing & Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and process patient invoices and payments
          </p>
        </div>
        <PermissionGuard
          action="create"
          resource="billing"
        >
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Invoice
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
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <li key={invoice.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6 cursor-pointer" onClick={() => viewInvoice(invoice)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          invoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        } flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Invoice #{invoice.invoiceNumber}
                            </h3>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                              invoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Patient: {invoice.patientName} | Department: {invoice.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-gray-900">
                            Amount: {formatCurrency(invoice.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No invoices found.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
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
                          Invoice #{selectedInvoice.invoiceNumber}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Issued: {formatDate(selectedInvoice.date)} | Due: {formatDate(selectedInvoice.dueDate)}
                        </p>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        selectedInvoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Patient</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.patientName}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Department</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.department}</dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500">Items</h4>
                      <div className="mt-2 flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden sm:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedInvoice.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.description}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {formatCurrency(item.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  <tr className="bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      Subtotal
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                      {formatCurrency(selectedInvoice.amount)}
                                    </td>
                                  </tr>
                                  
                                  {selectedInvoice.insurance && (
                                    <>
                                      <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          Insurance Coverage ({selectedInvoice.insurance.coveragePercentage}%)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                          -{formatCurrency(selectedInvoice.amount * (selectedInvoice.insurance.coveragePercentage / 100))}
                                        </td>
                                      </tr>
                                      <tr className="bg-gray-50 font-bold">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          Patient Responsibility
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                          {formatCurrency(calculatePatientResponsibility(selectedInvoice))}
                                        </td>
                                      </tr>
                                    </>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500">Insurance Information</h4>
                      <div className="mt-2 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                        {selectedInvoice.insurance ? (
                          <>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Provider</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.insurance.provider}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.insurance.policyNumber}</dd>
                            </div>
                          </>
                        ) : (
                          <div className="sm:col-span-2">
                            <p className="text-sm text-gray-500">No insurance information available.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedInvoice.status === 'Paid' && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Payment Received</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Payment was received on {formatDate(selectedInvoice.paidDate)}.</p>
                              <p className="mt-1">Transaction ID: {selectedInvoice.transactionId}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedInvoice.notes && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                        <p className="mt-2 text-sm text-gray-600">{selectedInvoice.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeInvoiceModal}
                >
                  Close
                </button>
                
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                      paymentProcessing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay ${formatCurrency(calculatePatientResponsibility(selectedInvoice))}`
                    )}
                  </button>
                )}
                
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

export default Billing; 