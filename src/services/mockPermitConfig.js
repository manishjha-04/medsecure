/**
 * Mock Permit.io Configuration Utility
 * 
 * This module provides a mock implementation for Permit.io configuration
 * to enable local development without requiring API calls to Permit.io.
 */

// API configuration
const API_KEY = 'mock_api_key';
const API_URL = 'mock://permit.io/v2';
const PROJECT = 'medsecure';
const ENVIRONMENT = 'dev';

/**
 * Initialize mock Permit.io resources and policies
 * This mock function always succeeds
 */
export const initializePermitResources = async () => {
  try {
    console.log('Initializing mock Permit.io resources and policies...');

    // Mock data initialization would happen here
    // In a real implementation, this would create resources, roles, and permissions

    console.log('Mock Permit.io resources and policies initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize mock Permit.io resources:', error);
    return false;
  }
};

// Export configuration
export default {
  API_KEY,
  API_URL,
  PROJECT,
  ENVIRONMENT,
  initializePermitResources
}; 