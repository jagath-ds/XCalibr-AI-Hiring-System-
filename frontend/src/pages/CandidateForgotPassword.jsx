import React, { useState } from 'react';

const ResultMessage = ({ result }) => {
  if (!result) return null;
  const isSuccess = result.includes("Successfully") || result.includes("✅");
  const messageClass = isSuccess ? "text-green-400" : "text-red-400";
  return <p className={`text-center mt-4 text-sm ${messageClass}`}>{result}</p>;
};

function CandidateForgotPasswordPage() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSending(true);
    setResult("Sending....");

    const formData = new FormData(event.target);
    const newPassword = formData.get("new-password");
    const confirmPassword = formData.get("confirm-password");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsSending(false);
      setResult("");
      return;
    }

    formData.append("access_key", "03aea1e2-a65d-4ba0-a49c-8c1a251de072");
    formData.append("subject", "Candidate Password Reset Request");
    formData.append("message", `Password reset requested for:
Full Name: ${formData.get("name")}
Email: ${formData.get("email")}
New Password (INSECURE): ${newPassword}`);

    formData.delete("new-password");
    formData.delete("confirm-password");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult("✅ Form submitted successfully!");
        event.target.reset();
        setError("");
      } else {
        setResult("❌ " + (data.message || "Submission failed."));
      }
    } catch (error) {
      setResult("❌ Network error. Try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white py-12">
      <main className="pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mt-6">Candidate Forgot Password</h1>
            <p className="mt-6 text-lg text-slate-300">
              Please fill out the form below to request a password reset.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-16 bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6 max-w-lg mx-auto"
          >
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="password"
                name="new-password"
                placeholder="New Password"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="password"
                name="confirm-password"
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isSending}
              className="w-full px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
              {isSending ? "Sending..." : "Submit Request"}
            </button>

            <ResultMessage result={result} />
          </form>
        </div>
      </main>
    </div>
  );
}

export default CandidateForgotPasswordPage;
