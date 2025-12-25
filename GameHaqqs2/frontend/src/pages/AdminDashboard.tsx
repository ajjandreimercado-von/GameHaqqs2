import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Users, Gamepad2, AlertTriangle, BarChart3, Edit, Trash2, CheckCircle, XCircle, TrendingUp, Crown } from 'lucide-react';
import { GameManagement } from '../components/admin/GameManagement';

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    pendingReports: 0,
    activeUsers: 0,
  });
  
  // Pagination for users
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  
  // Pagination for games
  const [gamesPage, setGamesPage] = useState(1);
  const [gamesTotalPages, setGamesTotalPages] = useState(1);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  
  // Pagination for reports
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [totalReportsCount, setTotalReportsCount] = useState(0);
  
  const perPage = 20;
  
  // Refresh function for games
  const refreshGames = async () => {
    try {
      const gamesData = await api.getAdminGames(gamesPage, perPage);
      setGames(gamesData.data || gamesData);
      setGamesTotalPages(gamesData.meta?.last_page || gamesData.last_page || 1);
      setTotalGamesCount(gamesData.meta?.total || gamesData.total || 0);
    } catch (error) {
      console.error('Failed to refresh games:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 AdminDashboard: Starting data fetch...');
        
        const [usersData, gamesData, reportsData, adminData] = await Promise.all([
          api.getAdminUsers(usersPage).catch(e => { console.error('❌ getAdminUsers failed:', e); throw e; }),
          api.getAdminGames(gamesPage, perPage).catch(e => { console.error('❌ getAdminGames failed:', e); throw e; }),
          api.getReports(reportsPage).catch(e => { console.error('❌ getReports failed:', e); return { data: [] }; }),
          api.getAdminData().catch(e => { console.error('❌ getAdminData failed:', e); throw e; }),
        ]);
        
        console.log('✅ AdminDashboard: Data fetched successfully', { usersData, gamesData, reportsData, adminData });
        
        // Users
        setUsers(usersData.data || usersData);
        setUsersTotalPages(usersData.last_page || 1);
        setTotalUsersCount(usersData.total || 0);
        
        // Games
        setGames(gamesData.data || gamesData);
        setGamesTotalPages(gamesData.meta?.last_page || gamesData.last_page || 1);
        setTotalGamesCount(gamesData.meta?.total || gamesData.total || 0);
        
        // Reports
        setReports(reportsData.data || []);
        setReportsTotalPages(reportsData.last_page || 1);
        setTotalReportsCount(reportsData.total || 0);
        
        // Extract stats from admin data API
        if (adminData && adminData.data && adminData.data.admin_stats) {
          setStats({
            totalUsers: adminData.data.admin_stats.total_users,
            totalGames: adminData.data.admin_stats.total_games,
            pendingReports: adminData.data.admin_stats.pending_reports,
            activeUsers: adminData.data.admin_stats.active_users,
          });
        } else {
          console.warn('Admin stats not found in response, using fallback values');
          setStats({
            totalUsers: usersData?.data?.length || 0,
            totalGames: gamesData?.data?.length || 0,
            pendingReports: 0,
            activeUsers: 0,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch admin data:', error);
        
        // If it's an auth error, clear cache and redirect to login
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('403') || error.message.includes('Forbidden'))) {
          console.warn('🔒 Authentication failed - clearing cache and redirecting to login');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          alert('Your session has expired or you don\'t have admin access. Please log in again.');
          window.location.href = '/login';
          return;
        }
        
        alert(`Error loading admin data: ${error.message || 'Unknown error'}. Please check console.`);
        // Set default values on error
        setStats({
          totalUsers: 0,
          totalGames: 0,
          pendingReports: 0,
          activeUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usersPage, gamesPage, reportsPage]);

  const handleMuteUser = async (userId: number, userName: string) => {
    if (!confirm(`Mute ${userName} for 30 minutes? They won't be able to post or comment during this time.`)) {
      return;
    }

    try {
      await api.muteUser(userId);
      toast.success('User muted', {
        description: `${userName} has been muted for 30 minutes`,
      });
      // Refresh reports
      const reportsData = await api.getReports();
      setReports(reportsData.data || []);
    } catch (error: any) {
      console.error('Failed to mute user:', error);
      toast.error('Failed to mute user', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and will remove all their posts, comments, and data.`)) {
      return;
    }

    try {
      await api.deleteUser(userId);
      toast.success('User deleted', {
        description: `User "${userName}" has been permanently deleted`,
      });
      // Remove user from local state immediately
      setUsers(users.filter(u => u.id !== userId));
      // Update stats
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDismissReport = async (reportId: number) => {
    try {
      await api.dismissReport(reportId);
      alert('Report dismissed');
      // Refresh reports
      const reportsData = await api.getReports();
      setReports(reportsData.data || []);
    } catch (error: any) {
      console.error('Failed to dismiss report:', error);
      alert(error.message || 'Failed to dismiss report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>Admin Dashboard</h1>
              <p className="text-[#8f98a0]">Manage users, games, and platform settings</p>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border-[#2a475e] steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <Users className="h-4 w-4 text-[#66c0f4]" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-20 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.totalUsers}</div>
                  <p className="text-xs text-[#8f98a0] mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% this month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#2a475e] steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <Gamepad2 className="h-4 w-4 text-[#66c0f4]" />
                Total Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-20 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.totalGames}</div>
                  <p className="text-xs text-[#8f98a0] mt-1">Across all categories</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#2a475e] steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-20 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.pendingReports}</div>
                  <p className="text-xs text-yellow-500 mt-1">Requires attention</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#2a475e] steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <BarChart3 className="h-4 w-4 text-green-500" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-20 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.activeUsers}</div>
                  <p className="text-xs text-green-500 mt-1">Online now</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Users
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Games
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0]">User Management</CardTitle>
                <CardDescription className="text-[#8f98a0]">
                  View and manage all registered users ({totalUsersCount > 0 ? `${totalUsersCount} total` : 'loading...'})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full bg-[#2a475e]" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a475e] hover:bg-[#2a475e]/30">
                          <TableHead className="text-[#8f98a0]">Username</TableHead>
                          <TableHead className="text-[#8f98a0]">Email</TableHead>
                          <TableHead className="text-[#8f98a0]">Role</TableHead>
                          <TableHead className="text-[#8f98a0]">Status</TableHead>
                          <TableHead className="text-[#8f98a0]">Joined</TableHead>
                          <TableHead className="text-right text-[#8f98a0]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-[#2a475e] hover:bg-[#2a475e]/30">
                            <TableCell className="text-[#c7d5e0]">{user.name || user.username || user.email?.split('@')[0] || 'Unknown'}</TableCell>
                            <TableCell className="text-[#8f98a0]">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize border-[#66c0f4]/30 text-[#66c0f4]">
                                {user.role || 'user'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={user.is_banned ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}
                              >
                                {user.is_banned ? 'banned' : 'active'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[#8f98a0]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-[#2a475e] text-red-400 hover:bg-red-600 hover:text-white"
                                  onClick={() => handleDeleteUser(user.id, user.name || user.username || user.email)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination Controls */}
                    {!loading && usersTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a475e]">
                        <div className="text-sm text-[#8f98a0]">
                          Showing {users.length} of {totalUsersCount} users (Page {usersPage} of {usersTotalPages})
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUsersPage(1)}
                            disabled={usersPage === 1}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            First
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            disabled={usersPage === 1}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, usersTotalPages) }, (_, i) => {
                              let pageNum;
                              if (usersTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (usersPage <= 3) {
                                pageNum = i + 1;
                              } else if (usersPage >= usersTotalPages - 2) {
                                pageNum = usersTotalPages - 4 + i;
                              } else {
                                pageNum = usersPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  size="sm"
                                  variant={usersPage === pageNum ? "default" : "outline"}
                                  onClick={() => setUsersPage(pageNum)}
                                  className={
                                    usersPage === pageNum
                                      ? "bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0"
                                      : "border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e]"
                                  }
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                            disabled={usersPage === usersTotalPages}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Next
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUsersPage(usersTotalPages)}
                            disabled={usersPage === usersTotalPages}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games">
            <GameManagement 
              games={games}
              loading={loading}
              onRefresh={refreshGames}
              currentPage={gamesPage}
              totalPages={gamesTotalPages}
              totalGames={totalGamesCount}
              onPageChange={setGamesPage}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0]">Reports Management</CardTitle>
                <CardDescription className="text-[#8f98a0]">
                  Review and manage user reports ({totalReportsCount > 0 ? `${totalReportsCount} total` : 'loading...'})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full bg-[#2a475e]" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a475e] hover:bg-[#2a475e]/30">
                          <TableHead className="text-[#8f98a0]">Reporter</TableHead>
                          <TableHead className="text-[#8f98a0]">Reported User</TableHead>
                          <TableHead className="text-[#8f98a0]">Reason</TableHead>
                          <TableHead className="text-[#8f98a0]">Status</TableHead>
                          <TableHead className="text-[#8f98a0]">Date</TableHead>
                          <TableHead className="text-right text-[#8f98a0]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-[#8f98a0] py-8">
                              No reports found
                            </TableCell>
                          </TableRow>
                        ) : (
                          reports.map((report: any) => (
                            <TableRow key={report.id} className="border-[#2a475e] hover:bg-[#2a475e]/30">
                              <TableCell className="text-[#c7d5e0]">
                                {report.reporter?.username || `User #${report.reporter_id}`}
                              </TableCell>
                              <TableCell className="text-[#c7d5e0]">
                                {report.reported_user?.username || `User #${report.reported_user_id}`}
                              </TableCell>
                              <TableCell className="text-[#8f98a0] max-w-xs truncate">
                                {report.reason}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    report.status === 'reviewed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                    report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                                    'bg-[#2a475e] text-[#8f98a0] border-[#2a475e]'
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[#8f98a0]">
                                {new Date(report.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-[#2a475e] text-orange-400 hover:bg-[#2a475e]"
                                    onClick={() => handleMuteUser(
                                      report.reported_user_id, 
                                      report.reported_user?.username || `User #${report.reported_user_id}`
                                    )}
                                    disabled={report.status === 'reviewed'}
                                    title="Mute user for 30 minutes"
                                  >
                                    Mute 30min
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-[#2a475e] text-red-400 hover:bg-[#2a475e]"
                                    onClick={() => handleDismissReport(report.id)}
                                    disabled={report.status !== 'pending'}
                                    title="Dismiss this report"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>                    
                    {/* Pagination Controls for Reports */}
                    {!loading && reportsTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a475e]">
                        <div className="text-sm text-[#8f98a0]">
                          Showing {reports.length} of {totalReportsCount} reports (Page {reportsPage} of {reportsTotalPages})
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReportsPage(1)}
                            disabled={reportsPage === 1}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            First
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReportsPage(p => Math.max(1, p - 1))}
                            disabled={reportsPage === 1}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, reportsTotalPages) }, (_, i) => {
                              let pageNum;
                              if (reportsTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (reportsPage <= 3) {
                                pageNum = i + 1;
                              } else if (reportsPage >= reportsTotalPages - 2) {
                                pageNum = reportsTotalPages - 4 + i;
                              } else {
                                pageNum = reportsPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  size="sm"
                                  variant={reportsPage === pageNum ? "default" : "outline"}
                                  onClick={() => setReportsPage(pageNum)}
                                  className={
                                    reportsPage === pageNum
                                      ? "bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0"
                                      : "border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e]"
                                  }
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReportsPage(p => Math.min(reportsTotalPages, p + 1))}
                            disabled={reportsPage === reportsTotalPages}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Next
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReportsPage(reportsTotalPages)}
                            disabled={reportsPage === reportsTotalPages}
                            className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
