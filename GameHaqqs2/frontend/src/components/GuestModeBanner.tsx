import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';
import { LogIn, UserPlus, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function GuestModeBanner() {
  const { isGuest, exitGuestMode } = useAuth();
  const navigate = useNavigate();

  if (!isGuest) return null;

  return (
    <Card className="border-[#66c0f4] bg-gradient-to-r from-[#1a3a4a] to-[#16202d] mb-4 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-[#66c0f4] animate-pulse" />
              <p className="text-[#66c0f4] font-semibold">Viewing as Guest</p>
            </div>
            <p className="text-[#8f98a0] text-sm">
              Sign in to unlock interactive features like posting, commenting, and liking content.
            </p>
          </div>
          <div className="flex gap-2">
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
            <Button
              size="sm"
              variant="ghost"
              onClick={exitGuestMode}
              className="text-[#8f98a0] hover:text-[#c7d5e0]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
