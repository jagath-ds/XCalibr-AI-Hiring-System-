// ApplicantsPage.jsx

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom"; // <-- 1. Import useOutletContext
import { getJobsByHr, getRankedApplicantsForJob, retryAnalysis } from "../api/api";
import ApplicantModal from "../components/ApplicantModal";
import { FiLoader, FiRefreshCw } from "react-icons/fi";

export default function ApplicantsPage() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicantData, setSelectedApplicantData] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- 2. Get user data from the parent layout ---
  const { user } = useOutletContext();
  const hr_id = user?.hr_id; // Get the hr_id from the user object

  // Fetch HR's jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!hr_id) {
        console.error("No HR ID found"); // This is the error from your log
        return;
      }
      try {
        const myJobs = await getJobsByHr(hr_id); // Uses HrAPI
        setJobs(myJobs);
        if (myJobs.length > 0) {
          handleJobSelect(myJobs[0].job_id, myJobs[0].title);
        }
      } catch (err) { console.error("Failed to fetch jobs:", err); }
    };
    fetchJobs();
  }, [hr_id]); // Dependency array is correct

  // Fetches and displays applicants (unchanged, but now uses HrAPI)
  const handleJobSelect = async (jobId, jobTitle) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setIsLoading(true);
    setApplicants([]);
    try {
      const res = await getRankedApplicantsForJob(jobId);
      setApplicants(res.rankings || []);
    } catch (err) {
      console.error(`Failed to fetch applicants for job ${jobId}:`, err);
      alert("Failed to load applicants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze pending (unchanged, but now uses HrAPI)
  const handleAnalyzePending = async () => {
    if (!selectedJobId) return;
    const appsToRetry = applicants.filter(
      (app) => app.analysis_status === 'Pending' || app.analysis_status === 'Failed'
    );
    if (appsToRetry.length === 0) {
      alert("No pending or failed analyses found for this job. Use Refresh to get latest data.");
      return;
    }

    setIsAnalyzing(true);
    let successCount = 0;
    let errorCount = 0;
    for (const app of appsToRetry) {
      try {
        await retryAnalysis(app.application_id);
        successCount++;
      } catch (err) {
        console.error(`Failed to retry analysis for app ${app.application_id}:`, err);
        errorCount++;
      }
    }
    setIsAnalyzing(false);
    
    let alertMessage = "";
    if (successCount > 0) {
      alertMessage += `Analysis successfully re-triggered for ${successCount} applicant(s). `;
    }
    if (errorCount > 0) {
      alertMessage += `${errorCount} failed to retry. Check console for errors.`;
    }
    alert(alertMessage);

    if (successCount > 0) {
      setTimeout(() => {
        handleJobSelect(selectedJobId, selectedJobTitle);
      }, 2000);
    }
  };

  // Refresh list (unchanged)
  const handleRefreshList = () => {
    if (selectedJobId) {
      handleJobSelect(selectedJobId, selectedJobTitle);
    }
  }

  // --- 3. Render guard (unchanged from your file) ---
  if (!hr_id) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">No HR ID found. Please log in again.</p>
        </div>
      </div>
    );
  }

  // --- 4. Main component render (unchanged from your file) ---
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-dark">Applicants</h1>

      {/* Job Selector Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-dark mb-4">Select a Job</h3>
        {jobs.length === 0 ? (
          <p className="text-slate-500">No job postings found. Create a job first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map((job) => (
              <button
                key={job.job_id}
                onClick={() => handleJobSelect(job.job_id, job.title)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  selectedJobId === job.job_id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="font-semibold text-dark">{job.title}</p>
                <p className="text-sm text-slate-500 mt-1">{job.company_name}</p>
                <p className="text-xs text-slate-400 mt-1">{job.location}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Applicants List Card */}
      {selectedJobId && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-dark">Applicants for: {selectedJobTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">Job ID: {selectedJobId}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshList}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white font-bold rounded-lg hover:bg-slate-600 disabled:bg-slate-300 transition"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''}/> Refresh List
              </button>
              <button
                onClick={handleAnalyzePending}
                disabled={isAnalyzing || isLoading || applicants.filter(a => a.analysis_status === 'Pending' || a.analysis_status === 'Failed').length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                title={applicants.filter(a => a.analysis_status === 'Pending' || a.analysis_status === 'Failed').length === 0 ? "No pending or failed analyses for this job" : "Trigger analysis for pending/failed applicants"}
              >
                {isAnalyzing ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Pending/Failed'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8"> <FiLoader className="animate-spin text-3xl text-primary" /> </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {applicants.length > 0 ? (
                applicants.map((app) => (
                  <div key={app.application_id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      {app.rank && (
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg text-white ${
                          app.rank === 1 ? 'bg-yellow-400' :
                          app.rank === 2 ? 'bg-slate-400' :
                          app.rank === 3 ? 'bg-yellow-600' : 'bg-slate-300'
                        }`}>
                          {app.rank}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-dark">{app.candidate_name}</p>
                        <p className="text-sm text-slate-500">{app.candidate_email}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Applied: {new Date(app.applied_on).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {app.analysis_status === 'Completed' && app.overall_score != null ? (
                        <div className="text-center">
                          <p className="font-bold text-2xl text-primary">{app.overall_score}</p>
                          <p className="text-xs text-slate-500">Overall Score</p>
                        </div>
                      ) : (
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          app.analysis_status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                          app.analysis_status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                          app.analysis_status === 'Failed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.analysis_status}
                        </span>
                      )}
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => setSelectedApplicantData(app)}
                          className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center p-8 text-slate-500">No applicants found for this job yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedApplicantData && (
        <ApplicantModal
          applicantData={selectedApplicantData}
          onClose={() => setSelectedApplicantData(null)}
        />
      )}
    </div>
  );
}