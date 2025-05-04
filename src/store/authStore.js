import { create } from 'zustand';
import { syncUser } from '../services/permitService';

// Define user roles in the healthcare system
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PATIENT: 'patient',
  LAB_TECHNICIAN: 'lab_technician',
  RECEPTIONIST: 'receptionist'
};

// Sample users with different roles for testing
const SAMPLE_USERS = [
  {
    id: 'admin-user',
    email: 'admin@healthapp.com',
    password: '2025DEVChallenge', // In a real app, passwords would be hashed
    firstName: 'Admin',
    lastName: 'User',
    roles: [ROLES.ADMIN],
    department: 'Administration',
    tenant: 'hospital_central'
  },
  {
    id: 'doctor-smith',
    email: 'dr.smith@healthapp.com',
    password: 'doctor123',
    firstName: 'John',
    lastName: 'Smith',
    roles: [ROLES.DOCTOR],
    department: 'Cardiology',
    tenant: 'hospital_central'
  },
  {
    id: 'nurse-johnson',
    email: 'nurse.johnson@healthapp.com',
    password: 'nurse123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    roles: [ROLES.NURSE],
    department: 'Pediatrics',
    tenant: 'hospital_central'
  },
  {
    id: 'pt-001',
    email: 'patient.doe@example.com',
    password: 'patient123',
    firstName: 'John',
    lastName: 'Doe',
    roles: [ROLES.PATIENT],
    department: null,
    tenant: 'hospital_central'
  }
];

// Create auth store
const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  // Initialize on app start
  init: async () => {
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      set({ user });
      await syncUser(user);
    }
  },
  
  // Login function
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      const user = SAMPLE_USERS.find(u => 
        u.email === email && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Sync user with Permit.io
      await syncUser(user);
      
      // Save user to local storage and state
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Logout function
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));

export default useAuthStore; 