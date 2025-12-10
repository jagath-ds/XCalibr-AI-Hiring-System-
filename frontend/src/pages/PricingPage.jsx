// src/pages/PricingPage.jsx

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiCheck } from 'react-icons/fi';

// --- Data for Recruiter Plans (from your image) ---
const recruiterPlans = [
  {
    name: 'Basic',
    description: 'For small teams',
    price: '₹8,299',
    isRecommended: false,
    features: [
      'Up to 10 job postings',
      'Basic candidate search',
      'Email support',
      'Standard analytics',
      '1 team member',
    ],
  },
  {
    name: 'Standard',
    description: 'The recommended plan',
    price: '₹16,599',
    isRecommended: true,
    features: [
      'Unlimited job postings',
      'AI-powered candidate matching',
      'Priority email & chat support',
      'Advanced analytics & reporting',
      'Up to 5 team members',
      'Custom branding',
    ],
  },
  {
    name: 'Premium',
    description: 'For large organizations',
    price: '₹33,199',
    isRecommended: false,
    features: [
      'Everything in Standard',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Unlimited team members',
      'Advanced security features',
      '24/7 phone support',
    ],
  },
];

// --- Data for Candidate Plans (new, as requested) ---
const candidatePlans = [
  {
    name: 'Basic',
    description: 'Get started',
    price: '₹499',
    isRecommended: false,
    features: [
      'Profile boost (Basic)',
      '10 AI resume reviews/month',
      'Standard skill assessments',
      'Email support',
    ],
  },
  {
    name: 'Standard',
    description: 'The recommended plan',
    price: '₹999',
    isRecommended: true,
    features: [
      'Profile boost (Priority)',
      'Unlimited AI resume reviews',
      'Premium skill assessments',
      'AI interview coach',
      'Priority support',
    ],
  },
  {
    name: 'Premium',
    description: 'For career-focused pros',
    price: '₹2,499',
    isRecommended: false,
    features: [
      'Everything in Standard',
      'Dedicated career coach',
      'Top-tier "Featured" status',
      'Direct intro to recruiters',
      '24/7 priority support',
    ],
  },
];


export default function PricingPage() {
  const [planType, setPlanType] = useState('recruiter'); // 'recruiter' or 'candidate'

  const plans = planType === 'recruiter' ? recruiterPlans : candidatePlans;
  const title = planType === 'recruiter' ? 'Recruiter Pricing' : 'Candidate Pricing';

  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        {/* Header */}
        <div className="text-center">
          <span className="bg-slate-800 border border-slate-700 text-primary font-semibold px-4 py-1 rounded-full text-sm">
            AI-Powered Recruitment Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mt-10">
          <div className="relative flex p-1 bg-slate-800 rounded-lg">
            <button
              onClick={() => setPlanType('recruiter')}
              className={`relative z-10 w-36 py-2 text-sm font-semibold rounded-md transition-colors ${
                planType === 'recruiter' ? 'text-white' : 'text-slate-400'
              }`}
            >
              For Recruiters
            </button>
            <button
              onClick={() => setPlanType('candidate')}
              className={`relative z-10 w-36 py-2 text-sm font-semibold rounded-md transition-colors ${
                planType === 'candidate' ? 'text-white' : 'text-slate-400'
              }`}
            >
              For Candidates
            </button>
            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 w-36 bg-primary rounded-md transition-transform duration-300 ${
                planType === 'recruiter' ? 'translate-x-0' : 'translate-x-full'
              }`}
            ></div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 bg-slate-800/50 rounded-2xl border ${
                plan.isRecommended ? 'border-primary' : 'border-slate-700'
              }`}
            >
              {plan.isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </span>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate-400">/mo</span>
              </div>

              <ul className="space-y-4 mt-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <FiCheck className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-10 py-3 font-bold rounded-lg ${
                  plan.isRecommended
                    ? 'bg-primary hover:bg-primary-dark'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}