// src/pages/RecruiterDashboard.jsx

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  getDashboardKpis,
  getDashboardJobSummaries,
  getDashboardApplicantVolume,
} from "../api/api";
import { FiLoader, FiBriefcase, FiUsers, FiClock, FiAlertCircle, FiBarChart2 } from "react-icons/fi";
import ApplicantVolumeChart from "../components/ApplicantVolumeChart";

// A small component for the KPI cards
const KpiCard = ({ title, value, icon, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {loading ? (
        <FiLoader className="animate-spin text-2xl text-primary mt-2" />
      ) : (
        <p className="text-3xl font-bold text-dark mt-1">{value}</p>
      )}
    </div>
    <div className="p-3 bg-green-100 rounded-lg text-primary">
      {icon}
    </div>
  </div>
);

export default function RecruiterDashboard() {
  const [kpis, setKpis] = useState(null);
  const [jobSummaries, setJobSummaries] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.hr_id) {
        setError("Could not load HR user data. Please try logging in again.");
        setLoading(false);
        return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all three endpoints in parallel
        const [kpiData, summaryData, volumeData] = await Promise.all([
          getDashboardKpis(),
          getDashboardJobSummaries(),
          getDashboardApplicantVolume(),
        ]);

        setKpis(kpiData);
        setJobSummaries(summaryData);
        setVolumeData(volumeData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // Re-run if user context changes

  // Handle clicking a job
  const handleViewApplicants = (job_id) => {
    // Navigate to the Applicants page, passing the job_id
    navigate('/recruiter/applicants', { state: { preSelectedJobId: job_id } });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-dark">Recruiter Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p>{error}</p>
        </div>
      )}

      {/* --- 1. KPI Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Active Jobs"
          value={kpis?.active_jobs ?? 0}
          icon={<FiBriefcase size={22} />}
          loading={loading}
        />
        <KpiCard
          title="Total Applicants"
          value={kpis?.total_applicants ?? 0}
          icon={<FiUsers size={22} />}
          loading={loading}
        />
        <KpiCard
          title="New (Last 7 Days)"
          value={kpis?.new_applicants_weekly ?? 0}
          icon={<FiClock size={22} />}
          loading={loading}
        />
        <KpiCard
          title="Analyses Pending"
          value={kpis?.pending_analyses ?? 0}
          icon={<FiAlertCircle size={22} />}
          loading={loading}
        />
      </div>

      {/* --- 2. Main Dashboard Layout (Table + Chart) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job Postings Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Job Postings Overview</h3>
          {loading ? (
             <div className="flex justify-center items-center p-8">
                <FiLoader className="animate-spin text-3xl text-primary" />
             </div>
          ) : jobSummaries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">You have not posted any jobs yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">New</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pending</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {jobSummaries.map((job) => (
                    <tr key={job.job_id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-sm text-dark">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company_name} • {job.status}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-medium">{job.total_applicants}</td>
                      <td className="px-4 py-4 text-sm">
                        {job.new_applicants > 0 ? (
                          <span className="font-medium text-green-600">
                            {job.new_applicants} New
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {job.pending_analyses > 0 ? (
                          <span className="font-medium text-red-600">
                            {job.pending_analyses} Pending
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewApplicants(job.job_id)}
                          className="px-3 py-1.5 bg-slate-100 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Applicant Volume Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           <ApplicantVolumeChart chartData={volumeData} loading={loading} />
        </div>

      </div>
    </div>
  );
}