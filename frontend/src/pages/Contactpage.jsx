// src/pages/ContactPage.jsx
import React, { useState } from 'react';
// 1. Uncommented your Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [result, setResult] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setResult("Sending....");
    const formData = new FormData(event.target);
    
    // Your Web3Forms Access Key
    formData.append("access_key", "94629216-0eeb-4bd4-b004-f41e21624c12");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully!");
        event.target.reset(); // Clear the form
      } else {
        console.error("Error from Web3Forms:", data);
        setResult(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setResult("An error occurred while submitting the form.");
    } finally {
      setIsSending(false); // Re-enable the button
      // Hide the message after 5 seconds
      setTimeout(() => {
        setResult("");
      }, 5000);
    }
  };

  // Helper component to display the status message
  const ResultMessage = () => {
    if (!result) return null;
    
    const isSuccess = result.includes("Successfully");
    const messageClass = isSuccess 
      ? "text-green-400" // Success color
      : "text-red-400";   // Error color

    // --- 2. THIS IS THE FIX ---
    // Added backticks (`) inside the curly braces {}
    return (
      <p className={`text-center mt-4 text-sm ${messageClass}`}>
        {result}
      </p>
    );
    // --- END OF FIX ---
  };

  return (
    <div className="bg-slate-900 text-white">
      {/* 3. Uncommented the component */}
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6">
              Get in Touch
            </h1>
            <p className="mt-6 mx-auto text-lg text-slate-300">
              Have questions about our platform or enterprise plans? We'd
              love to hear from you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-16 bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name" // REQUIRED for Web3Forms
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email" // REQUIRED for Web3Forms
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject" // REQUIRED for Web3Forms
                required
                className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message" // REQUIRED for Web3Forms
                rows="5"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSending} // Disables button while sending
              className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
            
            {/* Display the success or error message here */}
            <ResultMessage />

          </form>
        </div>
      </main>
      {/* 4. Uncommented the component */}
      <Footer />
    </div>
  );
}