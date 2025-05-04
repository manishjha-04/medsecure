/**
 * Mock Permit.io Authorization Service
 * 
 * A client-side mock implementation of Permit.io authorization for development and testing.
 * This allows frontend development without requiring direct API calls to Permit.io.
 */

// Store for users, roles, resources, and permissions
const store = {
  users: {},
  roles: {
    'admin': {
      name: 'Administrator',
      permissions: {
        '*': ['*'] // all actions on all resources
      }
    },
    'doctor': {
      name: 'Doctor',
      permissions: {
        'patient': ['view', 'create', 'edit'],
        'medical_record': ['view', 'create', 'edit'],
        'prescription': ['view', 'create', 'approve'],
        'billing': ['view'],
        'lab_result': ['view', 'create', 'approve'],
        'appointment': ['view', 'create', 'edit', 'approve'],
        'schedule': ['view']
      }
    },
    'nurse': {
      name: 'Nurse',
      permissions: {
        'patient': ['view'],
        'medical_record': ['view', 'create'],
        'prescription': ['view', 'administer'],
        'lab_result': ['view'],
        'appointment': ['view', 'create'],
        'schedule': ['view']
      }
    },
    'patient': {
      name: 'Patient',
      permissions: {
        'patient': ['view'], // with ABAC conditions
        'medical_record': ['view'], // with ABAC conditions
        'prescription': ['view'], // with ABAC conditions
        'billing': ['view'], // with ABAC conditions
        'appointment': ['view', 'create']
      }
    },
    'lab_technician': {
      name: 'Lab Technician',
      permissions: {
        'patient': ['view'],
        'medical_record': ['view'],
        'lab_result': ['view', 'create', 'edit']
      }
    },
    'receptionist': {
      name: 'Receptionist',
      permissions: {
        'patient': ['view', 'create'],
        'appointment': ['view', 'create', 'edit'],
        'schedule': ['view']
      }
    },
    'billing_staff': {
      name: 'Billing Staff',
      permissions: {
        'patient': ['view'],
        'billing': ['view', 'create', 'edit', 'approve']
      }
    }
  }
};

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
  console.debug(`[Mock Permit] ${allowed ? 'ALLOWED' : 'DENIED'} ${action} on ${resource} for user ${userId}: ${reason}`);
}

/**
 * Evaluate if user attributes match resource attributes for ABAC rules
 */
function evaluateAbacConditions(user, action, resource, resourceInstance) {
  // If no resource instance provided, no conditions to check
  if (!resourceInstance) {
    return true;
  }
  
  const userRole = user.roles && user.roles[0];
  
  // Special handling for patient role
  if (userRole === 'patient') {
    // Patients can only access their own data
    if (resource === 'patient' && resourceInstance.id !== user.id) {
      return false;
    }
    
    // Patients can only view their own medical records, prescriptions, and billing
    if (['medical_record', 'prescription', 'billing'].includes(resource) && 
        resourceInstance.patientId !== user.id) {
      return false;
    }
  }
  
  // Special handling for department-specific rules
  if (userRole === 'nurse' && resource === 'patient' && action === 'edit') {
    // Only emergency nurses can edit patient data
    return user.department === 'Emergency';
  }
  
  if (userRole === 'doctor' && resource === 'prescription' && action === 'approve') {
    // Doctors can only approve prescriptions in their specialty
    return user.department === resourceInstance.department;
  }
  
  return true;
}

/**
 * Check if a user has permission to perform an action on a resource
 */
export const checkPermission = async (user, action, resource, tenant = 'default') => {
  try {
    const userId = typeof user === 'object' ? user.id : user;
    const userRole = typeof user === 'object' && user.roles && user.roles[0];
    
    if (!userRole) {
      logDecision(userId, action, resource, false, 'User has no roles');
      return false;
    }
    
    // Get role permissions
    const rolePerms = store.roles[userRole]?.permissions || {};
    
    // Check if role has wildcard permissions
    if (rolePerms['*'] && (rolePerms['*'].includes('*') || rolePerms['*'].includes(action))) {
      logDecision(userId, action, resource, true, 'Wildcard permission');
      return true;
    }
    
    // Check if role has permission for this resource
    if (!rolePerms[resource]) {
      logDecision(userId, action, resource, false, 'No permissions for this resource');
      return false;
    }
    
    // Check if role has wildcard action or specific action for this resource
    if (rolePerms[resource].includes('*') || rolePerms[resource].includes(action)) {
      logDecision(userId, action, resource, true, 'Role-based permission');
      return true;
    }
    
    logDecision(userId, action, resource, false, 'No permission for this action');
    return false;
  } catch (error) {
    console.error('Mock permission check failed:', error);
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
    
    // First, check basic permissions
    const hasBasicPermission = await checkPermission(user, action, type, tenant);
    
    if (!hasBasicPermission) {
      logDecision(userId, action, type, false, 'No basic permission for this action');
      return false;
    }
    
    // Then, evaluate ABAC conditions
    const meetsConditions = evaluateAbacConditions(user, action, type, attributes);
    
    if (!meetsConditions) {
      logDecision(userId, action, type, false, 'Failed attribute-based conditions');
      return false;
    }
    
    logDecision(userId, action, type, true, 'Passed all permission checks');
    return true;
  } catch (error) {
    console.error('Mock resource permission check failed:', error);
    // Return false by default - deny access on errors
    return false;
  }
};

/**
 * Sync user with mock store
 */
export const syncUser = async (user) => {
  try {
    if (!user) return false;
    
    // Add or update user in store
    store.users[user.id] = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      department: user.department,
      tenant: user.tenant
    };
    
    return true;
  } catch (error) {
    console.error('Mock user sync failed:', error);
    return false;
  }
};

/**
 * Ensure mock implementation is ready
 */
export const waitForPermitReady = async () => {
  // Mock implementation is always ready
  return true;
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