import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import Admin from './components/Admin';
import useAuthStore from './store/authStore';

// Import permit service with fallback mechanism
import { initializePermitResources, waitForPermitReady } from './services/permitService';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { user, init } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    // Initialize auth store and Permit.io resources
    const initializeApp = async () => {
      setIsInitializing(true);
      setInitError(null);
      
      try {
        // Step 1: Initialize Permit.io resources and policies
        console.log('Initializing Permit.io resources and policies...');
        await initializePermitResources();
        
        // Step 2: Wait for Permit to be ready (real or mock)
        console.log('Checking Permit.io availability...');
        const permitReady = await waitForPermitReady();
        if (!permitReady) {
          throw new Error('Failed to initialize Permit.io authorization');
        }
        
        // Step 3: Initialize auth store (load saved user)
        console.log('Initializing auth store...');
        await init();
        
        console.log('Application initialization completed successfully');
      } catch (error) {
        console.error('Failed to initialize application:', error);
        setInitError(error.message);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, [init]);

  // Show loading indicator while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">Initializing MedSecure Healthcare System...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we set up the authorization system.</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-pink-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-gray-800 text-xl font-bold">Initialization Failed</h2>
          <p className="mt-2 text-gray-600">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
