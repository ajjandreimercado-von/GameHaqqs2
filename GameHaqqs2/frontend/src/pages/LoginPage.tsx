import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../lib/auth';
import { Gamepad2, Loader2, AlertCircle, Shield, User, Crown } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'moderator'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Connected to /api/login
      // Use the actual email entered by the user
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        // Route to games library after login
        navigate('/games');
      }, 500);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const roleIcons = {
    user: <User className="h-4 w-4" />,
    admin: <Crown className="h-4 w-4" />,
    moderator: <Shield className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#171a21] via-[#1b2838] to-[#16202d] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ 
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(102, 192, 244, 0.1) 35px, rgba(102, 192, 244, 0.1) 70px)' 
      }} />
      
      <Card className="w-full max-w-md relative z-10 border-[#2a475e] bg-gradient-to-b from-[#1e3447] to-[#16202d] shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg shadow-[#66c0f4]/20">
              <Gamepad2 className="h-9 w-9 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#c7d5e0]">Welcome Back</CardTitle>
          <CardDescription className="text-[#8f98a0]">Sign in to your GameHaqqs2 account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#c7d5e0]">Login As</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={loading}>
                <SelectTrigger className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] hover:border-[#66c0f4]/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16202d] border-[#2a475e]">
                  <SelectItem value="user" className="text-[#c7d5e0] focus:bg-[#2a475e] focus:text-[#66c0f4]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-[#c7d5e0] focus:bg-[#2a475e] focus:text-[#66c0f4]">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator" className="text-[#c7d5e0] focus:bg-[#2a475e] focus:text-[#66c0f4]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Moderator</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#8f98a0] flex items-center gap-1.5">
                {roleIcons[role]}
                <span>
                  {role === 'user' && 'Access community features and track your progress'}
                  {role === 'admin' && 'Full platform management and analytics'}
                  {role === 'moderator' && 'Content moderation and community management'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#c7d5e0]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] hover:border-[#66c0f4]/50 focus:border-[#66c0f4] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#c7d5e0]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] hover:border-[#66c0f4]/50 focus:border-[#66c0f4] transition-colors"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/20 border-green-500/50 text-green-400">
                <AlertDescription>Login successful! Redirecting to your dashboard...</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white shadow-lg steam-gradient-hover"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-[#8f98a0]">Don't have an account? </span>
              <Link to="/register" className="text-[#66c0f4] hover:text-[#5ab0e0] transition-colors">
                Create one now
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
