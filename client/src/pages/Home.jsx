import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Droplet, Heart, Activity, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-crimson-50 to-slate-100 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Droplet className="h-20 w-20 text-crimson-600 fill-crimson-600 mx-auto mb-8 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Every Drop <span className="text-crimson-600">Saves a Life</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto mb-10">
            Join the most trusted blood donation network. Whether you're here to donate or request blood during an emergency, BloodBridge connects those in need with those who care.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">Become a Donor</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-white">Request Blood</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-crimson-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-crimson-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Tracking</h3>
              <p className="text-slate-600">Instantly search our network for available blood types in your specific location.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-crimson-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-crimson-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Save Lives</h3>
              <p className="text-slate-600">Donors can easily track their eligibility and toggle their availability for emergency requests.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-crimson-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-crimson-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Verified</h3>
              <p className="text-slate-600">Robust authentication and role-based access control ensure data integrity and safety.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
