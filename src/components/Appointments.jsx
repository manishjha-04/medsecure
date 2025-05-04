import { useState, useEffect } from 'react';
import useAuthStore, { ROLES } from '../store/authStore';
import PermissionGuard from './PermissionGuard';

// Sample appointment data
const SAMPLE_APPOINTMENTS = [
  {
    id: 'appt-001',
    patientId: 'pt-001',
    patientName: 'John Doe',
    doctorId: 'doctor-smith',
    doctorName: 'Dr. John Smith',
    department: 'Cardiology',
    date: '2023-06-15',
    time: '09:00 AM',
    duration: 30,
    status: 'Scheduled',
    reason: 'Follow-up on hypertension medication',
    notes: 'Patient reports feeling better with new medication regimen.'
  },
  {
    id: 'appt-002',
    patientId: 'pt-002',
    patientName: 'Jane Smith',
    doctorId: 'doctor-smith',
    doctorName: 'Dr. John Smith',
    department: 'Endocrinology',
    date: '2023-06-16',
    time: '10:30 AM',
    duration: 45,
    status: 'Scheduled',
    reason: 'Diabetes management review',
    notes: 'Check HbA1c levels.'
  },
  {
    id: 'appt-003',
    patientId: 'pt-003',
    patientName: 'Robert Johnson',
    doctorId: 'doctor-smith',
    doctorName: 'Dr. John Smith',
    department: 'Rheumatology',
    date: '2023-06-14',
    time: '02:15 PM',
    duration: 60,
    status: 'Completed',
    reason: 'Joint pain assessment',
    notes: 'Patient reports moderate improvement with current therapy.'
  },
  {
    id: 'appt-004',
    patientId: 'pt-001',
    patientName: 'John Doe',
    doctorId: 'doctor-smith',
    doctorName: 'Dr. John Smith',
    department: 'Cardiology',
    date: '2023-06-22',
    time: '11:00 AM',
    duration: 30,
    status: 'Scheduled',
    reason: 'Medication adjustment',
    notes: ''
  }
];

const Appointments = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Generate calendar dates
  const generateCalendarDays = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(1); // Start from the first day of the month
    
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = currentDate.getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create calendar day objects
    const days = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if there are appointments on this day
      const dayAppointments = appointments.filter(a => a.date === dateString);
      
      days.push({
        day,
        date: dateString,
        appointments: dayAppointments,
        isToday: dateString === new Date().toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  useEffect(() => {
    // Simulate loading appointments
    setIsLoading(true);
    
    // Filter appointments based on user role
    let filteredAppointments = [...SAMPLE_APPOINTMENTS];
    
    // If user is a patient, show only their appointments
    if (user?.roles.includes(ROLES.PATIENT)) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.patientId === user.id
      );
    }
    
    // If user is a doctor, show only their appointments
    if (user?.roles.includes(ROLES.DOCTOR)) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.doctorId === user.id
      );
    }
    
    // Sort appointments by date and time
    filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    setTimeout(() => {
      setAppointments(filteredAppointments);
      setIsLoading(false);
    }, 500);
  }, [user]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const calendarDays = generateCalendarDays();
  const currentMonthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Schedule and manage patient appointments
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-l-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                viewMode === 'calendar' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              Calendar View
            </button>
          </div>
          <PermissionGuard
            action="create"
            resource="appointment"
          >
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              New Appointment
            </button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <li key={appointment.id} onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
                          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                          appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        } flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {appointment.patientName} - {appointment.reason}
                            </h3>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                              appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time} ({appointment.duration} mins) with {appointment.doctorName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Department: {appointment.department}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No appointments found.
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{currentMonthName}</h3>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="ml-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              <div className="text-sm font-medium text-gray-500">Sun</div>
              <div className="text-sm font-medium text-gray-500">Mon</div>
              <div className="text-sm font-medium text-gray-500">Tue</div>
              <div className="text-sm font-medium text-gray-500">Wed</div>
              <div className="text-sm font-medium text-gray-500">Thu</div>
              <div className="text-sm font-medium text-gray-500">Fri</div>
              <div className="text-sm font-medium text-gray-500">Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`min-h-[100px] border rounded-md p-2 ${
                    !day.day 
                      ? 'bg-gray-50 border-gray-200' 
                      : day.isToday 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  {day.day && (
                    <>
                      <div className="text-right text-sm font-medium mb-1">
                        {day.day}
                      </div>
                      <div className="space-y-1">
                        {day.appointments?.map(appointment => (
                          <div 
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment)}
                            className={`p-1 text-xs rounded truncate cursor-pointer ${
                              appointment.status === 'Scheduled' 
                                ? 'bg-blue-100 text-blue-800' 
                                : appointment.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {appointment.time} - {appointment.patientName.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Appointment Details
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Patient</h4>
                        <p className="text-base">{selectedAppointment.patientName}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                        <p className="text-base">{selectedAppointment.doctorName}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                        <p className="text-base">{selectedAppointment.department}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                        <p className="text-base">{selectedAppointment.date} at {selectedAppointment.time} ({selectedAppointment.duration} minutes)</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                        <p className="text-base">{selectedAppointment.reason}</p>
                      </div>
                      {selectedAppointment.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                          <p className="text-base">{selectedAppointment.notes}</p>
                        </div>
                      )}
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <p className={`inline-flex px-2 py-1 text-sm rounded-full ${
                          selectedAppointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                          selectedAppointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedAppointment.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeAppointmentModal}
                >
                  Close
                </button>
                <PermissionGuard
                  action="edit"
                  resource="appointment"
                >
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Edit
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 