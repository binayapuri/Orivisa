import { FileText, Upload, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome, Student! 🎓</h1>
        <p className="text-blue-100">Track your application progress</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">1</h3>
          <p className="text-gray-600">Active Application</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">5</h3>
          <p className="text-gray-600">Documents</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">75%</h3>
          <p className="text-gray-600">Progress</p>
        </div>
      </div>
    </div>
  );
}