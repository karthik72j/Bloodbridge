import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Droplet, LogOut, User as UserIcon } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Admin': return '/admin/dashboard';
      case 'Hospital': return '/hospital/dashboard';
      case 'Donor': return '/donor/dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Droplet className="h-8 w-8 text-crimson-600 fill-crimson-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">BloodBridge</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  Dashboard
                </Link>
                <div className="h-4 w-px bg-slate-300 mx-2"></div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 text-slate-500 hover:text-red-600">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
