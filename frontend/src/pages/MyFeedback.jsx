
import { FiAward, FiMessageSquare, FiShield } from 'react-icons/fi';

export default function MyScores() {
  const scores = [
    { title: "Technical Score", value: 88, icon: <FiAward />, color: "bg-blue-500" },
    { title: "Communication Score", value: 92, icon: <FiMessageSquare />, color: "bg-green-500" },
    { title: "Trust Score", value: 76, icon: <FiShield />, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark">My Scores</h1>
        <p className="mt-1 text-slate-500">
          An overview of your AI-generated scores based on your profile.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scores.map(score => (
          <div key={score.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${score.color} text-white flex items-center justify-center`}>
                {score.icon}
              </div>
              <div>
                <p className="text-slate-500">{score.title}</p>
                <p className="text-3xl font-bold text-dark">{score.value}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-dark">Score Breakdown</h3>
        <p className="mt-2 text-slate-500">Detailed analysis will be displayed here, showing how your scores were calculated from your resume, projects, and other data points.</p>
      </div>
    </div>
  );
}