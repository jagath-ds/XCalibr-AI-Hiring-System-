import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// --- 1. Import all necessary API functions ---
import { 
  changeCandidatePassword, 
  deleteCandidateAccount,
  changeHrPassword, // You will need to add this
  deleteHrAccount // You will need to add this
} from '../api/api'; 
import { FiLoader } from 'react-icons/fi';

export default function SettingsPage() {
  // --- 2. Get user and role from layout ---
  const { role, user } = useOutletContext();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill in all fields.");
      return;
    }
    setLoadingPassword(true);

    try {
      if (role === 'candidate') {
        // --- 3. CANDIDATE LOGIC (Uses token-based API) ---
        await changeCandidatePassword({
          current_password: currentPassword,
          new_password: newPassword
        });
      } else if (role === 'recruiter') {
        // --- 4. HR LOGIC (Uses token-based API) ---
        // We pass the hr_id from the user object
        await changeHrPassword(user.hr_id, { 
          current_password: currentPassword,
          new_password: newPassword
        });
      }
      
      alert("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');

    } catch (error) {
      const errorMsg = error.response?.data?.detail || "An error occurred. Please try again.";
      console.error("Failed to change password:", error);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setLoadingDelete(true);
      try {
        if (role === 'candidate') {
          // --- 5. CANDIDATE LOGIC (Uses token-based API) ---
          await deleteCandidateAccount();
          localStorage.removeItem('token');
          alert("Account deleted successfully.");
          navigate('/'); // Redirect to homepage
        } else if (role === 'recruiter') {
          // --- 6. HR LOGIC (Uses token-based API) ---
          await deleteHrAccount(user.hr_id);
          localStorage.removeItem('hr_token');
          alert("Account deleted successfully.");
          navigate('/recruiter/login'); // Redirect to HR login
        }
      } catch (error) {
        const errorMsg = error.response?.data?.detail || "Failed to delete account.";
        console.error("Failed to delete account:", error);
        alert(errorMsg);
        setLoadingDelete(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-dark">Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your account settings.
        </p>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-dark">Account Settings</h3>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full max-w-sm p-3 bg-slate-50 border border-slate-200 rounded-lg"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loadingPassword}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full max-w-sm p-3 bg-slate-50 border border-slate-200 rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loadingPassword}
            />
          </div>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:bg-slate-400 flex items-center gap-2"
            disabled={loadingPassword}
          >
            {loadingPassword ? <FiLoader className="animate-spin" /> : null}
            {loadingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
        <h3 className="font-bold text-lg text-red-700">Delete Account</h3>
        <p className="mt-2 text-slate-500">Once you delete your account, there is no going back. Please be certain.</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="mt-4 px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
          disabled={loadingDelete}
        >
          {loadingDelete ? <FiLoader className="animate-spin" /> : null}
          {loadingDelete ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
}