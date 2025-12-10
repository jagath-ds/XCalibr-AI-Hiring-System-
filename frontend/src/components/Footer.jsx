import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaTwitter, FaLinkedinIn, FaInstagram, FaGithub, FaYoutube } from 'react-icons/fa';

export default function Footer() {

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', to: '/about' },
        { name: 'Pricing', to: '/pricing' },
        { name: 'Documentation', to: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', to: '/about' },
        { name: 'Careers', to: '/careers' }, // <-- This link is updated
        { name: 'Press', to: '#' },
      ],
    },
    {
      title: 'Quick Access',
      links: [
        { name: 'For Recruiters', to: '/recruiter/login' },
        { name: 'For Job Seekers', to: '/candidate/login' },
        { name: 'Job Board', to: '/candidate/job-board' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaTwitter />, href: 'https://twitter.com' },
    { icon: <FaLinkedinIn />, href: 'https://linkedin.com' },
    { icon: <FaInstagram />, href: 'https://instagram.com' },
    { icon: <FaGithub />, href: 'https://github.com' },
    { icon: <FaYoutube />, href: 'https://youtube.com' },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
    e.target.reset();
  };

  return (
    <footer className="bg-dark text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="bg-slate-800 p-8 rounded-2xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Stay Updated with X CALIBR</h2>
            <p className="mt-2 text-slate-400">Get the latest hiring trends, AI insights, and platform updates delivered to your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
            <div className="flex rounded-lg shadow-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-primary text-white font-semibold rounded-r-lg hover:bg-primary-dark flex items-center justify-center"
              >
                Subscribe <FiArrowRight className="ml-2" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              No spam. Unsubscribe at any time. See our{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
        
        {/* Main Footer Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand and Contact Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white">X CALIBR</h3>
            <p className="mt-4 max-w-sm">
              Revolutionizing recruitment with AI-powered solutions for modern businesses worldwide. Connect talent with opportunity through intelligent matching.
            </p>
            <div className="mt-6 space-y-4">
              <a href="mailto:xcalibr@gmsil.com" className="flex items-center hover:text-white">
                <FiMail className="mr-3" /> xcalibr25@gmail.com
              </a>
              <a href="tel:7907483635" className="flex items-center hover:text-white">
                <FiPhone className="mr-3" /> 8590624263
              </a>
              <p className="flex items-center">
                <FiMapPin className="mr-3 flex-shrink-0" /> Kochi, Kerala,India
              </p>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-white tracking-wider">{column.title}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.to} className="hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            {/* Follow Us Section (Left) */}
            <div>
                <h4 className="font-semibold text-white mb-2">Follow Us</h4>
                <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                        <a 
                          key={index} 
                          href={social.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                        >
                          {social.icon}
                        </a>
                    ))}
                </div>
            </div>
            
            {/* Right Side: Links + Copyright */}
            <div className="flex flex-col items-center md:items-end mt-6 md:mt-0">
              {/* New Links Section */}
              <div className="flex gap-4 md:gap-6 text-slate-400 text-sm">
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
              
              {/* Copyright */}
              <p className="text-slate-500 mt-4">&copy; {new Date().getFullYear()} XCalibr. All rights reserved.</p>
            </div>
        </div>
      </div>
    </footer>
  );
}