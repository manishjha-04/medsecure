/**
 * MedSecure Permit.io Service
 * 
 * This service integrates with Permit.io to provide authorization
 * through a proper backend proxy to avoid CORS issues.
 */

// Import real permit implementation only
import * as realPermit from './permit';
import { initializePermitResources as realInitializeResources } from './permitConfig';

// Service state
let initializationComplete = false;

/**
 * Initialize Permit.io resources
 */
export const initializePermitResources = async () => {
  if (initializationComplete) {
    return true;
  }

  try {
    console.log('Initializing Permit.io resources...');
    const success = await realInitializeResources();
    
    if (success) {
      console.log('Successfully initialized Permit.io resources');
      initializationComplete = true;
      return true;
    } else {
      throw new Error('Permit.io initialization returned false');
    }
  } catch (error) {
    console.error('Failed to initialize Permit.io:', error);
    throw error; // Propagate the error instead of falling back
  }
};

/**
 * Wait for Permit.io to be ready
 */
export const waitForPermitReady = async () => {
  try {
    console.log('Checking Permit.io API availability...');
    const ready = await realPermit.waitForPermitReady();
    
    if (ready) {
      console.log('Permit.io API is available');
      return true;
    } else {
      throw new Error('Permit.io API is not ready');
    }
  } catch (error) {
    console.error('Failed to connect to Permit.io API:', error);
    throw error; // Propagate the error instead of falling back
  }
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export const checkPermission = async (user, action, resource, tenant = 'default') => {
  try {
    return await realPermit.checkPermission(user, action, resource, tenant);
  } catch (error) {
    console.error('Permit.io permission check failed:', error);
    return false; // Default deny on errors for security
  }
};

/**
 * Check permissions for a specific resource instance
 */
export const checkResourcePermission = async (user, action, resourceInstance, tenant = 'default') => {
  try {
    return await realPermit.checkResourcePermission(user, action, resourceInstance, tenant);
  } catch (error) {
    console.error('Permit.io resource permission check failed:', error);
    return false; // Default deny on errors for security
  }
};

/**
 * Sync user with Permit.io
 */
export const syncUser = async (user) => {
  try {
    return await realPermit.syncUser(user);
  } catch (error) {
    console.error('Permit.io user sync failed:', error);
    throw error; // Propagate the error
  }
};

/**
 * Get audit log
 */
export const getAuditLog = () => {
  return realPermit.getAuditLog();
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