// src/pages/AboutPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="bg-slate-900 text-white">
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6">
              About X CALIBR
            </h1>
            <p className="mt-6 mx-auto text-lg text-slate-300">
              We are a team of innovators, engineers, and recruiters
              passionate about solving the biggest challenges in hiring.
            </p>
          </div>

          <div className="mt-16 text-slate-200 space-y-6">
            <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
            <p>
              Our mission is to bridge the gap between talented individuals
              and the world's most innovative companies. We believe that the
              right job can transform a person's life, and the right person
              can transform a business. We use cutting-edge AI to make
              recruitment smarter, faster, and more equitable for everyone.
            </p>
            <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
            <p>
              We envision a world where hiring is not a barrier, but a
              gateway to potential. A world where algorithms reduce bias,
              analytics provide clarity, and every candidate is seen for
_their
              true skills and potential. X CALIBR is our step towards that
              future.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}