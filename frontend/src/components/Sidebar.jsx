// src/components/Sidebar.jsx
import { NavLink, Link, useNavigate } from "react-router-dom";
// --- UPDATED IMPORTS ---
import { 
    FiUser, 
    FiBriefcase, 
    FiFileText, 
    FiSettings, 
    FiLogOut, 
    FiGrid, 
    FiUsers,
    FiMessageSquare // NEW: Icon for Feedback
} from 'react-icons/fi';

// 1. Accept userData as a prop
export default function Sidebar({ role, userData }) {
    const navigate = useNavigate();

    // --- UPDATED: Added Feedback item ---
    const candidateNavItems = [
        { icon: FiUser, label: "Profile", path: "/candidate/profile" },
        // NEW: Feedback link for Candidate
        { icon: FiMessageSquare, label: "Feedback", path: "/candidate/feedback" },
        { icon: FiBriefcase, label: "Job Board", path: "/candidate/job-board" },
        { icon: FiFileText, label: "My Applications", path: "/candidate/applications" },
        { icon: FiSettings, label: "Settings", path: "/candidate/settings" },
    ];

    // --- UPDATED: Added Feedback item ---
    const recruiterNavItems = [
        { icon: FiGrid, label: "Dashboard", path: "/recruiter/dashboard" },
        // NEW: Feedback link for Recruiter
        { icon: FiMessageSquare, label: "Feedback", path: "/recruiter/feedback" },
        { icon: FiUsers, label: "Applicants", path: "/recruiter/applicants" },
        { icon: FiBriefcase, label: "Post a Job", path: "/recruiter/post-job" },
        { icon: FiSettings, label: "Settings", path: "/recruiter/settings" },
    ];
    
    const navItems = role === 'recruiter' ? recruiterNavItems : candidateNavItems;

    // 2. Use userData prop directly
    const userDisplay = {
        name: `${userData.firstname} ${userData.lastname}`.trim(),
        email: userData.email || "",
        initial: `${(userData.firstname || '').charAt(0)}${(userData.lastname || '').charAt(0)}`.toUpperCase() || "?",
    };

    const handleLogout = () => {
        // 3. Clear the correct token based on role
        if (role === 'candidate') {
            localStorage.removeItem('token');
            navigate('/');
        } else if (role === 'recruiter') {
            localStorage.removeItem('hr_token');
            navigate('/recruiter/login');
        } else {
            localStorage.clear();
            navigate('/');
        }
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col p-4 rounded-r-2xl">
            <div className="p-4 mb-4">
                <Link to="/" className="font-bold text-2xl text-dark">XCALIBR</Link>
            </div>
            <nav className="flex-grow">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                                        isActive ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto">
                <div className="flex items-center gap-3 p-2 border-t border-slate-200 pt-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {userDisplay.initial}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-dark">{userDisplay.name}</p>
                        <p className="text-xs text-slate-500">{userDisplay.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 w-full mt-4 text-red-500 bg-red-50 hover:bg-red-100 p-3 rounded-lg font-semibold"
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}