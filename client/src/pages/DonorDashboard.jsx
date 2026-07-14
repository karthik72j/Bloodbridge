import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Clock, Activity, MapPin, Award, CalendarDays, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const [activeCamps, setActiveCamps] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, historyRes, campsRes] = await Promise.all([
        api.get('/donor/profile'),
        api.get('/donor/history'),
        api.get('/camps')
      ]);
      setProfile(profileRes.data);
      setHistory(historyRes.data);
      setActiveCamps(campsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await api.put('/donor/toggle-availability');
      setProfile(data);
      toast.success(data.isAvailable ? 'You are now available for emergencies' : 'You are no longer available for emergencies');
    } catch (error) {
      console.error('Failed to toggle availability', error);
      toast.error('Failed to toggle availability');
    }
  };


  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  const getBadgeDetails = () => {
    const total = profile.totalDonations || 0;
    if (total === 0) return <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-slate-300">Registered Hero</span>;
    if (total >= 1 && total <= 2) return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-amber-300">Bronze Donor</span>;
    if (total >= 3 && total <= 5) return <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-slate-400">Silver Donor</span>;
    return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-yellow-400">Gold Lifesaver</span>;
  };

  const getDaysUntilEligible = () => {
    if (!profile.lastDonationDate) return 0;
    const ninetyDaysInMillis = 90 * 24 * 60 * 60 * 1000;
    const nextEligibleDate = new Date(profile.lastDonationDate).getTime() + ninetyDaysInMillis;
    const now = Date.now();
    
    if (now >= nextEligibleDate) return 0;
    return Math.ceil((nextEligibleDate - now) / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysUntilEligible();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
            {getBadgeDetails()}
          </div>
          <p className="text-slate-600 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" /> {user.location}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <span className="text-sm font-medium text-slate-600">Available for Emergency:</span>
          <button
            onClick={toggleAvailability}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:ring-offset-2 ${
              profile.isAvailable ? 'bg-crimson-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profile.isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Eligibility */}
        <div className="md:col-span-1 space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-crimson-600" />
                Blood Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-slate-900 text-center py-4">
                {profile.bloodGroup}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-crimson-600" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 text-center">
              {profile.eligibilityStatus ? (
                <>
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-2">
                    <Activity className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Eligible to donate</h3>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-crimson-600 mb-1">{daysLeft}</div>
                  <h3 className="text-sm font-medium text-slate-800">Days Remaining</h3>
                </>
              )}
            </CardContent>
          </Card>

          {/* Certificate Panel */}
          <Card className="glass bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Hero Status</h3>
              <p className="text-sm text-slate-600 mb-4">You have {history.length} successful donations.</p>
              {history.length > 0 ? (
                <Button 
                  onClick={() => setShowCertificate(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Download Certificate
                </Button>
              ) : (
                <p className="text-xs text-slate-500 italic">Complete your first donation to earn a certificate.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bookings & History */}
        <div className="md:col-span-2 space-y-6">
          


          {/* Camp Booking */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-crimson-600" />
                Upcoming Blood Donation Camps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeCamps.map(camp => (
                  <div key={camp._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-900">{camp.campName}</h4>
                      <p className="text-xs text-slate-500">{new Date(camp.date).toLocaleDateString()} | {camp.location}</p>
                      {camp.hospital && <p className="text-[10px] text-slate-400">Org: {camp.hospital.name}</p>}
                    </div>
                  </div>
                ))}
                {activeCamps.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No upcoming camps scheduled right now.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donation History Table */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Units Donated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(item.donationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-crimson-600 font-bold">{item.bloodGroup}</td>
                      <td className="px-6 py-4">{item.unitsDonated}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                        No past donations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 border-8 border-double border-orange-200 text-center">
            <button 
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-6">
              <Award className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Certificate of Appreciation</h2>
              <p className="text-lg text-slate-600 uppercase tracking-widest">Proudly Presented To</p>
            </div>
            <h1 className="text-5xl font-script text-crimson-600 my-6">{user.name}</h1>
            <p className="text-slate-700 max-w-lg mx-auto leading-relaxed mb-8">
              For your invaluable contribution to humanity. Your generous donation of <strong>{history.reduce((acc, curr) => acc + curr.unitsDonated, 0)} units</strong> of <strong>{profile.bloodGroup}</strong> blood has given the gift of life to those in need.
            </p>
            <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-8">
              <div className="text-left">
                <p className="font-bold text-slate-900">BloodBridge Network</p>
                <p className="text-sm text-slate-500">Official Partner</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">Date of Issue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
