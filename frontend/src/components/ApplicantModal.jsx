// src/components/ApplicantModal.jsx
import { useState, useEffect } from 'react';
// Import API function if needed later for full details
// import { getCandidateProfile } from '../api/api';

// Accept 'applicantData' prop which contains ranked info
export default function ApplicantModal({ applicantData, onClose }) {
  // If no data is passed, don't render anything
  if (!applicantData) return null;

  // Helper function to extract filename from a path
  const getFileName = (path) => {
    if (!path) return "N/A";
    try {
      // Basic split for / or \ separators
      return path.split('/').pop() || path.split('\\').pop() || "View File";
    } catch {
      return "View File"; // Fallback
    }
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Modal content card */}
      <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
           <h3 className="text-2xl font-bold text-gray-800">
             Applicant Details
           </h3>
           {/* Close button (top right) */}
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3 text-sm text-gray-700">
          {/* Basic Info from ranking data */}
          <p><strong>Name:</strong> {applicantData.candidate_name || "N/A"}</p>
          <p><strong>Email:</strong> {applicantData.candidate_email || "N/A"}</p>
          <p><strong>Application ID:</strong> {applicantData.application_id}</p>
          <p><strong>Applied On:</strong> {new Date(applicantData.applied_on).toLocaleString()}</p>
          {/* Analysis Status with badge */}
          <p><strong>Analysis Status:</strong>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
               applicantData.analysis_status === 'Completed' ? 'bg-green-100 text-green-800' :
               applicantData.analysis_status === 'Pending' ? 'bg-blue-100 text-blue-800' :
               applicantData.analysis_status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
               applicantData.analysis_status === 'Failed' ? 'bg-red-100 text-red-800' :
               'bg-slate-100 text-slate-700' // Default
            }`}>
              {applicantData.analysis_status}
            </span>
          </p>

          {/* Scores Section */}
          <h4 className="font-semibold text-base pt-3 border-t mt-4 mb-2">Scores</h4>
          <p>
            <strong>Overall Score:</strong>{" "}
            <span className="font-bold text-base text-primary">{applicantData.overall_score ?? "N/A"}</span>
          </p>
          <p><strong>Career Readiness:</strong> {applicantData.careerscore ?? "N/A"}</p>
          <p><strong>JD Match Score:</strong> {applicantData.jd_match_score ?? "N/A"}</p>
          <p><strong>GitHub Score:</strong> {applicantData.githubscore ?? "N/A"}</p>
          <p><strong>Trust Score:</strong> {applicantData.trustscore ?? "N/A"}</p>

          {/* Profile Links & Resume Section */}
          <h4 className="font-semibold text-base pt-3 border-t mt-4 mb-2">Profile Links & Resume</h4>
          {/* Display Submitted Resume Link */}
          {applicantData.cv_path ? (
               <p>
                 <strong>Submitted Resume:</strong>{" "}
                 {/* Link assumes backend serves files from /static */}
                 <a href={`http://127.0.0.1:8000/${applicantData.cv_path}`}
                    target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    {getFileName(applicantData.cv_path)}
                 </a>
               </p>
           ) : (
              <p><strong>Submitted Resume:</strong> Path not available in data</p>
           )}

          {/* Placeholder for details needing full profile fetch */}
          {/* You would fetch fullProfile using applicantData.candid (if available) */}
          <p className="text-xs text-gray-500 italic mt-2">
            (Phone, GitHub/LinkedIn links require fetching full candidate profile)
          </p>
          {/* Example: <p><strong>Phone:</strong> {fullProfile?.contactinfo || "N/A"}</p> */}

        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}