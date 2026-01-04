import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '../lib/auth';
import { LogOut, Gamepad2, User, Shield, Crown, Eye, LogIn, UserPlus } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
  const { user, logout, isGuest, exitGuestMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] border-b border-[#2a475e] sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg group-hover:shadow-[#66c0f4]/50 transition-all">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>
                GameHaqqs<span className="text-[#66c0f4]">2</span>
              </span>
              <span className="text-xs text-[#8f98a0]">Community Platform</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {(user?.role === 'user' || isGuest) && (
            <div className="hidden md:flex items-center gap-1">
              <Link 
                to="/games" 
                className={`px-4 py-2 rounded transition-all ${
                  location.pathname === '/games' 
                    ? 'bg-[#2a475e] text-[#66c0f4]' 
                    : 'text-[#c7d5e0] hover:bg-[#2a475e]/50'
                }`}
              >
                Library
              </Link>
            </div>
          )}

          {/* Guest Mode - Sign In/Up Buttons */}
          {isGuest && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a475e]/30 border border-[#66c0f4]/30">
                <Eye className="h-4 w-4 text-[#66c0f4]" />
                <span className="text-sm text-[#66c0f4]">Guest Mode</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-[#66c0f4] text-[#66c0f4] hover:bg-[#66c0f4]/10"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Now
              </Button>
            </div>
          )}

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              {user.role === 'user' && <NotificationDropdown />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-3 px-3 py-2 h-auto rounded bg-[#2a475e]/30 border border-[#2a475e] hover:bg-[#2a475e]/50 hover:border-[#66c0f4]/50 transition-all cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm text-[#c7d5e0]">{user.username}</span>
                      <span className="text-xs text-[#8f98a0] capitalize">{user.role}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#16202d] border-[#2a475e]" align="end">
                  <DropdownMenuLabel className="text-[#c7d5e0]">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2a475e]" />
                  <DropdownMenuItem 
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/profile')}
                    className="text-[#c7d5e0] focus:bg-[#2a475e] focus:text-[#66c0f4] cursor-pointer"
                  >
                    {user.role === 'admin' && <Crown className="h-4 w-4 mr-2" />}
                    {user.role === 'moderator' && <Shield className="h-4 w-4 mr-2" />}
                    {user.role === 'user' && <User className="h-4 w-4 mr-2" />}
                    {user.role === 'admin' && 'Admin Dashboard'}
                    {user.role === 'moderator' && 'Moderator Dashboard'}
                    {user.role === 'user' && 'My Profile'}
                  </DropdownMenuItem>
                  {user.role === 'user' && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/games')}
                      className="text-[#c7d5e0] focus:bg-[#2a475e] focus:text-[#66c0f4] cursor-pointer"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Game Library
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#2a475e]" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-400 focus:bg-[#2a475e] focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
