import { Link } from "react-router-dom";
import { useState } from "react"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MetaBalls from "../components/MetaBalls"; 
import VideoModal from "../components/VideoModal"; 
import { FiCpu, FiTarget, FiBarChart2, FiShield, FiPlayCircle, FiZap } from "react-icons/fi";

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const features = [
    {
      icon: <FiCpu size={28} />,
      title: "AI-Powered Screening",
      description: "Advanced algorithms analyze resumes, skills, and experience to rank candidates with precision.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <FiTarget size={28} />,
      title: "Smart Matching",
      description: "Machine learning models match candidates to roles based on deep compatibility analysis.",
      color: "from-pink-500 to-purple-600",
    },
    {
      icon: <FiBarChart2 size={28} />,
      title: "Analytics Dashboard",
      description: "Real-time insights and comprehensive reports to optimize your entire hiring pipeline.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <FiShield size={28} />,
      title: "Trust & Security",
      description: "Enterprise-grade security with bias-free AI algorithms and GDPR compliance.",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-green-500/20 via-slate-900 to-slate-900 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tl from-blue-500/20 via-slate-900 to-slate-900 blur-3xl"></div>
        <Navbar />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="text-center lg:text-left">
              <span className="bg-slate-800 border border-slate-700 text-primary font-semibold px-4 py-1 rounded-full text-sm">
                AI-Powered Recruitment Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-6">
                The Future of <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-500">
                  Smart Hiring
                </span>
              </h1>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-slate-300">
                Transform your recruitment with AI-driven candidate matching, automated screening, and data-powered insights. Find exceptional talent 10x faster.
              </p>
              <div className="mt-10 flex justify-center lg:justify-start gap-4 flex-wrap">
                <Link to="/recruiter/login" className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transform hover:scale-105 transition-all flex items-center gap-2">
                  Start Hiring Smarter <span>&rarr;</span>
                </Link>
                <Link to="/candidate/login" className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transform hover:scale-105 transition-all">
                  Join as Candidate
                </Link>
              </div>
              <div className="mt-12 flex justify-center lg:justify-start gap-8 text-center">
                <div><h2 className="text-3xl font-bold">10k+</h2><p className="mt-1 text-slate-400 font-medium">Successful Hires</p></div>
                <div><h2 className="text-3xl font-bold">95%</h2><p className="mt-1 text-slate-400 font-medium">Success Rate</p></div>
                <div><h2 className="text-3xl font-bold">50%</h2><p className="mt-1 text-slate-400 font-medium">Faster Hiring</p></div>
              </div>
            </div>

            {/* Right Column: Live Background */}
            <div className="hidden lg:block">
              <div className="max-w-md mx-auto aspect-square rounded-2xl border border-slate-700 overflow-hidden">
                <MetaBalls 
                  color="#22c55e"
                  cursorBallColor="#3b82f6"
                  ballCount={10}
                  speed={0.2}
                  clumpFactor={0.8}
                  animationSize={20}
                  enableTransparency={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="bg-slate-800 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="bg-green-500/10 text-primary font-semibold px-4 py-2 rounded-full text-sm flex items-center gap-2 justify-center mx-auto max-w-fit">
              <FiZap /> Powerful Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-6">
              Everything You Need for <br />
              <span className="text-primary">Modern Recruitment</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
              Our comprehensive AI hiring platform provides cutting-edge tools to streamline your recruitment process and connect the right talent with the right opportunities.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-700 text-center flex flex-col items-center shadow-lg">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="bg-slate-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* --- UPDATED IMAGE PLACEHOLDER --- */}
            <div className="w-full aspect-video bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center p-8">
              <img 
                src="/logo.png" 
                alt="XCalibr Logo" 
                className="w-full h-full object-contain" 
              />
            </div>

            {/* Right Column: Text and Button */}
            <div className="text-center lg:text-left">
              <span className="text-primary font-semibold tracking-wider">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4">
                See XCalibr in Action
              </h2>
              <p className="mt-6 text-lg text-slate-400">
                Watch a short demo to see how our AI can analyze, match, and help you hire the perfect candidate faster than ever before.
              </p>
              <div className="mt-8">
                <button
                  className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transform hover:scale-105 transition-all flex items-center gap-2 mx-auto lg:mx-0"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <FiPlayCircle />
                  How It Works
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      {/* Video Modal */}
      {isVideoOpen && (
        <VideoModal 
          videoSrc="/v1.mp4" 
          onClose={() => setIsVideoOpen(false)} 
        />
      )}
    </div>
  );
}