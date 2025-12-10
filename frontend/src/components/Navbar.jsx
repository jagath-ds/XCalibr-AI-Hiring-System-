import { Link, useNavigate } from "react-router-dom"; 
import { FiBell, FiMessageSquare } from "react-icons/fi";

export default function Navbar() {
  // Use a placeholder logo image path
  const logoPath = "/logo.jpg"; // Make sure logo.jpg is in your /public folder

  // Check localStorage for either user
  const hrName = localStorage.getItem("hr_name");
  const candidateName = localStorage.getItem("candidate_name"); 
  const isLoggedIn = hrName || candidateName; 
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
    window.location.reload(); 
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-r from-green-500/80 to-blue-600/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* --- 2. THIS BLOCK IS UPDATED --- */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="XCalibr Logo" 
              className="h-15 w-32 rounded-md" // <-- Changed to h-10 w-32 for a rectangular shape
            />
          </Link>
          {/* --- END OF UPDATE --- */}


          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/about" className="text-slate-200 hover:text-white transition-colors">About Us</Link>
            <Link to="/pricing" className="text-slate-200 hover:text-white transition-colors">Pricing</Link>
            <Link to="/contact" className="text-slate-200 hover:text-white transition-colors">Contact</Link>

          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link to="#" className="text-slate-200 hover:text-white" title="Notifications">
                  <FiBell size={20} />
                </Link>
                <Link to="#" className="text-slate-200 hover:text-white" title="Feedback">
                  <FiMessageSquare size={20} />
                </Link>
                
                <Link
                  to={hrName ? "/recruiter/dashboard" : "/candidate/profile"}
                  className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-md"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white text-dark font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/recruiter/login"
                  className="px-5 py-2.5 bg-white text-dark font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm shadow-md"
                >
                  Login as HR
                </Link>
                <Link
                  to="/candidate/login"
                  className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm shadow-md"
                >
                  Login as Candidate <span>&rarr;</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}