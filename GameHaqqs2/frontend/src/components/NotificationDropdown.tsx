import { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertCircle, Trophy, Heart } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'favorite' | 'post_approved' | 'post_declined';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        console.log('⚠️ No user logged in, skipping notification fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('🔔 NotificationDropdown: Fetching notifications for user:', user.username);
        console.log('🔑 Auth token exists:', !!localStorage.getItem('auth_token'));
        
        const data = await api.getNotifications();
        console.log('✅ NotificationDropdown: Raw API response:', data);
        console.log('📊 Response type:', typeof data, 'Is array:', Array.isArray(data));
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log('📭 No notifications found, showing empty state');
          setNotifications([]);
          setLoading(false);
          return;
        }
        
        const formattedNotifications = data.map((notif: any) => {
          console.log('🔄 Formatting notification:', notif);
          const timestamp = notif.timestamp || notif.created_at;
          return {
            id: String(notif.id),
            type: notif.type || 'info',
            title: notif.title,
            message: notif.message,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            read: Boolean(notif.read),
          };
        });
        
        console.log('✅ NotificationDropdown: Formatted notifications:', formattedNotifications);
        setNotifications(formattedNotifications);
      } catch (error: any) {
        console.error('❌ NotificationDropdown: Failed to fetch notifications');
        console.error('❌ Error details:', error);
        console.error('❌ Error message:', error?.message);
        console.error('❌ Error response:', error?.response);
        
        // Show empty state on error
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success('Notification removed');
    } catch (error: any) {
      console.error('Failed to remove notification:', error);
      // If notification already deleted (404), just remove from UI
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        toast.success('Notification removed');
      } else {
        toast.error('Failed to remove notification');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'favorite':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-[#66c0f4]" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-14 w-14 rounded-[18px] bg-[#1e3a4f] border-2 border-[#2a4a5f] hover:bg-[#25445a] hover:border-[#3a5a6f] flex items-center justify-center transition-all duration-200 shadow-lg"
        >
          <Bell className="h-6 w-6 text-white" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 right-0 h-6 min-w-[24px] px-1.5 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full border-2 border-[#16202d] shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[#16202d] border-[#2a475e] p-0"
      >
        <div className="p-4 border-b border-[#2a475e]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#c7d5e0]">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs text-[#66c0f4] hover:text-[#5ab0e0]"
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-xs text-[#8f98a0]">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#8f98a0]">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg group hover:bg-[#2a475e]/30 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-[#2a475e]/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-[#c7d5e0] truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-[#66c0f4] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[#8f98a0] line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#8f98a0]">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-[#8f98a0] hover:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-1 bg-[#2a475e]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
