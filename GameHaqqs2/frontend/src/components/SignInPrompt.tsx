import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { LogIn, UserPlus } from 'lucide-react';

interface SignInPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function SignInPrompt({ open, onOpenChange, action = 'perform this action' }: SignInPromptProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate('/login');
  };

  const handleSignUp = () => {
    onOpenChange(false);
    navigate('/register');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#c7d5e0] text-xl">Sign in to continue</AlertDialogTitle>
          <AlertDialogDescription className="text-[#8f98a0]">
            You need to be signed in to {action}. Join GameHaqqs2 to unlock the full experience!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="bg-[#2a475e] hover:bg-[#3a5770] text-[#c7d5e0] border-[#2a475e]">
            Continue as Guest
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignIn}
            className="bg-gradient-to-r from-[#4a7f9e] to-[#2a5f7f] hover:from-[#3a6f8e] hover:to-[#1a4f6f] text-white"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleSignUp}
            className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
