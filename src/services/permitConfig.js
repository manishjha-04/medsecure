/**
 * Permit.io Configuration Utility
 * 
 * This module handles initialization and configuration of the Permit.io
 * service, ensuring proper setup for hospital management RBAC and ABAC.
 */

import axios from 'axios';

// API configuration
const API_KEY = import.meta.env.VITE_PERMIT_API_KEY || 'default_key'; 
const API_URL = import.meta.env.VITE_PERMIT_API_URL || 'https://api.permit.io/v2';
const PROJECT = 'medsecure';
const ENVIRONMENT = 'dev';

// Create axios instance for Permit.io API - This should ideally be proxied through your backend
// For development, we'll use a local proxy or the direct API
const PROXY_ENABLED = import.meta.env.VITE_USE_PROXY === 'true';
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api/permit';

// Create axios instance with proper configuration
export const permitApi = axios.create({
  baseURL: PROXY_ENABLED ? PROXY_URL : API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  withCredentials: false // Important for CORS
});

/**
 * Initialize Permit.io resources and policies
 * This should be called once when the application starts
 */
export const initializePermitResources = async () => {
  try {
    // Create the project if it doesn't exist
    try {
      await permitApi.get(`/${PROJECT}`);
      console.log(`Project ${PROJECT} already exists`);
    } catch (error) {
      await permitApi.post('/projects', {
        key: PROJECT,
        name: 'MedSecure Healthcare System',
        description: 'Hospital management system with strong authorization controls'
      });
      console.log(`Project ${PROJECT} created`);
    }
    
    // Create the environment if it doesn't exist
    try {
      await permitApi.get(`/${PROJECT}/env/${ENVIRONMENT}`);
      console.log(`Environment ${ENVIRONMENT} already exists`);
    } catch (error) {
      await permitApi.post(`/${PROJECT}/environments`, {
        key: ENVIRONMENT,
        name: 'Development',
        description: 'Development environment'
      });
      console.log(`Environment ${ENVIRONMENT} created`);
    }

    // Define resources
    const resources = [
      { key: 'patient', name: 'Patient', description: 'Patient records', actions: ['view', 'create', 'edit', 'delete'] },
      { key: 'medical_record', name: 'Medical Record', description: 'Medical records', actions: ['view', 'create', 'edit', 'delete'] },
      { key: 'prescription', name: 'Prescription', description: 'Prescription data', actions: ['view', 'create', 'edit', 'delete', 'approve', 'administer'] },
      { key: 'billing', name: 'Billing', description: 'Billing information', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { key: 'system', name: 'System', description: 'System settings', actions: ['view', 'manage', 'administer'] },
      { key: 'lab_result', name: 'Lab Result', description: 'Laboratory test results', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { key: 'appointment', name: 'Appointment', description: 'Patient appointments', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { key: 'schedule', name: 'Schedule', description: 'Staff schedules', actions: ['view', 'create', 'edit', 'delete', 'approve'] }
    ];

    // Define roles
    const roles = [
      { key: 'admin', name: 'Administrator', description: 'Full system access' },
      { key: 'doctor', name: 'Doctor', description: 'Medical staff with treatment privileges' },
      { key: 'nurse', name: 'Nurse', description: 'Medical staff with care privileges' },
      { key: 'patient', name: 'Patient', description: 'Patient access to own records' },
      { key: 'lab_technician', name: 'Lab Technician', description: 'Laboratory staff' },
      { key: 'receptionist', name: 'Receptionist', description: 'Front desk staff' },
      { key: 'billing_staff', name: 'Billing Staff', description: 'Finance department staff' }
    ];

    // Create resources
    for (const resource of resources) {
      const { key, name, description, actions } = resource;
      try {
        await permitApi.get(`/${PROJECT}/env/${ENVIRONMENT}/resources/${key}`);
        console.log(`Resource ${key} already exists`);
      } catch (error) {
        // Resource doesn't exist, create it
        await permitApi.post(`/${PROJECT}/env/${ENVIRONMENT}/resources`, {
          key,
          name,
          description,
          actions: actions.map(action => ({
            key: action,
            name: action.charAt(0).toUpperCase() + action.slice(1),
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${name}`
          }))
        });
        console.log(`Resource ${key} created with actions: ${actions.join(', ')}`);
      }
    }

    // Create roles
    for (const role of roles) {
      try {
        await permitApi.get(`/${PROJECT}/env/${ENVIRONMENT}/roles/${role.key}`);
        console.log(`Role ${role.key} already exists`);
      } catch (error) {
        // Role doesn't exist, create it
        await permitApi.post(`/${PROJECT}/env/${ENVIRONMENT}/roles`, {
          key: role.key,
          name: role.name,
          description: role.description
        });
        console.log(`Role ${role.key} created`);
      }
    }

    // Define RBAC permissions
    const rolePermissions = [
      // Admin permissions - full access to all resources
      ...resources.map(resource => ({
        role: 'admin',
        resource: resource.key,
        actions: resource.actions
      })),
      
      // Doctor permissions
      { role: 'doctor', resource: 'patient', actions: ['view', 'create', 'edit'] },
      { role: 'doctor', resource: 'medical_record', actions: ['view', 'create', 'edit'] },
      { role: 'doctor', resource: 'prescription', actions: ['view', 'create', 'approve'] },
      { role: 'doctor', resource: 'billing', actions: ['view'] },
      { role: 'doctor', resource: 'lab_result', actions: ['view', 'create', 'approve'] },
      { role: 'doctor', resource: 'appointment', actions: ['view', 'create', 'edit', 'approve'] },
      { role: 'doctor', resource: 'schedule', actions: ['view'] },
      
      // Nurse permissions
      { role: 'nurse', resource: 'patient', actions: ['view'] },
      { role: 'nurse', resource: 'medical_record', actions: ['view', 'create'] },
      { role: 'nurse', resource: 'prescription', actions: ['view', 'administer'] },
      { role: 'nurse', resource: 'lab_result', actions: ['view'] },
      { role: 'nurse', resource: 'appointment', actions: ['view', 'create'] },
      { role: 'nurse', resource: 'schedule', actions: ['view'] },
      
      // Patient permissions (basic - will be extended with ABAC rules)
      { role: 'patient', resource: 'patient', actions: ['view'] },
      { role: 'patient', resource: 'medical_record', actions: ['view'] },
      { role: 'patient', resource: 'prescription', actions: ['view'] },
      { role: 'patient', resource: 'billing', actions: ['view'] },
      { role: 'patient', resource: 'appointment', actions: ['view', 'create'] },
      
      // Lab technician permissions
      { role: 'lab_technician', resource: 'patient', actions: ['view'] },
      { role: 'lab_technician', resource: 'medical_record', actions: ['view'] },
      { role: 'lab_technician', resource: 'lab_result', actions: ['view', 'create', 'edit'] },
      
      // Receptionist permissions
      { role: 'receptionist', resource: 'patient', actions: ['view', 'create'] },
      { role: 'receptionist', resource: 'appointment', actions: ['view', 'create', 'edit'] },
      { role: 'receptionist', resource: 'schedule', actions: ['view'] },
      
      // Billing staff permissions
      { role: 'billing_staff', resource: 'patient', actions: ['view'] },
      { role: 'billing_staff', resource: 'billing', actions: ['view', 'create', 'edit', 'approve'] }
    ];

    // Create role permissions
    for (const permission of rolePermissions) {
      for (const action of permission.actions) {
        try {
          await permitApi.post(`/${PROJECT}/env/${ENVIRONMENT}/role_assignments`, {
            role: permission.role,
            resource: permission.resource,
            action: action
          });
          console.log(`Assigned permission ${action} on ${permission.resource} to role ${permission.role}`);
        } catch (error) {
          // Permission might already exist, that's okay
          console.log(`Permission assignment for ${permission.role} - ${action} on ${permission.resource} already exists or failed`);
        }
      }
    }

    // Create policy rules for ABAC
    const policyRules = [
      // Patients can only view their own records
      {
        key: 'patient_own_data',
        description: 'Patients can only view their own data',
        rules: [
          {
            user_set: { role: 'patient' },
            permission_set: { resource: 'patient', action: 'view' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'id' },
                right: { resource: 'id' }
              }
            }
          }
        ]
      },
      // Patients can only view their own medical records
      {
        key: 'patient_own_medical_records',
        description: 'Patients can only view their own medical records',
        rules: [
          {
            user_set: { role: 'patient' },
            permission_set: { resource: 'medical_record', action: 'view' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'id' },
                right: { resource: 'patientId' }
              }
            }
          }
        ]
      },
      // Patients can only view their own prescriptions
      {
        key: 'patient_own_prescriptions',
        description: 'Patients can only view their own prescriptions',
        rules: [
          {
            user_set: { role: 'patient' },
            permission_set: { resource: 'prescription', action: 'view' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'id' },
                right: { resource: 'patientId' }
              }
            }
          }
        ]
      },
      // Patients can only view their own billing
      {
        key: 'patient_own_billing',
        description: 'Patients can only view their own billing',
        rules: [
          {
            user_set: { role: 'patient' },
            permission_set: { resource: 'billing', action: 'view' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'id' },
                right: { resource: 'patientId' }
              }
            }
          }
        ]
      },
      // Emergency nurses can edit patient data
      {
        key: 'emergency_nurse_edit',
        description: 'Emergency nurses can edit patient data',
        rules: [
          {
            user_set: { role: 'nurse' },
            permission_set: { resource: 'patient', action: 'edit' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'department' },
                right: 'Emergency'
              }
            }
          }
        ]
      },
      // Doctors can approve prescriptions in their specialty
      {
        key: 'doctor_specialty_prescriptions',
        description: 'Doctors can approve prescriptions in their specialty',
        rules: [
          {
            user_set: { role: 'doctor' },
            permission_set: { resource: 'prescription', action: 'approve' },
            condition: { 
              context: { 
                type: 'equals',
                left: { user: 'department' },
                right: { resource: 'department' }
              }
            }
          }
        ]
      }
    ];

    // Create the policy rules
    for (const rule of policyRules) {
      try {
        await permitApi.post(`/${PROJECT}/env/${ENVIRONMENT}/policy_rules`, rule);
        console.log(`Created policy rule: ${rule.key}`);
      } catch (error) {
        console.log(`Policy rule ${rule.key} already exists or failed to create`);
      }
    }

    console.log('Permit.io resources and policies initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Permit.io resources:', error);
    return false;
  }
};

// Export configuration
export default {
  API_KEY,
  API_URL,
  PROJECT,
  ENVIRONMENT,
  permitApi,
  initializePermitResources
}; 