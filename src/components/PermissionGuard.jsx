import { useState, useEffect, useCallback } from 'react';
import { checkPermission, checkResourcePermission } from '../services/permitService';
import useAuthStore from '../store/authStore';

/**
 * PermissionGuard Component
 * 
 * A reusable component that conditionally renders content based on the user's permissions
 * using Permit.io's fine-grained permission system.
 * 
 * @param {string} action - The action the user is trying to perform (e.g., 'view', 'edit')
 * @param {string} resource - The resource type being accessed (e.g., 'patient', 'medical_record')
 * @param {object} resourceInstance - Optional specific resource instance for attribute-based permissions
 * @param {ReactNode} fallback - What to render if permission is denied (defaults to null)
 * @param {boolean} showLoading - Whether to show a loading state (defaults to true)
 * @param {boolean} errorOnFailure - Whether to show an error message when permission check fails
 * @param {ReactNode} children - The content to render if permission is granted
 */
const PermissionGuard = ({ 
  action,
  resource,
  resourceInstance = null,
  fallback = null,
  showLoading = true,
  errorOnFailure = false,
  children
}) => {
  const { user } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserPermission = useCallback(async () => {
    if (!user) {
      setHasPermission(false);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      let permitted;
      
      // If we have a specific resource instance, use resource-based permission check
      if (resourceInstance) {
        // Ensure we have a type property if not provided
        const resourceData = resourceInstance.type ? 
          resourceInstance : 
          { 
            type: resource,
            ...resourceInstance
          };
          
        permitted = await checkResourcePermission(
          user,
          action,
          resourceData,
          user.tenant
        );
      } else {
        // Otherwise, use simple permission check
        permitted = await checkPermission(
          user,
          action,
          resource,
          user.tenant
        );
      }
      
      setHasPermission(permitted);
    } catch (error) {
      console.error('Permission check failed:', error);
      setHasPermission(false);
      if (errorOnFailure) {
        setError(`Error checking permissions: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, action, resource, resourceInstance, errorOnFailure]);

  useEffect(() => {
    // Reset state when inputs change
    setLoading(true);
    setHasPermission(false);
    setError(null);
    
    // Run permission check
    checkUserPermission();
  }, [checkUserPermission]);

  // Render loading state
  if (loading && showLoading) {
    return (
      <div className="text-center py-3 px-4 rounded-md bg-gray-50">
        <div className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-500">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Show error state if applicable
  if (error) {
    return (
      <div className="py-3 px-4 rounded-md bg-red-50 text-red-800 text-sm">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  // Return content if permitted, fallback otherwise
  if (!hasPermission) {
    return fallback;
  }

  return children;
};

export default PermissionGuard; 