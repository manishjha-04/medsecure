/**
 * MedSecure Permit.io Service with Fallback
 * 
 * This service attempts to use the real Permit.io service first,
 * but falls back to a mock implementation if the real service fails.
 */

// Import both real and mock implementations
import * as realPermit from './permit';
import * as mockPermit from './mockPermit';
import { initializePermitResources as realInitializeResources } from './permitConfig';
import { initializePermitResources as mockInitializeResources } from './mockPermitConfig';

// Service state
let useMock = false;
let initializationComplete = false;

/**
 * Initialize Permit.io resources
 * First attempts to use real Permit.io, falls back to mock if that fails
 */
export const initializePermitResources = async () => {
  if (initializationComplete) {
    return true;
  }

  try {
    console.log('Attempting to initialize real Permit.io resources...');
    const success = await realInitializeResources();
    
    if (success) {
      console.log('Successfully initialized real Permit.io resources');
      useMock = false;
      initializationComplete = true;
      return true;
    } else {
      throw new Error('Real Permit.io initialization returned false');
    }
  } catch (error) {
    console.warn('Failed to initialize real Permit.io, falling back to mock:', error);
    
    try {
      console.log('Initializing mock Permit.io resources...');
      const success = await mockInitializeResources();
      useMock = true;
      initializationComplete = true;
      console.log('Successfully initialized mock Permit.io resources');
      return success;
    } catch (mockError) {
      console.error('Failed to initialize mock Permit.io:', mockError);
      return false;
    }
  }
};

/**
 * Wait for Permit.io to be ready
 * First attempts to use real Permit.io, falls back to mock if that fails
 */
export const waitForPermitReady = async () => {
  try {
    if (useMock) {
      return await mockPermit.waitForPermitReady();
    }
    
    console.log('Checking real Permit.io API availability...');
    const ready = await realPermit.waitForPermitReady();
    
    if (ready) {
      console.log('Real Permit.io API is available');
      return true;
    } else {
      throw new Error('Real Permit.io API is not ready');
    }
  } catch (error) {
    console.warn('Failed to connect to real Permit.io API, falling back to mock:', error);
    useMock = true;
    return await mockPermit.waitForPermitReady();
  }
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export const checkPermission = async (user, action, resource, tenant = 'default') => {
  if (useMock) {
    return mockPermit.checkPermission(user, action, resource, tenant);
  }
  
  try {
    return await realPermit.checkPermission(user, action, resource, tenant);
  } catch (error) {
    console.warn('Real Permit.io permission check failed, falling back to mock:', error);
    useMock = true;
    return mockPermit.checkPermission(user, action, resource, tenant);
  }
};

/**
 * Check permissions for a specific resource instance
 */
export const checkResourcePermission = async (user, action, resourceInstance, tenant = 'default') => {
  if (useMock) {
    return mockPermit.checkResourcePermission(user, action, resourceInstance, tenant);
  }
  
  try {
    return await realPermit.checkResourcePermission(user, action, resourceInstance, tenant);
  } catch (error) {
    console.warn('Real Permit.io resource permission check failed, falling back to mock:', error);
    useMock = true;
    return mockPermit.checkResourcePermission(user, action, resourceInstance, tenant);
  }
};

/**
 * Sync user with Permit.io
 */
export const syncUser = async (user) => {
  if (useMock) {
    return mockPermit.syncUser(user);
  }
  
  try {
    return await realPermit.syncUser(user);
  } catch (error) {
    console.warn('Real Permit.io user sync failed, falling back to mock:', error);
    useMock = true;
    return mockPermit.syncUser(user);
  }
};

/**
 * Get audit log
 */
export const getAuditLog = () => {
  if (useMock) {
    return mockPermit.getAuditLog();
  }
  
  try {
    return realPermit.getAuditLog();
  } catch (error) {
    console.warn('Real Permit.io audit log retrieval failed, falling back to mock:', error);
    useMock = true;
    return mockPermit.getAuditLog();
  }
};

// Export default object with all methods
export default {
  check: checkPermission,
  checkResource: checkResourcePermission,
  waitForContext: waitForPermitReady,
  api: {
    syncUser,
    getAuditLog
  }
}; 