/**
 * MedSecure Authorization Service
 * 
 * This service implements a sophisticated authorization layer using Permit.io's REST API
 * for role-based access control (RBAC), attribute-based access control (ABAC), and multi-tenancy.
 */

import permitConfig, { permitApi } from './permitConfig';

// Audit logging (would integrate with real logging system)
const auditLog = [];

// Log permission decisions for audit purposes
function logDecision(userId, action, resource, allowed, reason) {
  const timestamp = new Date().toISOString();
  const decision = {
    timestamp,
    userId,
    action,
    resource,
    allowed,
    reason
  };
  
  // Add to audit log
  auditLog.push(decision);
  
  // Log to console
  console.debug(`[Permit] ${allowed ? 'ALLOWED' : 'DENIED'} ${action} on ${resource} for user ${userId}: ${reason}`);
}

/**
 * Check if a user has permission to perform an action on a resource
 */
export const checkPermission = async (user, action, resource, tenant = 'default') => {
  try {
    const userId = typeof user === 'object' ? user.id : user;
    
    // Call Permit.io API to check permission
    const response = await permitApi.post('/policy/check', {
      user: userId,
      action: action,
      resource: resource,
      tenant: tenant,
      context: {
        user: typeof user === 'object' ? {
          department: user.department,
          roles: user.roles
        } : {}
      }
    });
    
    const allowed = response.data.allow;
    logDecision(userId, action, resource, allowed, 'API permission check');
    
    return allowed;
  } catch (error) {
    console.error('Permission check failed:', error);
    // Return false by default - deny access on errors
    return false;
  }
};

/**
 * Check permissions for a specific resource instance
 */
export const checkResourcePermission = async (user, action, resourceInstance, tenant = 'default') => {
  try {
    const { type, ...attributes } = resourceInstance;
    const userId = typeof user === 'object' ? user.id : user;
    
    const response = await permitApi.post('/policy/check', {
      user: userId,
      action: action,
      resource: type,
      tenant: tenant,
      context: {
        user: typeof user === 'object' ? {
          department: user.department,
          roles: user.roles
        } : {},
        resource: attributes
      }
    });
    
    const allowed = response.data.allow;
    logDecision(userId, action, type, allowed, 'API resource permission check');
    
    return allowed;
  } catch (error) {
    console.error('Resource permission check failed:', error);
    // Return false by default - deny access on errors
    return false;
  }
};

/**
 * Sync user with Permit.io
 */
export const syncUser = async (user) => {
  try {
    if (!user) return false;
    
    // Call Permit.io API to sync user
    await permitApi.post(`/${permitConfig.PROJECT}/env/${permitConfig.ENVIRONMENT}/users`, {
      key: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      attributes: {
        department: user.department,
        tenant: user.tenant
      }
    });
    
    // Assign roles to user
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        await permitApi.post(`/${permitConfig.PROJECT}/env/${permitConfig.ENVIRONMENT}/user_role_assignments`, {
          user: user.id,
          role: role,
          tenant: user.tenant || 'default'
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('User sync failed:', error);
    return false;
  }
};

/**
 * Ensure Permit.io is ready to process permission checks
 */
export const waitForPermitReady = async () => {
  try {
    // Simple ping to check API availability
    await permitApi.get(`/${permitConfig.PROJECT}/env/${permitConfig.ENVIRONMENT}/config`);
    return true;
  } catch (error) {
    console.error('Permit.io API initialization failed:', error);
    return false;
  }
};

/**
 * Get audit log
 */
export const getAuditLog = () => {
  return auditLog;
};

// Export object with methods
export default {
  check: checkPermission,
  checkResource: checkResourcePermission,
  waitForContext: waitForPermitReady,
  api: {
    syncUser,
    getAuditLog
  }
}; 