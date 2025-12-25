import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertCircle, Trash2, Ban, VolumeX, CheckCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  icon?: 'delete' | 'ban' | 'mute' | 'check' | 'alert';
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'alert',
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 className="h-6 w-6" />;
      case 'ban':
        return <Ban className="h-6 w-6" />;
      case 'mute':
        return <VolumeX className="h-6 w-6" />;
      case 'check':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-orange-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-[#66c0f4]';
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1b2838] border-[#2a475e]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`${getIconColor()}`}>
              {getIcon()}
            </div>
            <AlertDialogTitle className="text-[#c7d5e0]">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#8f98a0]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] hover:bg-[#1e3447]">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Preset Configurations for Common Use Cases
export function DeleteConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant' | 'icon'>) {
  return (
    <ConfirmationDialog
      {...props}
      variant="danger"
      icon="delete"
      confirmText={props.confirmText || 'Delete'}
    />
  );
}

export function BanConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant' | 'icon'>) {
  return (
    <ConfirmationDialog
      {...props}
      variant="danger"
      icon="ban"
      confirmText={props.confirmText || 'Ban User'}
    />
  );
}

export function MuteConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant' | 'icon'>) {
  return (
    <ConfirmationDialog
      {...props}
      variant="warning"
      icon="mute"
      confirmText={props.confirmText || 'Mute User'}
    />
  );
}

export function ApprovalConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant' | 'icon'>) {
  return (
    <ConfirmationDialog
      {...props}
      variant="success"
      icon="check"
      confirmText={props.confirmText || 'Approve'}
    />
  );
}
