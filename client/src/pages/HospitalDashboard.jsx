import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, MapPin, Droplet, Clock, Phone, Mail, ChevronDown, ChevronUp, Calendar, RefreshCw, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'request', 'camp', 'my-requests'
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setMyRequestsLoading(true);
    try {
      const { data } = await api.get('/requests/myrequests');
      setMyRequests(data);
    } catch (error) {
      toast.error('Failed to load recent requests');
    } finally {
      setMyRequestsLoading(false);
    }
  };

  const [searchBg, setSearchBg] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedDonorId, setExpandedDonorId] = useState(null);
  
  const [requestData, setRequestData] = useState({
    bloodGroupRequired: '',
    unitsRequested: '',
    urgency: 'Routine',
    location: '',
    targetDate: '',
  });
  const [requestStatus, setRequestStatus] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const [campData, setCampData] = useState({
    campName: '',
    date: '',
    location: '',
    description: ''
  });
  const [campLoading, setCampLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const { data } = await api.get('/donor/search', {
        params: { bloodGroup: searchBg, location: searchLocation }
      });
      setSearchResults(data);
      if (data.length === 0) {
        toast('No active donors found.', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to search donors.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRequestChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (Number(requestData.unitsRequested) <= 0) {
      toast.error('Units requested must be greater than 0.');
      return;
    }

    setRequestLoading(true);
    setRequestStatus('');
    try {
      await api.post('/requests', requestData);
      setRequestStatus('success');
      toast.success('Request submitted successfully!');
      setRequestData({
        bloodGroupRequired: '',
        unitsRequested: '',
        urgency: 'Routine',
        location: '',
        targetDate: '',
      });
    } catch (error) {
      setRequestStatus('error');
      toast.error('Failed to submit request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCampChange = (e) => {
    setCampData({ ...campData, [e.target.name]: e.target.value });
  };

  const handleCampSubmit = async (e) => {
    e.preventDefault();
    setCampLoading(true);
    try {
      await api.post('/camps', campData);
      toast.success('Donation Camp organized successfully!');
      setCampData({
        campName: '',
        date: '',
        location: '',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to organize camp.');
    } finally {
      setCampLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'search' ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Search Donors
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'request' ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Create Request
        </button>
        <button
          onClick={() => setActiveTab('camp')}
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'camp' ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Organize Camp
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'my-requests' ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          My Recent Requests
        </button>
      </div>

      {activeTab === 'search' && (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-crimson-600" />
            Find Active Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                value={searchBg}
                onChange={(e) => setSearchBg(e.target.value)}
              >
                <option value="">Any Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <Input 
                label="Location (City/Area)" 
                value={searchLocation} 
                onChange={(e) => setSearchLocation(e.target.value)} 
                placeholder="e.g. New York" 
              />
            </div>
            <Button type="submit" disabled={searchLoading} className="w-full sm:w-auto min-w-[120px]">
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Search Results */}
          <div className="mt-8">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((donor) => (
                  <div key={donor._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{donor.user.name}</h4>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {donor.user.location}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <Droplet className="h-3 w-3 text-crimson-500" /> {donor.bloodGroup}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        Available
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <button 
                        onClick={() => setExpandedDonorId(expandedDonorId === donor._id ? null : donor._id)}
                        className="text-sm text-crimson-600 hover:text-crimson-700 font-medium flex items-center gap-1"
                      >
                        {expandedDonorId === donor._id ? <><ChevronUp className="h-4 w-4"/> Hide Contact Info</> : <><ChevronDown className="h-4 w-4"/> View Contact Info</>}
                      </button>
                      
                      {expandedDonorId === donor._id && (
                        <div className="mt-3 space-y-2 text-sm text-slate-700 animate-in fade-in slide-in-from-top-2">
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {donor.user.phone ? donor.user.phone : <span className="italic text-slate-500">Phone Not Provided</span>}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {donor.user.email}
                            </p>
                            <a 
                              href={`mailto:${donor.user.email}`} 
                              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Send Email
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !searchLoading && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active donors found matching your criteria.</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'request' && (
      <Card className="glass max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-crimson-600" />
            Create Blood Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestSubmit} className="space-y-6">
            {requestStatus === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                Request submitted successfully!
              </div>
            )}
            {requestStatus === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                Failed to submit request. Please try again.
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group Required</label>
                <select
                  name="bloodGroupRequired"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                  value={requestData.bloodGroupRequired}
                  onChange={handleRequestChange}
                >
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              
              <Input 
                label="Units Required" 
                name="unitsRequested" 
                type="number" 
                min="1" 
                required 
                value={requestData.unitsRequested} 
                onChange={handleRequestChange} 
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                <select
                  name="urgency"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                  value={requestData.urgency}
                  onChange={handleRequestChange}
                >
                  <option value="Routine">Routine</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
              <Input 
                label="Location (Hospital/Area)" 
                name="location" 
                required 
                value={requestData.location} 
                onChange={handleRequestChange} 
              />
              
              <Input 
                label="Target Date" 
                name="targetDate" 
                type="date" 
                required 
                value={requestData.targetDate} 
                onChange={handleRequestChange} 
              />
            </div>

            <Button type="submit" disabled={requestLoading} className="w-full">
              {requestLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {activeTab === 'camp' && (
      <Card className="glass max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-crimson-600" />
            Organize Donation Camp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCampSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input 
                label="Camp Name" 
                name="campName" 
                required 
                value={campData.campName} 
                onChange={handleCampChange} 
                placeholder="e.g. Summer Blood Drive"
              />
              <Input 
                label="Date" 
                name="date" 
                type="date" 
                required 
                value={campData.date} 
                onChange={handleCampChange} 
              />
              <Input 
                label="Location" 
                name="location" 
                required 
                value={campData.location} 
                onChange={handleCampChange} 
                placeholder="e.g. City Hall Plaza"
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500"
                  value={campData.description}
                  onChange={handleCampChange}
                  placeholder="Details about the camp, who can donate, etc."
                ></textarea>
              </div>
            </div>

            <Button type="submit" disabled={campLoading} className="w-full">
              {campLoading ? 'Publishing...' : 'Publish Camp'}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {activeTab === 'my-requests' && (
      <Card className="glass overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-crimson-600" />
            My Recent Requests
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchMyRequests} disabled={myRequestsLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${myRequestsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Target Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {myRequests.map(req => (
                <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{req.bloodGroupRequired}</td>
                  <td className="px-6 py-4">{req.unitsRequested}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${req.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(req.targetDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myRequests.length === 0 && !myRequestsLoading && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    You have no recent requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}

    </div>
  );
};

export default HospitalDashboard;
