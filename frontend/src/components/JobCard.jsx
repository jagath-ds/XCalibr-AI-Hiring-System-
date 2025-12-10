// src/components/JobCard.jsx
import { useState, useRef } from 'react';
import { FiUploadCloud } from "react-icons/fi"; // For file input icon

// Accept defaultResumeLink and updated onApply function as props
export default function JobCard({ job, defaultResumeLink, onApply }) {
  const [selectedCvFile, setSelectedCvFile] = useState(null); // State for the selected file
  const [isApplying, setIsApplying] = useState(false); // State to show loading/disabled on apply button
  const fileInputRef = useRef(null); // Ref to trigger file input click

  // Extract filename from the default resume link path
  const defaultResumeName = defaultResumeLink ? defaultResumeLink.split('/').pop() : "No profile resume";

  // Handle file selection from the input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic validation (optional: check file type/size)
      if (file.type !== "application/pdf") {
         alert("Please select a PDF file.");
         // Clear the input value if invalid
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }
      setSelectedCvFile(file);
    } else {
      setSelectedCvFile(null); // Clear selection if user cancels
    }
  };

  // Handle the Apply button click
  const handleApplyClick = async () => {
    setIsApplying(true); // Disable button, show loading maybe
    // Call the onApply function passed from JobBoard,
    // sending the selected file (or null if none selected)
    try {
        await onApply(selectedCvFile); // Pass the File object or null
        // Optionally: Show a success state on the card itself
    } catch (error) {
        // Error is handled and alerted in JobBoard's handleApply
        console.error("Apply failed in JobCard:", error);
    } finally {
        setIsApplying(false); // Re-enable button
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">

      {/* Job Info Section (Top part) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        {/* Job Details */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
          <p className="text-slate-600 mt-1 text-sm">{job.company_name} - {job.location || "Location N/A"}</p>
          <p className="text-xs text-slate-400 mt-1">
            Type: {job.employment_type || "N/A"} | Posted: {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : "N/A"}
          </p>
          {/* Consider adding a toggle/link to view full description/requirements */}
          <p className="text-slate-500 mt-2 text-sm line-clamp-2">{job.description}</p>
        </div>

        {/* Original Simple Apply Button (removed or commented out) */}
        {/*
        <button
          onClick={() => onApply(job)} // Old way: passing job object
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-150 flex-shrink-0"
        > Apply </button>
        */}
      </div>

      {/* Resume Selection & Apply Section (Bottom part) */}
      <div className="w-full border-t border-slate-200 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* File Input and Info */}
        <div className="flex-1 min-w-0"> {/* Added min-w-0 for better wrapping */}
           <label className="text-sm font-medium text-slate-600 block mb-1">Select Resume for this Application:</label>
           <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-2 bg-slate-50">
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" // Hide default input
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()} // Trigger hidden input
                    className="px-3 py-1 bg-white border border-slate-400 text-slate-700 rounded text-sm hover:bg-slate-100 whitespace-nowrap"
                 >
                     <FiUploadCloud className="inline mr-1" /> Choose File...
                </button>
                <span className="text-sm text-slate-500 truncate" title={selectedCvFile ? selectedCvFile.name : `Using profile resume: ${defaultResumeName}`}>
                    {/* Show selected file or default */}
                    {selectedCvFile
                     ? selectedCvFile.name
                     : `Using profile resume: ${defaultResumeName}`
                    }
                </span>
                {/* Button to clear selection and revert to default */}
                {selectedCvFile && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCvFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input value
                        }}
                        className="text-xs text-red-500 hover:text-red-700 ml-auto flex-shrink-0"
                        title="Use profile resume instead"
                    >
                        Clear
                    </button>
                )}
           </div>
           {!defaultResumeLink && !selectedCvFile && (
               <p className="text-xs text-red-500 mt-1">Warning: No profile resume found. Please upload one here or to your profile.</p>
           )}
        </div>

        {/* Apply Button (New) */}
        <button
          onClick={handleApplyClick} // Call the card's handler
          disabled={isApplying || (!defaultResumeLink && !selectedCvFile)} // Disable if applying or no resume available
          className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition duration-150 flex-shrink-0 disabled:bg-slate-400 disabled:cursor-not-allowed w-full md:w-auto"
          title={!defaultResumeLink && !selectedCvFile ? "Please select a resume or add one to your profile" : ""}
        >
          {isApplying ? "Applying..." : "Apply Now"}
        </button>
      </div>

    </div>
  );
}