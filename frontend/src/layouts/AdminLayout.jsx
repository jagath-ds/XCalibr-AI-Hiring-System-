import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// --- 1. IMPORT NEW ICONS (FiFileText added) ---
import { FiUsers, FiLogOut, FiShield, FiGrid, FiFileText } from 'react-icons/fi';
import { getAdminMe } from '../api/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  useEffect(() => {
    // Fetch admin info on mount
    const fetchAdminInfo = async () => {
      try {
        const data = await getAdminMe();
        console.log('Admin info loaded:', data);
        setAdminInfo(data);
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      } finally {
        setIsLoadingInfo(false);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear the admin token
      localStorage.removeItem('admin_token');
      console.log('Admin logged out');
      // Redirect to the admin login page
      navigate('/admin/login', { replace: true });
    }
  };

  // This now checks for the exact path
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen">
      {/* --- Admin Sidebar --- */}
      <div className="w-64 bg-dark text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <FiShield className="text-primary text-2xl" />
            <h2 className="text-2xl font-bold text-primary">XCalibr</h2>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Admin Portal</p>
          {!isLoadingInfo && adminInfo && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm font-medium text-white">
                {adminInfo.firstname} {adminInfo.lastname}
              </p>
              <p className="text-xs text-slate-400 mt-1">{adminInfo.email}</p>
            </div>
          )}
        </div>

        {/* --- 3. UPDATE NAVIGATION --- */}
        <nav className="flex flex-col p-4 space-y-2 flex-1">
          {/* Link 1: Dashboard */}
          <Link
            to="/system-admin-portal-2024"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              isActive('/system-admin-portal-2024')
                ? 'bg-primary text-white shadow-lg'
                : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FiGrid className="text-lg" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Link 2: User Management */}
          <Link
            to="/system-admin-portal-2024/user-management"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              isActive('/system-admin-portal-2024/user-management')
                ? 'bg-primary text-white shadow-lg'
                : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FiUsers className="text-lg" />
            <span className="font-medium">User Management</span>
          </Link>

          {/* --- NEW LINK: System Logs --- */}
          <Link
            to="/system-admin-portal-2024/system-logs"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              isActive('/system-admin-portal-2024/system-logs')
                ? 'bg-primary text-white shadow-lg'
                : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FiFileText className="text-lg" /> 
            <span className="font-medium">System Logs</span>
          </Link>
          {/* --- END OF NEW LINK --- */}

        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200 font-medium"
          >
            <FiLogOut className="text-lg" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <main className="flex-1 bg-slate-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}