import { useState } from "react";

export default function UploadForm({ onSubmit }) {
  const [resume, setResume] = useState(null);
  const [sop, setSop] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resume) {
      alert("A resume is required to submit your application.");
      return;
    }
    onSubmit({ resume, sop });
    // Clear form after submission
    e.target.reset();
    setResume(null);
    setSop(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6"
    >
      <h3 className="text-xl font-bold text-gray-900">Upload Your Documents</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume / CV <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setResume(e.target.files[0])}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statement of Purpose (Optional)
          </label>
          <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setSop(e.target.files[0])}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Upload & Submit
      </button>
    </form>
  );
}