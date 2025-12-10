import { useState } from "react";
import { createJob } from "../api/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiCalendar, FiCpu } from "react-icons/fi"; // Import icons

// A simple, self-contained toggle switch component
function ToggleSwitch({ label, isEnabled, onToggle }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="font-medium text-slate-700">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          isEnabled ? "bg-primary" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            isEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={isEnabled}
        onChange={onToggle}
      />
    </label>
  );
}

export default function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const hr_id = user?.hr_id;

  // --- 1. OLD State ---
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");

  // --- 2. NEW State (Deadline & Toggles) ---
  const [deadline, setDeadline] = useState("");
  const [analyzeGithub, setAnalyzeGithub] = useState(true);
  const [analyzeLeetcode, setAnalyzeLeetcode] = useState(true);
  const [analyzeLinkedin, setAnalyzeLinkedin] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hr_id) {
      alert("You must be logged in to post a job.");
      setIsSubmitting(false);
      return;
    }

    // --- 3. NEW JobData object ---
    // Includes deadline and analysis toggles
    const jobData = {
      hr_id: parseInt(hr_id),
      title: title.trim(),
      company_name: company.trim(),
      location: location.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      salary_range: salaryRange.trim(),
      employment_type: employmentType,
      deadline: deadline ? deadline : null, // Send null if empty
      analyze_github: analyzeGithub,
      analyze_leetcode: analyzeLeetcode,
      analyze_linkedin: analyzeLinkedin,
    };

    try {
      const res = await createJob(jobData);
      if (res && res.job_id) {
        alert("Job posted successfully!");
        navigate("/recruiter/dashboard");
      } else {
        alert("Failed to post job. Try again.");
      }
    } catch (err) {
      console.error("Post job error:", err);
      const errorMsg =
        err.response?.data?.detail || "Failed to post job. Check console.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. NEW JSX Layout ---
  return (
    // --- THIS IS THE FIX ---
    // Added 'mx-auto' to center the container
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-dark">Post a New Job</h1>
      <p className="mt-1 text-slate-500">
        Create a new job listing to attract talent.
      </p>

      <form onSubmit={handlePostJob}>
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="space-y-6">
            {/* --- Main Details --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input
                name="title"
                placeholder="e.g., Senior Full-Stack Developer"
                className="w-full p-3 border border-slate-300 rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                name="company"
                placeholder="e.g., TechFlow Dynamics"
                className="w-full p-3 border border-slate-300 rounded-lg"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job Description (Markdown supported)"
                className="w-full p-3 border border-slate-300 rounded-lg"
                rows={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Requirements (e.g., Python, React, SQL...)"
                className="w-full p-3 border border-slate-300 rounded-lg"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* --- Job Details & AI Settings (Two-Column Layout) --- */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Job Details */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
              <FiCalendar /> Job Details
            </h3>
            <div className="space-y-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                <input
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g., $140k - $180k"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  name="location"
                  placeholder="e.g., Remote or Kochi, Kerala"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Column 2: AI Settings */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
              <FiCpu /> AI Analysis Settings
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Select which candidate profiles to analyze for this job.
            </p>
            <div className="space-y-5 mt-6">
              <ToggleSwitch
                label="Analyze GitHub Profile"
                isEnabled={analyzeGithub}
                onToggle={() => setAnalyzeGithub(!analyzeGithub)}
              />
              <ToggleSwitch
                label="Analyze LeetCode Profile"
                isEnabled={analyzeLeetcode}
                onToggle={() => setAnalyzeLeetcode(!analyzeLeetcode)}
              />
              <ToggleSwitch
                label="Analyze LinkedIn PDF"
                isEnabled={analyzeLinkedin}
                onToggle={() => setAnalyzeLinkedin(!analyzeLinkedin)}
              />
            </div>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-primary text-white font-bold text-lg rounded-lg hover:bg-primary-dark disabled:bg-slate-400"
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}