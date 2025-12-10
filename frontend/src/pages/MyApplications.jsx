import { useState, useEffect } from 'react';
// 1. Import the token-based API function
import { getApplicationsByCandidate } from '../api/api';

export default function MyApplications() {
  // 2. Add state for applications, loading, and errors
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Fetch data on page load using the token
  useEffect(() => {
    const fetchApplications = async () => {
      // We REMOVED the localStorage call.
      // The token is sent automatically by api.jsx
      try {
        setLoading(true);
        // Calls GET /applications/candidate (no ID needed)
        const data = await getApplicationsByCandidate(); // No argument needed
        setApplications(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again.");
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // Runs once on component mount

  // Helper to get the tailwind class for each status (copied from your previous version)
  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Interview Scheduled': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // 4. Handle Loading and Error states
  if (loading) {
    return <div className="p-8 text-center">Loading applications...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  // 5. Render the list or a "no applications" message (using your previous layout style)
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-dark">My Applications</h1>
        <p className="mt-1 text-slate-500">
          Track the status of all your job applications.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="divide-y divide-slate-200">
          {applications.length === 0 ? (
            <p className="p-4 text-center text-slate-500">You haven't applied to any jobs yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app.application_id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-dark">{app.job.title}</p>
                  <p className="text-sm text-slate-600">{app.job.company_name} • {app.job.location || 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Applied on: {new Date(app.applied_on).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(app.status)}`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}