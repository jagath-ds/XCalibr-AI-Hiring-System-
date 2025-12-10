// src/pages/TermsOfServicePage.jsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="bg-slate-800 p-8 rounded-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6">
            Terms of Service
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Please read these terms of service ("Terms", "Terms of Service") carefully before using the X Calibr website (the "Service") operated by X Calibr ("us", "we", or "our").
          </p>
          
          <h2 className="text-2xl font-bold mt-8">1. Conditions of Use</h2>
          <p className="mt-4 text-slate-300">
            We will provide our services to you, which are subject to the conditions stated below in this document. Every time you visit this website, use its services or make a purchase, you accept the following conditions. This is why we urge you to read them carefully.
          </p>
          
          <p className="mt-8 text-slate-400">
            This is a placeholder terms of service document. You must replace this with your own official terms.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}