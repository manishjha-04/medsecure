import { useState } from 'react';
import useAuthStore, { ROLES } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { login, isLoading, error } = useAuthStore();

  const demoAccounts = [
    {
      role: ROLES.ADMIN,
      name: 'Admin User',
      email: 'admin@healthapp.com',
      password: '2025DEVChallenge',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      icon: '👨‍💼'
    },
    {
      role: ROLES.DOCTOR,
      name: 'Dr. John Smith',
      email: 'dr.smith@healthapp.com',
      password: 'doctor123',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: '👨‍⚕️'
    },
    {
      role: ROLES.NURSE,
      name: 'Sarah Johnson',
      email: 'nurse.johnson@healthapp.com',
      password: 'nurse123',
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: '👩‍⚕️'
    },
    {
      role: ROLES.PATIENT,
      name: 'John Doe',
      email: 'patient.doe@example.com',
      password: 'patient123',
      color: 'bg-amber-100 border-amber-300 text-amber-800',
      icon: '🧑'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const selectDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedAccount(account);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
            MedSecure
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Advanced Hospital Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectDemoAccount(account)}
                  className={`${account.color} relative border rounded-md px-3 py-2 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left transition-all ${selectedAccount?.email === account.email ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{account.icon}</span>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs">{account.email}</p>
                      <p className="text-xs capitalize mt-1">Role: {account.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          <p>© 2023 MedSecure Healthcare System. All rights reserved.</p>
          <p className="mt-1">Secured with Permit.io Authorization</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 