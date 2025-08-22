import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../contexts/TenantContext';
import { useProducts } from '../../contexts/ProductContext';
import { 
  Package, 
  Settings, 
  User, 
  LogOut, 
  Wifi, 
  WifiOff,
  Globe,
  ChevronDown,
  Upload
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { currentUser, currentTenant, logout } = useTenant();
  const { isOffline, offlineActions } = useProducts();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsSettingsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    {
      name: t('navigation.import'),
      href: '/import',
      icon: Upload,
      current: location.pathname === '/import'
    },
    {
      name: t('navigation.products'),
      href: '/products',
      icon: Package,
      current: location.pathname === '/products' || location.pathname === '/'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-deepBrown shadow-sm border-b border-deepBrown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">
                {t('products.title')}
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'text-white bg-black bg-opacity-20'
                        : 'text-neutral-200 hover:text-white hover:bg-black hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOffline ? (
                  <div className="flex items-center text-red-300">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Offline</span>
                    {offlineActions.length > 0 && (
                      <span className="ml-1 bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                        {offlineActions.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-green-300">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Online</span>
                  </div>
                )}
              </div>

              {/* Settings Dropdown */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 text-neutral-200 hover:text-white transition-colors rounded-md hover:bg-black hover:bg-opacity-10"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm font-medium text-neutral-700 border-b border-neutral-100">
                        {t('settings.language')}
                      </div>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between ${
                          i18n.language === 'en' ? 'text-earthGreen font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          English
                        </span>
                        {i18n.language === 'en' && <span className="text-earthGreen">✓</span>}
                      </button>
                      <button
                        onClick={() => changeLanguage('hi')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between ${
                          i18n.language === 'hi' ? 'text-earthGreen font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          हिंदी
                        </span>
                        {i18n.language === 'hi' && <span className="text-earthGreen">✓</span>}
                      </button>
                      <button
                        onClick={() => changeLanguage('mr')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between ${
                          i18n.language === 'mr' ? 'text-earthGreen font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          मराठी
                        </span>
                        {i18n.language === 'mr' && <span className="text-earthGreen">✓</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-neutral-200" />
                  <div className="text-sm">
                    <div className="font-medium text-white">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-neutral-200 text-xs">
                      {currentTenant?.name || 'No Tenant'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="p-2 text-neutral-200 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-black border-opacity-20">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-white bg-black bg-opacity-20'
                      : 'text-neutral-200 hover:text-white hover:bg-black hover:bg-opacity-10'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              © 2025 Products Manager PWA. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Tenant: {currentTenant?.name}</span>
              <span>•</span>
              <span>User: {currentUser?.name}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;