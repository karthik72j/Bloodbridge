import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle, CheckCircle2, XCircle, Droplet, Users, Settings, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reqPage, setReqPage] = useState(1);
  const [reqPages, setReqPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Users Management state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);

  // Settings State
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Donation form state
  const [donationData, setDonationData] = useState({ donorIdentifier: '', bloodGroup: '', unitsDonated: '' });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [reqPage, usersPage, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, requestsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/requests?pageNumber=${reqPage}`)
      ]);
      const sortedRequests = requestsRes.data.requests.sort((a, b) => {
        if (a.urgency === 'Emergency' && b.urgency !== 'Emergency') return -1;
        if (a.urgency !== 'Emergency' && b.urgency === 'Emergency') return 1;
        return 0;
      });
      setAnalytics(analyticsRes.data);
      setRequests(sortedRequests);
      setReqPages(requestsRes.data.pages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/admin/users?pageNumber=${usersPage}`);
      setUsers(data.users);
      setUsersPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This will cascade and delete all their history.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/requests/${id}/status`, { status });
      toast.success(`Request marked as ${status}`);
      fetchDashboardData(); // refresh data
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Cannot approve: Insufficient stock for this blood group');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    
    // Validation
    if (Number(donationData.unitsDonated) <= 0) {
      toast.error('Units donated must be greater than 0.');
      return;
    }
    if (!donationData.donorIdentifier) {
      toast.error('Please enter a Donor Email or Phone.');
      return;
    }

    try {
      await api.post('/admin/donations', donationData);
      setDonationData({ donorIdentifier: '', bloodGroup: '', unitsDonated: '' });
      toast.success('Donation recorded successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record donation');
    }
  };

  if (loading && !analytics) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none">
      
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-crimson-600 border-b-2 border-crimson-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Inventory
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-crimson-600 border-b-2 border-crimson-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('users')}
        >
          User Directory
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-crimson-600 border-b-2 border-crimson-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <Card className="glass max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-crimson-600" /> System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Threshold</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  />
                  <Button onClick={() => toast.success('Threshold updated locally')}>Save</Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">If inventory drops below this number, it will be highlighted in red.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card className="glass overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-crimson-600" />
              User Directory Management
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u.location}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {usersPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200">
              <Button variant="outline" disabled={usersPage === 1} onClick={() => setUsersPage(prev => prev - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-600">Page {usersPage} of {usersPages}</span>
              <Button variant="outline" disabled={usersPage === usersPages} onClick={() => setUsersPage(prev => prev + 1)}>
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Inventory Analytics */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Real-Time Inventory Status</h2>
              <Button onClick={() => window.print()} className="print:hidden">
                Download Inventory Report
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {analytics?.inventory?.map(inv => (
                <Card key={inv.bloodGroup} className={inv.unitsAvailable < lowStockThreshold ? 'border-red-400 bg-red-50' : 'glass'}>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">{inv.bloodGroup}</div>
                    <div className={`text-2xl font-bold ${inv.unitsAvailable < lowStockThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                      {inv.unitsAvailable}
                    </div>
                    {inv.unitsAvailable < lowStockThreshold && (
                      <div className="mt-2 text-xs text-red-600 flex items-center justify-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> Low Stock
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charts */}
            <Card className="glass lg:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.inventory || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bloodGroup" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="unitsAvailable" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Record Donation */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-crimson-600" />
                  Record Donation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordDonation} className="space-y-4">
                  <Input 
                    label="Donor Email or Phone" 
                    type="text"
                    required 
                    value={donationData.donorIdentifier}
                    onChange={e => setDonationData({...donationData, donorIdentifier: e.target.value})}
                    placeholder="e.g. john@example.com"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                    <select
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-crimson-500"
                      value={donationData.bloodGroup}
                      onChange={e => setDonationData({...donationData, bloodGroup: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <Input 
                    label="Units Donated" 
                    type="number" 
                    min="1" 
                    required 
                    value={donationData.unitsDonated}
                    onChange={e => setDonationData({...donationData, unitsDonated: e.target.value})}
                  />
                  <Button type="submit" className="w-full">Record Donation</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests Table */}
          <Card className="glass overflow-hidden">
            <CardHeader>
              <CardTitle>Blood Requests Fulfillment</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Units</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map(req => (
                    <tr key={req._id} className={`transition-colors ${req.urgency === 'Emergency' ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {req.requester?.name || 'Unknown'} <br/>
                        <span className="text-xs text-slate-500 font-normal">{req.location}</span>
                      </td>
                      <td className="px-6 py-4 text-crimson-600 font-semibold">{req.bloodGroupRequired}</td>
                      <td className="px-6 py-4">{req.unitsRequested}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${req.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">{req.status}</td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(req._id, 'Approved')}
                              className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                              title="Approve & Fulfill"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {reqPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200">
                <Button 
                  variant="outline" 
                  disabled={reqPage === 1} 
                  onClick={() => setReqPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">Page {reqPage} of {reqPages}</span>
                <Button 
                  variant="outline" 
                  disabled={reqPage === reqPages} 
                  onClick={() => setReqPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
