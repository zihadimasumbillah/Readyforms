"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/lib/api/admin-service";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Shield, 
  ShieldOff, 
  UserCheck,
  UserX,
  ChevronLeft,
  UserCog,
  RefreshCw,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [userToModify, setUserToModify] = useState<User | null>(null);
  const [modifyAction, setModifyAction] = useState<'block' | 'unblock' | 'admin' | 'removeAdmin' | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      applyFilters(data, searchQuery, filterStatus, filterRole);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Check if user is admin
      if (!user.isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        router.push('/dashboard');
        return;
      }
      
      fetchUsers();
    } else {
      // Redirect to login if no user is found
      router.push('/auth/login');
    }
  }, [user, router]);

  const applyFilters = (userList: User[], query: string, status: string, role: string) => {
    let filtered = [...userList];
    
    // Apply search filter
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(lowercaseQuery) || 
        user.email.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply status filter
    if (status === 'blocked') {
      filtered = filtered.filter(user => user.blocked);
    } else if (status === 'active') {
      filtered = filtered.filter(user => !user.blocked);
    }
    
    // Apply role filter
    if (role === 'admin') {
      filtered = filtered.filter(user => user.isAdmin);
    } else if (role === 'regular') {
      filtered = filtered.filter(user => !user.isAdmin);
    }
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyFilters(users, searchQuery, filterStatus, filterRole);
  }, [searchQuery, filterStatus, filterRole, users]);

  const handleToggleBlock = async (targetUser: User) => {
    // Prevent self-blocking
    if (targetUser.id === user?.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot block your own account",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setProcessingId(targetUser.id);
      const updatedUser = await adminService.toggleUserBlock(targetUser.id);
      
      // Update users list
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      toast({
        title: "Success",
        description: `User ${updatedUser.blocked ? 'blocked' : 'unblocked'} successfully`,
        variant: "default"
      });
      
      setModifyAction(null);
      setUserToModify(null);
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleAdmin = async (targetUser: User) => {
    // Prevent self-modification
    if (targetUser.id === user?.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot change your own admin status",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setProcessingId(targetUser.id);
      const updatedUser = await adminService.toggleUserAdmin(targetUser.id);
      
      // Update users list
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      toast({
        title: "Success",
        description: `User ${updatedUser.isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`,
        variant: "default"
      });
      
      setModifyAction(null);
      setUserToModify(null);
    } catch (error) {
      console.error("Error toggling user admin status:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (user: User, action: 'block' | 'unblock' | 'admin' | 'removeAdmin') => {
    setUserToModify(user);
    setModifyAction(action);
  };

  const cancelAction = () => {
    setUserToModify(null);
    setModifyAction(null);
  };

  const executeAction = () => {
    if (!userToModify) return;
    
    if (modifyAction === 'block' || modifyAction === 'unblock') {
      handleToggleBlock(userToModify);
    } else if (modifyAction === 'admin' || modifyAction === 'removeAdmin') {
      handleToggleAdmin(userToModify);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Loading users</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'Admin User',
        email: user.email || 'admin@example.com',
        isAdmin: true
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <div onClick={() => router.push('/admin')}>
              <ChevronLeft className="h-4 w-4" />
            </div>
          </Button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Filter:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{userItem.name}</span>
                          <span className="text-xs text-muted-foreground">{userItem.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(userItem.createdAt)}
                      </TableCell>
                      <TableCell>
                        {userItem.blocked ? (
                          <Badge variant="destructive" className="font-normal">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-500 border-green-500 font-normal">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {userItem.isAdmin ? (
                          <Badge variant="default" className="bg-amber-500 hover:bg-amber-500 font-normal">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-normal">
                            Regular
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={processingId === userItem.id}
                              className={processingId === userItem.id ? "opacity-50 cursor-wait" : ""}
                            >
                              {processingId === userItem.id ? (
                                <span className="flex items-center">
                                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                  Processing
                                </span>
                              ) : (
                                <div className="flex items-center">
                                  <UserCog className="h-4 w-4 mr-1" />
                                  <span>Manage</span>
                                </div>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => router.push(`/admin/users/${userItem.id}`)}
                              disabled={processingId === userItem.id}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Toggle block status - disable for self */}
                            {userItem.blocked ? (
                              <DropdownMenuItem
                                onClick={() => confirmAction(userItem, 'unblock')}
                                disabled={processingId === userItem.id || userItem.id === user.id}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unblock User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => confirmAction(userItem, 'block')}
                                disabled={processingId === userItem.id || userItem.id === user.id}
                                className={userItem.id === user.id ? "text-muted-foreground cursor-not-allowed" : "text-red-600"}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {userItem.id === user.id ? "Cannot Block Yourself" : "Block User"}
                              </DropdownMenuItem>
                            )}
                            
                            {/* Toggle admin status - disable for self */}
                            {userItem.isAdmin ? (
                              <DropdownMenuItem
                                onClick={() => confirmAction(userItem, 'removeAdmin')}
                                disabled={processingId === userItem.id || userItem.id === user.id}
                                className={userItem.id === user.id ? "text-muted-foreground cursor-not-allowed" : ""}
                              >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                {userItem.id === user.id ? "Cannot Remove Own Admin" : "Remove Admin Role"}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => confirmAction(userItem, 'admin')}
                                disabled={processingId === userItem.id}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action confirmation dialogs */}
      <AlertDialog open={!!userToModify && !!modifyAction} onOpenChange={() => cancelAction()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {modifyAction === 'block' && "Block User"}
              {modifyAction === 'unblock' && "Unblock User"}
              {modifyAction === 'admin' && "Make User Admin"}
              {modifyAction === 'removeAdmin' && "Remove Admin Status"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {modifyAction === 'block' && `Are you sure you want to block ${userToModify?.name}? They will no longer be able to log in or access the system.`}
              {modifyAction === 'unblock' && `Are you sure you want to unblock ${userToModify?.name}? This will restore their access to the system.`}
              {modifyAction === 'admin' && `Are you sure you want to give ${userToModify?.name} administrator privileges? This will grant them full access to the system.`}
              {modifyAction === 'removeAdmin' && `Are you sure you want to remove administrator privileges from ${userToModify?.name}? They will no longer have admin access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} className={modifyAction === 'block' ? "bg-red-600 hover:bg-red-700" : ""}>
              {modifyAction === 'block' && "Block User"}
              {modifyAction === 'unblock' && "Unblock User"}
              {modifyAction === 'admin' && "Make Admin"}
              {modifyAction === 'removeAdmin' && "Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
