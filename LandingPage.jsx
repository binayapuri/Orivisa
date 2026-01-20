import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Nexus Platform 🎓</h1>
          <p className="text-xl text-gray-600">Your Complete Migration Agent Management System</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div onClick={() => navigate('/student/login')} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Portal</h2>
            <p className="text-gray-600 mb-6">Access your application status and documents</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700">
              Login as Student <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div onClick={() => navigate('/agent/login')} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Agent Portal</h2>
            <p className="text-gray-600 mb-6">Manage clients and track applications</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700">
              Login as Agent <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
