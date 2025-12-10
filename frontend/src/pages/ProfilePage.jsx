import { useState, useEffect, useRef } from "react";
// Import the API functions
import {
  getMe,
  updateCandidateProfile,
  uploadCandidateResume,
  uploadCandidateLinkedinPdf,
} from "../api/api";
import { FiUser, FiBriefcase, FiUploadCloud, FiLink } from "react-icons/fi";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [leetcodeLink, setLeetcodeLink] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");

  // State for Master Resume file handling
  const [resumeFileName, setResumeFileName] = useState("");
  const fileInputRef = useRef(null);

  // State for LinkedIn PDF file handling
  const [linkedinPdfFileName, setLinkedinPdfFileName] = useState("");
  const linkedinFileInputRef = useRef(null);

  // Fetch initial profile data on component mount
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        const data = await getMe(); // Fetch data for the logged-in user

        // Populate state variables with fetched data
        setFirstName(data.firstname || "");
        setLastName(data.lastname || "");
        setEmail(data.email || "");
        setPhone(data.contactinfo || "");
        setGithubLink(data.github_link || "");
        setLeetcodeLink(data.leetcode_link || "");
        setCurrentTitle(data.current_title || "");
        setExperience(data.years_of_experience || "");
        setSummary(data.professional_summary || "");
        setSkills(data.skills || "");

        // Display the name of the uploaded resume file
        setResumeFileName(
          data.resumelink ? data.resumelink.split("/").pop() : "No resume uploaded"
        );

        // Display the name of the uploaded LinkedIn PDF file
        setLinkedinPdfFileName(
          data.linkedin_pdf_link
            ? data.linkedin_pdf_link.split("/").pop()
            : "No LinkedIn PDF uploaded"
        );

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch candidate data:", error);
        setError("Failed to load profile. Please try refreshing.");
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []); // Empty dependency array means this runs only once on mount

  // Handle saving all profile changes
  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Gather all data to send to the backend
    const allProfileData = {
      firstname: firstName, // Now sending firstname
      lastname: lastName,   // Now sending lastname
      email: email,       // Now sending email
      contactinfo: phone,
      github_link: githubLink,
      leetcode_link: leetcodeLink,
      current_title: currentTitle,
      years_of_experience: experience,
      professional_summary: summary,
      skills: skills,
    };

    try {
      // Call the API function to update the profile
      await updateCandidateProfile(allProfileData);
      alert("Profile updated successfully!"); 
    } catch (error) {
      console.error("Error updating profile:", error);
      // Display specific error message from backend if available
      const errorMessage = error.response?.data?.detail || "Failed to update profile.";
      alert(`Error: ${errorMessage}`); 
    }
  };

  // --- Handlers for Resume Upload ---
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setResumeFileName(file.name); // Update displayed file name
      handleResumeUpload(file);     // Immediately start the upload process
    }
  };

  const handleResumeUpload = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload); // Append file to form data

    try {
      // Call the API function to upload the resume
      const data = await uploadCandidateResume(formData);
      alert("Resume uploaded successfully!");
      // Update the displayed file name from the server response
      setResumeFileName(
        data.resumelink ? data.resumelink.split("/").pop() : "No resume uploaded"
      );
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload resume.");
      setResumeFileName("Upload failed. Please try again."); // Indicate failure
    }
  };

  // --- Handlers for LinkedIn PDF Upload ---
  const handleLinkedinFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setLinkedinPdfFileName(file.name); // Update displayed file name
      handleLinkedinPdfUpload(file);     // Immediately start the upload process
    }
  };

  const handleLinkedinPdfUpload = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload); // Append file to form data

    try {
      // Call the API function to upload the LinkedIn PDF
      const data = await uploadCandidateLinkedinPdf(formData);
      alert("LinkedIn PDF uploaded successfully!");
      // Update the displayed file name from the server response
      setLinkedinPdfFileName(
        data.linkedin_pdf_link
          ? data.linkedin_pdf_link.split("/").pop()
          : "No LinkedIn PDF uploaded"
      );
    } catch (error) {
      console.error("Error uploading LinkedIn PDF:", error);
      alert("Failed to upload LinkedIn PDF.");
      setLinkedinPdfFileName("Upload failed. Please try again."); // Indicate failure
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return <div className="p-8 text-center">Loading Profile...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  // --- Render the Profile Form ---
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark">My Profile</h1>
        <p className="mt-1 text-slate-500">
          Manage your profile information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">

          {/* Personal Information Card - Now Fully Editable */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-4">
              <FiUser /> Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} // Make editable
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" // Editable style
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)} // Make editable
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" // Editable style
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Make editable
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" // Editable style
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                <PhoneInput
                  id="phone"
                  defaultCountry="IN" // Set a default country
                  placeholder="Enter phone number"
                  value={phone} // Use the 'phone' state
                  onChange={setPhone} // Update the 'phone' state
                  className="phone-input-custom-wrapper" // Custom class for styling
                />
              </div>
            </div>
          </div>

          {/* Online Presence Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-4">
              <FiLink /> Online Presence
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="githubLink"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="githubLink"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="leetcodeLink"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  LeetCode Profile
                </label>
                <input
                  type="url"
                  id="leetcodeLink"
                  value={leetcodeLink}
                  onChange={(e) => setLeetcodeLink(e.target.value)}
                  placeholder="https://leetcode.com/..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Resume & Documents Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-4">
              <FiUploadCloud /> Resume & Documents
            </h3>

            {/* Master Resume Upload Section */}
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <div className="w-16 h-16 rounded-full bg-green-100 text-primary flex items-center justify-center mb-4">
                <FiUploadCloud size={28} />
              </div>
              <h4 className="font-bold text-dark">Upload your resume</h4>
              <p className="text-slate-500 text-sm mt-1 truncate w-full">
                {resumeFileName || "Drag and drop or click below"}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-200"
              >
                Choose File
              </button>
            </div>

            {/* LinkedIn PDF Upload Section */}
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl text-center mt-6">
              <input
                type="file"
                ref={linkedinFileInputRef}
                onChange={handleLinkedinFileChange}
                className="hidden"
                accept=".pdf"
              />
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <FiUploadCloud size={28} />
              </div>
              <h4 className="font-bold text-dark">Upload your LinkedIn PDF</h4>
              <p className="text-slate-500 text-sm mt-1 truncate w-full">
                {linkedinPdfFileName || "Go to LinkedIn > More > Save to PDF"}
              </p>
              <button
                type="button"
                onClick={() => linkedinFileInputRef.current && linkedinFileInputRef.current.click()}
                className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-200"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Summary Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-4">
              <FiBriefcase /> Professional Summary
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentTitle"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Current Title
                </label>
                <input
                  type="text"
                  id="currentTitle"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Years of Experience
                </label>
                {/* Experience Dropdown with 0-1 years option */}
                <select
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Select experience</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Professional Summary
                </label>
                <textarea
                  id="summary"
                  rows="4"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief summary..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark text-lg"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </form>
  );
}