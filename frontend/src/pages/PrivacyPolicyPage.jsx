// src/pages/PrivacyPolicyPage.jsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="bg-slate-800 p-8 rounded-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Your privacy is important to us. It is X Calibr's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>
          
          <h2 className="text-2xl font-bold mt-8">1. Information We Collect</h2>
          <p className="mt-4 text-slate-300">
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
          
          <p className="mt-8 text-slate-400">
            This is a placeholder privacy policy. You must replace this with your own official privacy policy.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}