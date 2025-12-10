import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiArrowRight, FiCode, FiDatabase, FiLayers, FiCloud, FiShield, FiBarChart2 } from 'react-icons/fi';

// Component for each career card
const CareerCard = ({ icon, title, description, color }) => (
  <div className={`bg-slate-800 p-8 rounded-2xl border ${color} shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1`}>
    <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center mb-6 text-primary">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="mt-2 text-slate-400">{description}</p>
  </div>
);

// Main page component
export default function CareersPage() {
  const careerFields = [
    {
      icon: <FiCode size={28} />,
      title: "Software Engineering",
      description: "Build the next generation of web and mobile applications.",
      color: "border-green-500/50"
    },
    {
      icon: <FiDatabase size={28} />,
      title: "Data Science & AI",
      description: "Unlock insights from data and build intelligent models.",
      color: "border-blue-500/50"
    },
    {
      icon: <FiLayers size={28} />,
      title: "Product Management",
      description: "Lead the vision and strategy for cutting-edge digital products.",
      color: "border-purple-500/50"
    },
    {
      icon: <FiBarChart2 size={28} />,
      title: "Business Analytics",
      description: "Turn data into actionable insights that drive business growth.",
      color: "border-yellow-500/50"
    },
    {
      icon: <FiCloud size={28} />,
      title: "Cloud & DevOps",
      description: "Scale and maintain the infrastructure that powers the world.",
      color: "border-sky-500/50"
    },
    {
      icon: <FiShield size={28} />,
      title: "Cybersecurity",
      description: "Protect digital assets and defend against modern threats.",
      color: "border-red-500/50"
    },
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <span className="text-primary font-semibold tracking-wider">FIND YOUR FUTURE</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4">
            Discover Your Next Career
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto">
            XCalibr connects you with top-tier companies in the most in-demand fields. Explore the types of roles our AI can match you with.
          </p>
        </div>

        {/* Career Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerFields.map((field) => (
            <CareerCard key={field.title} {...field} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white">Ready to find your perfect match?</h2>
          <p className="mt-4 text-lg text-slate-400">
            Sign up as a candidate to let our AI find the best opportunities for you.
          </p>
          <Link
            to="/candidate/signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transform hover:scale-105 transition-all"
          >
            Get Started Now <FiArrowRight />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}