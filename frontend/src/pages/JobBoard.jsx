import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import { FiSearch, FiXCircle, FiLoader } from "react-icons/fi";
import { getJobs, createApplication, getMe } from "../api/api";

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);

  // Filter Handlers (No changes)
  const handleLocationChange = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };
  const handleJobTypeChange = (type) => {
    setSelectedJobTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  const handleClearFilters = () => {
    setSearch("");
    setSelectedLocations([]);
    setSelectedJobTypes([]);
  };

  // Fetch jobs and user profile
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobsRes = await getJobs();
        setJobs(jobsRes);
        const uniqueLocations = [...new Set(jobsRes.map(job => job.location).filter(Boolean))];
        const uniqueJobTypes = [...new Set(jobsRes.map(job => job.employment_type).filter(Boolean))];
        setLocations(uniqueLocations);
        setJobTypes(uniqueJobTypes);

        try {
          const profileRes = await getMe();
          setCandidateProfile(profileRes);
        } catch (profileErr) {
          console.log("User is not logged in or token is invalid.");
          setCandidateProfile(null);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters (No changes)
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(job.location);
    const matchesJobType =
      selectedJobTypes.length === 0 || selectedJobTypes.includes(job.employment_type);
    return matchesSearch && matchesLocation && matchesJobType;
  });

  // --- THIS IS THE FIX for the 422 Error ---
  const handleApply = async (job, selectedCvFile) => {
    if (!candidateProfile) {
      alert("Please log in first!");
      return;
    }

    const candid = candidateProfile.candid;
    if (isNaN(candid)) {
      alert("Invalid user ID. Please log in again.");
      return;
    }

    const defaultResumeName = candidateProfile?.resumelink?.split('/').pop() || 'No profile resume found';
    const resumeToUse = selectedCvFile ? selectedCvFile.name : defaultResumeName;
    const confirmApply = window.confirm(
      `Apply for "${job.title}" using resume: "${resumeToUse}"?`
    );

    if (!confirmApply) {
      return; // User cancelled
    }

    console.log(`Applying to job ${job.job_id} with file:`, selectedCvFile?.name || "using profile resume");

    // --- BUILD THE FORMDATA OBJECT ---
    const formData = new FormData();
    formData.append("candid", candid);
    formData.append("job_id", job.job_id);
    
    // Append the file ONLY if a new one is selected
    if (selectedCvFile) {
      formData.append("cv_file", selectedCvFile);
    }
    // If selectedCvFile is null, the backend will use the candidate's default resumelink

    try {
      // Pass the single FormData object to the API
      await createApplication(formData); 
      alert(`Successfully applied for ${job.title}! Analysis is in progress.`);
    } catch (err) {
      console.error("Error applying for job:", err);
      // The [object Object] error was because the error itself was being put in the alert.
      // This now correctly shows the error detail from the server.
      alert(`Failed to apply: ${err.response?.data?.detail || err.message || "An unknown error occurred."}`);
    }
  };
  // --- END OF FIX ---


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark">Job Board</h1>
        <p className="mt-1 text-slate-500">
          Discover and apply to exciting job opportunities
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="relative">
            <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or description..."
              className="w-full rounded-lg border-slate-300 py-3 pl-10 pr-4"
            />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-600">Locations:</span>
            {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedLocations.includes(loc)
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                > {loc} </button>
            ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-600">Job Types:</span>
            {jobTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleJobTypeChange(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedJobTypes.includes(type)
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                > {type} </button>
            ))}
        </div>
        {(selectedLocations.length > 0 || selectedJobTypes.length > 0 || search) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary hover:underline"
          > <FiXCircle /> Clear All Filters </button>
        )}
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.job_id}
              job={job}
              defaultResumeLink={candidateProfile?.resumelink || null}
              onApply={(selectedFile) => handleApply(job, selectedFile)}
            />
          ))
        ) : (
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <p className="font-semibold text-slate-600">No jobs found matching your criteria.</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}