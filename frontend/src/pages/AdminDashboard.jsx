// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiUsers, FiAlertCircle, FiLoader } from "react-icons/fi"; 
import ApplicantVolumeChart from "../components/ApplicantVolumeChart"; 
import { getAdminDashboardKpis, getAdminHrActivity } from '../api/api'; 
// import { useNavigate } from 'react-router-dom'; // <-- Removed, no longer needed

// --- 1. KPI Card Component (UNCHANGED) ---
const KpiCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-dark mt-1">{value}</p>
    </div>
    <div className="p-3 bg-green-100 rounded-lg text-primary">
      {icon}
    </div>
  </div>
);

// --- 2. The Dashboard Component (DYNAMIC DATA) ---
export default function AdminDashboard() {
  // const navigate = useNavigate(); // <-- Removed, no longer needed
  const [kpis, setKpis] = useState({
    total_hr_users: 0, total_candidates: 0, total_active_jobs: 0, pending_analyses: 0
  });
  const [hrData, setHrData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, hrRes] = await Promise.all([
          getAdminDashboardKpis(),
          getAdminHrActivity()
        ]);
        
        // Map KPI data
        setKpis({
            total_hr_users: kpiRes.total_hr_users,
            total_candidates: kpiRes.total_candidates,
            total_active_jobs: kpiRes.total_active_jobs,
            pending_analyses: kpiRes.pending_analyses,
        });
        
        // Map Volume data
        setVolumeData(kpiRes.applicant_volume); 
        
        // Set HR Activity data
        setHrData(hrRes);
        
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        setError("Failed to load dashboard data. Check backend and API connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <FiLoader className="animate-spin text-4xl text-green-600" />
        </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 bg-red-100 border border-red-200 rounded-lg">{error}</div>
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
      
      {/* --- KPI Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total HR Users"
          value={kpis.total_hr_users}
          icon={<FiUsers size={22} />}
        />
        <KpiCard
          title="Total Candidates"
          value={kpis.total_candidates}
          icon={<FiUsers size={22} />}
        />
        <KpiCard
          title="Total Active Jobs"
          value={kpis.total_active_jobs}
          icon={<FiBriefcase size={22} />}
        />
        <KpiCard
          title="Analyses Pending"
          value={kpis.pending_analyses}
          icon={<FiAlertCircle size={22} />}
        />
      </div>

      {/* --- Main Dashboard Layout (Table + Chart) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: HR Activity Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-dark mb-4">HR Activity Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">HR Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Active Jobs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Applicants</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pending</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th> <-- Removed Header */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {hrData.map((hr) => (
                  <tr key={hr.hr_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-sm text-dark">{hr.firstname} {hr.lastname}</p>
                      <p className="text-xs text-slate-500">{hr.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        hr.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hr.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-medium">{hr.total_active_jobs}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-medium">{hr.total_applicants}</td>
                    <td className="px-4 py-4 text-sm">
                      {hr.pending_analyses > 0 ? (
                        <span className="font-medium text-red-600">
                          {hr.pending_analyses} Pending
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    {/* --- Removed Button Cell ---
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleManageUser(hr.hr_id)}
                        className="px-3 py-1.5 bg-slate-100 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
                      >
                        Manage
                      </button>
                    </td>
                    */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Applicant Volume Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <ApplicantVolumeChart chartData={volumeData} loading={loading} />
        </div>

      </div>
    </div>
  );
}