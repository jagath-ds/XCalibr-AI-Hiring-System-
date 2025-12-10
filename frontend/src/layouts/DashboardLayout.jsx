import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getMe, getHrMe } from '../api/api'; // <-- 1. Import getMe and getHrMe
import { FiLoader } from 'react-icons/fi'; // <-- Import loader icon

export default function DashboardLayout() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine role based on URL path prefix
  const role = location.pathname.startsWith('/recruiter') ? 'recruiter' : 'candidate';

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let data;
        if (role === 'candidate') {
          // --- CANDIDATE LOGIC ---
          if (!localStorage.getItem('token')) {
            navigate('/candidate/login', { replace: true });
            return;
          }
          data = await getMe(); // Uses CandidateAPI
        } else if (role === 'recruiter') {
          // --- NEW RECRUITER LOGIC ---
          if (!localStorage.getItem('hr_token')) {
            navigate('/recruiter/login', { replace: true });
            return;
          }
          data = await getHrMe(); // Uses HrAPI
        }
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // If token is bad, log them out
        if (role === 'candidate') {
          localStorage.removeItem('token');
          navigate('/candidate/login', { replace: true });
        } else if (role === 'recruiter') {
          localStorage.removeItem('hr_token');
          navigate('/recruiter/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [role, navigate]);

  // Show a loading screen while fetching user data
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <FiLoader className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  // Render the layout once user data is available
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} userData={userData} />
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* Pass the role AND the user data down */}
        <Outlet context={{ role, user: userData }} />
      </main>
    </div>
  );
}