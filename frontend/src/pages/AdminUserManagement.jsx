// admin usermanagement.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCandidates,
  getAllHrUsers,
  suspendCandidate,
  activateCandidate, 
  suspendHr,
  activateHr,
  createHr,
  deleteCandidate,
  deleteHr,
  adminResetHrPassword,
  adminResetCandidatePassword
} from '../api/api';
import { FiLoader, FiUserX, FiUserCheck, FiPlus, FiX, FiTrash2, FiKey } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("hr_users");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [candidates, setCandidates] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateHr, setShowCreateHr] = useState(false);
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  // Function to fetch all user data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [candsRes, hrsRes] = await Promise.all([
        getAllCandidates(),
        getAllHrUsers()
      ]);
      setCandidates(candsRes || []);
      setHrUsers(hrsRes || []);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Failed to load user data. Please try again.");
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [navigate]); 

  // --- Handler Functions ---

  const handleToggleCandidate = async (id, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? 'suspend' : 'activate'} this candidate?`)) {
      try {
        if (isActive) {
          await suspendCandidate(id);
        } else {
          await activateCandidate(id);
        }
        await fetchData(); 
      } catch (err) {
        alert(`Failed to update candidate: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const handleToggleHr = async (id, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? 'suspend' : 'activate'} this HR user?`)) {
      try {
        if (isActive) {
          await suspendHr(id);
        } else {
          await activateHr(id);
        }
        await fetchData(); 
      } catch (err) {
        alert(`Failed to update HR user: ${err.response?.data?.detail || err.message}`);
      }
    }
  };
  
  const handleDeleteCandidate = async (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY DELETE this candidate? This action cannot be undone.")) {
      try {
        await deleteCandidate(id);
        await fetchData(); // Refresh list
      } catch (err) {
        console.error('Delete candidate error:', err);
        alert(`Failed to delete candidate: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const handleDeleteHr = async (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY DELETE this HR user? This action cannot be undone.")) {
      try {
        await deleteHr(id);
        await fetchData(); // Refresh list
      } catch (err) {
        console.error('Delete HR error:', err);
        alert(`Failed to delete HR user: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  // --- Handlers for Reset Modal ---
  const handleOpenResetModal = (user, userType) => {
    setSelectedUser({ ...user, userType });
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setSelectedUser(null);
  };


  // --- (Filtering logic, Loading/Error UI) ---
  const filteredCandidates = candidates.filter(c =>
    `${c.firstname} ${c.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRecruiters = hrUsers.filter(r =>
    `${r.firstname} ${r.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <FiLoader className="text-4xl animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark">User Management</h1>
            <p className="text-slate-600 mt-1">Manage HR users and candidates</p>
          </div>
          <button
            onClick={() => setShowCreateHr(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FiPlus /> Create HR Account
          </button>
        </div>

        {/* Create HR Modal */}
        {showCreateHr && (
          <CreateHrModal 
            onClose={() => setShowCreateHr(false)} 
            onSuccess={() => {
              fetchData();
              setShowCreateHr(false);
            }} 
          />
        )}
        
        {/* Reset Password Modal */}
        {showResetModal && selectedUser && (
          <ResetPasswordModal
            user={selectedUser}
            onClose={handleCloseResetModal}
          />
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab("hr_users")} 
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === "hr_users" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              HR Management ({hrUsers.length})
            </button>
            <button 
              onClick={() => setActiveTab("candidates")} 
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === "candidates" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Candidate Management ({candidates.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {/* HR Users Table */}
        {activeTab === "hr_users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <UserTable 
              users={filteredRecruiters} 
              onToggle={handleToggleHr} 
              onDelete={handleDeleteHr}
              onResetPassword={(user) => handleOpenResetModal(user, 'HR')}
              userType="HR" 
            />
          </div>
        )}

        {/* Candidate Users Table */}
        {activeTab === "candidates" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <UserTable 
              users={filteredCandidates} 
              onToggle={handleToggleCandidate} 
              onDelete={handleDeleteCandidate}
              onResetPassword={(user) => handleOpenResetModal(user, 'Candidate')}
              userType="Candidate" 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// --- UserTable Component ---
const UserTable = ({ users, onToggle, onDelete, onResetPassword, userType }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {users.length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
              No {userType === 'HR' ? 'HR users' : 'candidates'} found.
            </td>
          </tr>
        )}
        {users.map((user) => (
          <tr key={userType === 'HR' ? user.hr_id : user.candid} className="hover:bg-slate-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
              {user.firstname} {user.lastname}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {user.is_active ? (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Suspended
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                {/* Activate/Suspend Button */}
                <button
                  onClick={() => onToggle(userType === 'HR' ? user.hr_id : user.candid, user.is_active)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors ${
                    user.is_active 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={user.is_active ? 'Suspend User' : 'Activate User'}
                >
                  {user.is_active ? <FiUserX /> : <FiUserCheck />}
                  {user.is_active ? 'Suspend' : 'Activate'}
                </button>
                
                {/* Reset Password Button */}
                <button
                  onClick={() => onResetPassword(user)}
                  className="flex items-center gap-2 px-3 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  title="Reset Password"
                >
                  <FiKey />
                  Reset
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDelete(userType === 'HR' ? user.hr_id : user.candid)}
                  className="flex items-center gap-2 px-3 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  title="Delete User"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


// --- Create HR Modal Component (Unchanged) ---
const CreateHrModal = ({ onClose, onSuccess }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await createHr({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        pass_word: password,
        designation: designation.trim()
      });
      
      alert("HR Account Created Successfully!");
      onSuccess();
    } catch (err) {
      console.error('Failed to create HR account:', err);
      setError(err.response?.data?.detail || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative animate-fadeIn">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl transition-colors"
          aria-label="Close modal"
        >
          <FiX />
        </button>
        
        <h3 className="text-lg font-semibold text-dark mb-4">Create New HR Account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name *
              </label>
              <input 
                type="text" 
                placeholder="John" 
                value={firstname} 
                onChange={(e) => setFirstname(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name *
              </label>
              <input 
                type="text" 
                placeholder="Doe" 
                value={lastname} 
                onChange={(e) => setLastname(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <input 
              type="email" 
              placeholder="john.doe@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              required 
              minLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Designation
            </label>
            <input 
              type="text" 
              placeholder="Recruiter / HR Manager" 
              value={designation} 
              onChange={(e) => setDesignation(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ResetPasswordModal Component ---
const ResetPasswordModal = ({ onClose, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Validation ---
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // --- End Validation ---

    setIsLoading(true);
    
    try {
      // Call the correct API function based on userType
      if (user.userType === 'HR') {
        await adminResetHrPassword(user.hr_id, newPassword);
      } else {
        await adminResetCandidatePassword(user.candid, newPassword);
      }
      
      alert("Password reset successfully!");
      onClose(); // Close the modal on success

    // --- FIX 1: Added opening brace { ---
    } catch (err) { 
      console.error('Failed to reset password:', err);
      setError(err.response?.data?.detail || "Failed to reset password. Please try again.");
    // --- FIX 2: Added closing brace } ---
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative animate-fadeIn">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl transition-colors"
          aria-label="Close modal"
        >
          <FiX />
        </button>
        
        <h3 className="text-lg font-semibold text-dark mb-1">Reset Password</h3>
        <p className="text-sm text-slate-600 mb-4">
          For: <span className="font-medium">{user.firstname} {user.lastname}</span>
        {/* --- FIX 3: Changed </C> to </p> --- */}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Temporary Password *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              required 
              minLength={6}
            />
             <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              // --- FIX 4: Changed e.targe to e.target ---
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              required 
              minLength={6}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};