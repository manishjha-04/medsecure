import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CalendarIcon,
  BeakerIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import useAuthStore, { ROLES } from '../store/authStore';
import PermissionGuard from './PermissionGuard';

const Navigation = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [userNavigation, setUserNavigation] = useState([]);

  // Define navigation with icons and permission requirements
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: HomeIcon,
      permissionAction: null, // Everyone can see dashboard
      permissionResource: null
    },
    { 
      name: 'Patients', 
      href: '/patients',
      icon: UserGroupIcon,
      permissionAction: 'view',
      permissionResource: 'patient'
    },
    { 
      name: 'Medical Records', 
      href: '/records',
      icon: DocumentTextIcon,
      permissionAction: 'view',
      permissionResource: 'medical_record'
    },
    { 
      name: 'Prescriptions', 
      href: '/prescriptions',
      icon: ClipboardDocumentListIcon,
      permissionAction: 'view',
      permissionResource: 'prescription'
    },
    { 
      name: 'Appointments', 
      href: '/appointments',
      icon: CalendarIcon,
      permissionAction: 'view',
      permissionResource: 'appointment'
    },
    { 
      name: 'Lab Results', 
      href: '/lab-results',
      icon: BeakerIcon,
      permissionAction: 'view',
      permissionResource: 'lab_result'
    },
    { 
      name: 'Billing', 
      href: '/billing',
      icon: BanknotesIcon,
      permissionAction: 'view',
      permissionResource: 'billing'
    },
    { 
      name: 'Admin', 
      href: '/admin',
      icon: Cog6ToothIcon,
      permissionAction: 'manage',
      permissionResource: 'system'
    },
  ];

  // Set user navigation based on role
  useEffect(() => {
    const userMenuItems = [
      { name: 'Your Profile', href: '/profile' },
    ];

    if (user?.roles.includes(ROLES.ADMIN)) {
      userMenuItems.push({ name: 'System Settings', href: '/settings' });
    }
    
    userMenuItems.push({ name: 'Sign out', href: '#', onClick: logout });
    
    setUserNavigation(userMenuItems);
  }, [user, logout]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-blue-200 text-indigo-800 flex items-center justify-center text-lg font-bold">
                      M
                    </span>
                    <span className="ml-2 text-white text-xl font-bold">MedSecure</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => {
                      // Create the navigation item with active state handling
                      const navItem = (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            isActivePath(item.href)
                              ? 'bg-indigo-900 text-white'
                              : 'text-blue-100 hover:bg-indigo-700 hover:text-white',
                            'group rounded-md px-3 py-2 text-sm font-medium flex items-center'
                          )}
                          aria-current={isActivePath(item.href) ? 'page' : undefined}
                        >
                          {item.icon && (
                            <item.icon 
                              className={classNames(
                                isActivePath(item.href) 
                                  ? 'text-white' 
                                  : 'text-blue-200 group-hover:text-white',
                                'mr-2 h-5 w-5 flex-shrink-0'
                              )} 
                              aria-hidden="true" 
                            />
                          )}
                          {item.name}
                          {isActivePath(item.href) && (
                            <span className="ml-2">
                              <CheckCircleIcon className="h-4 w-4 text-blue-200" aria-hidden="true" />
                            </span>
                          )}
                        </Link>
                      );

                      // If permission check is required, wrap with PermissionGuard
                      return item.permissionAction ? (
                        <PermissionGuard
                          key={item.name}
                          action={item.permissionAction}
                          resource={item.permissionResource}
                          fallback={null}
                          showLoading={false}
                        >
                          {navItem}
                        </PermissionGuard>
                      ) : (
                        navItem
                      );
                    })}
                  </div>
                </div>
              </div>
              {user && (
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <div className="rounded-md bg-blue-600 px-3 py-1.5 text-white text-xs font-medium">
                      <span className="capitalize">{user.roles[0]}</span>
                    </div>
                    
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-indigo-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-800">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shadow-lg">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                            <p className="font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                            <div className="flex items-center mt-2">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                {user.department || 'No Department'}
                              </span>
                              <span className="ml-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 capitalize">
                                {user.roles[0]}
                              </span>
                            </div>
                          </div>
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  onClick={item.onClick}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              )}
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-indigo-800 p-2 text-blue-200 hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-800">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => {
                const mobileNavItem = (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActivePath(item.href)
                        ? 'bg-indigo-900 text-white'
                        : 'text-blue-100 hover:bg-indigo-700 hover:text-white',
                      'flex items-center rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={isActivePath(item.href) ? 'page' : undefined}
                  >
                    {item.icon && (
                      <item.icon 
                        className={classNames(
                          isActivePath(item.href) ? 'text-white' : 'text-blue-200',
                          'mr-3 h-5 w-5 flex-shrink-0'
                        )} 
                        aria-hidden="true" 
                      />
                    )}
                    {item.name}
                  </Link>
                );

                return item.permissionAction ? (
                  <PermissionGuard
                    key={item.name}
                    action={item.permissionAction}
                    resource={item.permissionResource}
                    fallback={null}
                    showLoading={false}
                  >
                    {mobileNavItem}
                  </PermissionGuard>
                ) : (
                  mobileNavItem
                );
              })}
            </div>
            {user && (
              <div className="border-t border-indigo-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{`${user.firstName} ${user.lastName}`}</div>
                    <div className="text-sm font-medium leading-none text-blue-200 mt-1">{user.email}</div>
                    <div className="flex mt-2 space-x-2">
                      <span className="inline-flex items-center rounded-md bg-blue-400 bg-opacity-20 px-2 py-1 text-xs font-medium text-blue-100 ring-1 ring-inset ring-blue-400">
                        {user.department || 'No Department'}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-400 bg-opacity-20 px-2 py-1 text-xs font-medium text-purple-100 ring-1 ring-inset ring-purple-400 capitalize">
                        {user.roles[0]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      onClick={item.onClick}
                      className="block rounded-md px-3 py-2 text-base font-medium text-blue-100 hover:bg-indigo-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation; 