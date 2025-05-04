import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './Navigation';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const { init, user } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navigation />}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 