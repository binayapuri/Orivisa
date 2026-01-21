// import { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'sonner';

// export default function RegisterPage() {
//   const { role } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ name: '', email: '', password: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     toast.success('Registration successful!');
//     navigate(`/${role}/login`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
//           {role === 'student' ? '🎓 Student' : '👔 Agent'} Register
//         </h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//             <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//             <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
//           </div>
//           <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg">Register</button>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

export default function RegisterPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    marnNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!formData.confirmPassword) {
      toast.error('Please confirm your password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (role === 'agent' && !formData.marnNumber) {
      toast.error('MARN number is required for agents');
      return;
    }

    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const payload = {
        firstName,
        lastName,
        email: formData.email.toLowerCase(),
        password: formData.password,
        phone: formData.phone,
        role: role || 'student'
      };

      // Add MARN for agents
      if (role === 'agent') {
        payload.marnNumber = formData.marnNumber;
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Registration successful!');
        navigate(`/${role}/dashboard`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {role === 'student' ? '👨‍🎓 Student' : '👔 Agent'} Register
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {role === 'agent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MARN Number</label>
              <input
                type="text"
                name="marnNumber"
                value={formData.marnNumber}
                onChange={handleChange}
                placeholder="Enter your MARN number (7 digits)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
                required={role === 'agent'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to={`/${role}/login`} className="text-purple-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
