import { create } from 'zustand';

// Sample patient data
const SAMPLE_PATIENTS = [
  {
    id: 'pt-001',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    diagnosis: 'Hypertension',
    assignedDoctor: 'doctor-smith',
    medicalRecords: [
      { id: 'mr-001', date: '2023-04-10', type: 'Lab Result', description: 'Blood pressure 140/90', createdBy: 'doctor-smith' },
      { id: 'mr-002', date: '2023-05-15', type: 'Prescription', description: 'Lisinopril 10mg daily', createdBy: 'doctor-smith' }
    ],
    tenant: 'hospital_central'
  },
  {
    id: 'pt-002',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    diagnosis: 'Diabetes Type 2',
    assignedDoctor: 'doctor-smith',
    medicalRecords: [
      { id: 'mr-003', date: '2023-03-22', type: 'Lab Result', description: 'HbA1c 7.2%', createdBy: 'doctor-smith' },
      { id: 'mr-004', date: '2023-04-01', type: 'Prescription', description: 'Metformin 500mg twice daily', createdBy: 'doctor-smith' }
    ],
    tenant: 'hospital_central'
  },
  {
    id: 'pt-003',
    name: 'Robert Johnson',
    age: 68,
    gender: 'Male',
    diagnosis: 'Arthritis',
    assignedDoctor: 'doctor-smith',
    medicalRecords: [
      { id: 'mr-005', date: '2023-02-15', type: 'X-Ray', description: 'Moderate joint degeneration in right knee', createdBy: 'doctor-smith' },
      { id: 'mr-006', date: '2023-03-01', type: 'Prescription', description: 'Naproxen 500mg twice daily', createdBy: 'doctor-smith' }
    ],
    tenant: 'hospital_central'
  }
];

// Create patient store
const usePatientStore = create((set, get) => ({
  patients: SAMPLE_PATIENTS,
  loading: false,
  error: null,
  
  // Get all patients
  getPatients: () => {
    return get().patients;
  },
  
  // Get patient by ID
  getPatientById: (id) => {
    return get().patients.find(patient => patient.id === id);
  },
  
  // Add a new medical record to a patient
  addMedicalRecord: (patientId, record) => {
    set(state => ({
      patients: state.patients.map(patient => {
        if (patient.id === patientId) {
          return {
            ...patient,
            medicalRecords: [
              ...patient.medicalRecords,
              {
                id: `mr-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                ...record
              }
            ]
          };
        }
        return patient;
      })
    }));
  },
  
  // Add a new patient
  addPatient: (patient) => {
    set(state => ({
      patients: [
        ...state.patients,
        {
          id: `pt-${Date.now()}`,
          medicalRecords: [],
          ...patient
        }
      ]
    }));
  },
  
  // Update patient information
  updatePatient: (id, updatedData) => {
    set(state => ({
      patients: state.patients.map(patient => {
        if (patient.id === id) {
          return { ...patient, ...updatedData };
        }
        return patient;
      })
    }));
  }
}));

export default usePatientStore; 