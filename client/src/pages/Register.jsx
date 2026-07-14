import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Donor',
    location: '',
    phone: '',
    bloodGroup: '',
    age: '',
    weight: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (formData.role === 'Donor') {
      if (!formData.bloodGroup) {
        toast.error('Please select a blood group.');
        return;
      }
      if (Number(formData.age) < 18) {
        toast.error('You must be at least 18 years old to register as a donor.');
        return;
      }
      if (Number(formData.weight) < 45) {
        toast.error('You must weigh at least 45kg to donate blood.');
        return;
      }
    }

    setLoading(true);
    try {
      const user = await register(formData);
      toast.success('Registration successful!');
      if (user.role === 'Admin') navigate('/admin/dashboard');
      else if (user.role === 'Hospital') navigate('/hospital/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      toast.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-slate-900">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Full Name" name="name" required value={formData.name} onChange={handleChange} />
              <Input label="Email address" type="email" name="email" required value={formData.email} onChange={handleChange} />
              <Input label="Password" type="password" name="password" required value={formData.password} onChange={handleChange} />
              <Input label="Phone Number" type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
              <Input label="Location (City/Area)" name="location" required value={formData.location} onChange={handleChange} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                >
                  <option value="Donor">Donor</option>
                  <option value="Hospital">Hospital/Patient</option>
                </select>
              </div>

              {formData.role === 'Donor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      required
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                    >
                      <option value="">Select...</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Age" type="number" name="age" required value={formData.age} onChange={handleChange} />
                  <Input label="Weight (kg)" type="number" name="weight" required value={formData.weight} onChange={handleChange} />
                </>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-crimson-600 hover:text-crimson-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
