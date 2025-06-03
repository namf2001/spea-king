'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Download,
  Search,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  BookOpen,
  Mic,
  RefreshCw,
  MoreVertical,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getActivityLogs,
  cleanupOldData,
  exportUserData,
} from '@/app/actions/admin';
import { logout } from '@/app/actions/auth';
import { Role } from '@prisma/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalExercises: number;
  totalSpeakingRecords: number;
  userGrowth: Array<{ date: string; count: number }>;
  activityStats: Array<{ name: string; value: number }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastActive?: string;
  }>;
  systemHealth: {
    dbConnection: boolean;
    totalRecords: number;
    avgResponseTime: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  exerciseCount: number;
  speakingRecordCount: number;
  lastActive?: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Load admin statistics
  const loadStats = async () => {
    try {
      const response = await getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error('Không thể tải thống kê admin');
        console.error('Failed to load admin stats:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi tải thống kê');
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users with pagination
  const loadUsers = async (page: number = 1, search: string = '') => {
    setUserLoading(true);
    try {
      const response = await getAllUsers(page, 10, search);
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      } else {
        toast.error('Không thể tải danh sách người dùng');
        console.error('Failed to load users:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi tải người dùng');
      console.error('Error loading users:', error);
    } finally {
      setUserLoading(false);
    }
  };

  // Load activity logs
  const loadActivityLogs = async () => {
    try {
      const response = await getActivityLogs(50);
      if (response.success && response.data) {
        setActivityLogs(response.data.logs);
      } else {
        toast.error('Không thể tải nhật ký hoạt động');
        console.error('Failed to load activity logs:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi tải nhật ký');
      console.error('Error loading activity logs:', error);
    }
  };

  // Handle user role update
  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        toast.success('Cập nhật quyền thành công');
        loadUsers(currentPage, searchTerm);
      } else {
        toast.error('Không thể cập nhật quyền');
        console.error('Failed to update role:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật quyền');
      console.error('Error updating role:', error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        toast.success('Xóa người dùng thành công');
        loadUsers(currentPage, searchTerm);
        loadStats(); // Refresh stats
      } else {
        toast.error('Không thể xóa người dùng');
        console.error('Failed to delete user:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng');
      console.error('Error deleting user:', error);
    }
  };

  // Handle data cleanup
  const handleCleanup = async () => {
    try {
      const response = await cleanupOldData(90);
      if (response.success && response.data) {
        toast.success(`Đã xóa ${response.data.deletedRecords} bản ghi cũ`);
        loadStats(); // Refresh stats
      } else {
        toast.error('Không thể dọn dẹp dữ liệu');
        console.error('Failed to cleanup data:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi dọn dẹp dữ liệu');
      console.error('Error cleaning up data:', error);
    }
  };

  // Handle data export
  const handleExport = async () => {
    try {
      const response = await exportUserData();
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Xuất dữ liệu thành công');
      } else {
        toast.error('Không thể xuất dữ liệu');
        console.error('Failed to export data:', response.error);
      }
    } catch (error) {
      toast.error('Lỗi khi xuất dữ liệu');
      console.error('Error exporting data:', error);
    }
  };

  // Search users
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadUsers(1, value);
  };

  // Handle admin logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadActivityLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-8 w-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bảng Điều Khiển Admin</h1>
            <p className="text-muted-foreground">
              Quản lý người dùng và theo dõi hoạt động hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất Dữ Liệu
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Dọn Dẹp
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Dọn dẹp dữ liệu cũ</AlertDialogTitle>
                  <AlertDialogDescription>
                    Điều này sẽ xóa các bản ghi speaking cũ hơn 90 ngày. Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanup}>
                    Xác Nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              onClick={handleLogout} 
              variant="destructive"
              disabled={isLoggingOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Đang xuất...' : 'Đăng Xuất'}
            </Button>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="users">Người Dùng</TabsTrigger>
          <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
          <TabsTrigger value="logs">Nhật Ký</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={itemVariants}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.activeUsers ?? 0} hoạt động trong 30 ngày
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bài Tập</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalExercises ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng bài tập từ vựng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buổi Luyện</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSpeakingRecords ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng buổi luyện speaking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hệ Thống</CardTitle>
                <div className="flex items-center">
                  {stats?.systemHealth.dbConnection ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.systemHealth.avgResponseTime ?? 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Thời gian phản hồi DB
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động Hàng Ngày (7 ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.userGrowth ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt Động Theo Loại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.activityStats ?? []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(stats?.activityStats ?? []).map((entry) => (
                            <Cell key={entry.name} fill={COLORS[Math.floor(Math.random() * COLORS.length)]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Users */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Người Dùng Mới Nhất</CardTitle>
                <CardDescription>
                  10 người dùng đăng ký gần đây nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Quyền</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead>Hoạt Động Cuối</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>{user.lastActive ?? 'Chưa có'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quản Lý Người Dùng</CardTitle>
                <CardDescription>
                  Tìm kiếm, chỉnh sửa quyền và quản lý người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Quyền</TableHead>
                      <TableHead>Bài Tập</TableHead>
                      <TableHead>Luyện Tập</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead>Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          <RefreshCw className="inline h-4 w-4 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.exerciseCount}</TableCell>
                          <TableCell>{user.speakingRecordCount}</TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRole(
                                      user.id,
                                      user.role === 'ADMIN' ? Role.USER : Role.ADMIN
                                    )
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {user.role === 'ADMIN' ? 'Hạ Quyền' : 'Thăng Quyền'}
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa Người Dùng
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa người dùng {user.name}? 
                                        Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => loadUsers(currentPage - 1, searchTerm)}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => loadUsers(currentPage + 1, searchTerm)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Phân Tích Chi Tiết</CardTitle>
                <CardDescription>
                  Thống kê và xu hướng sử dụng hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.activityStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Nhật Ký Hoạt Động</CardTitle>
                <CardDescription>
                  Theo dõi hoạt động của người dùng trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            {log.action === 'PRONUNCIATION_PRACTICE' && <Mic className="h-4 w-4" />}
                            {log.action === 'CONVERSATION_PRACTICE' && <MessageSquare className="h-4 w-4" />}
                            {log.action === 'REFLEX_PRACTICE' && <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{log.userName}</p>
                            <p className="text-sm text-muted-foreground">{log.details}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}