"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Shield, ShieldOff, Ban, UserCheck, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/api/admin-service';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types';

// Define possible filter statuses
type StatusFilter = 'all' | 'active' | 'blocked' | 'admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'block' | 'unblock' | 'makeAdmin' | 'removeAdmin' | null>(null);
  
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.isAdmin) {
        router.push('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const data = await adminService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, router]);

  useEffect(() => {
    // Apply search and filters
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (status === 'blocked') {
      filtered = filtered.filter(user => user.blocked);
    } else if (status === 'active') {
      filtered = filtered.filter(user => !user.blocked);
    } else if (status === 'admin') {
      filtered = filtered.filter(user => user.isAdmin);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, status, users]);

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !action) return;
    
    try {
      let result;
      
      switch (action) {
        case 'block':
        case 'unblock':
          result = await adminService.toggleUserBlock(selectedUser.id);
          break;
        case 'makeAdmin':
        case 'removeAdmin':
          result = await adminService.toggleUserAdmin(selectedUser.id);
          break;
      }
      
      if (result) {
        // Update the user in the local state
        const updatedUsers = users.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              blocked: action === 'block' ? true : action === 'unblock' ? false : u.blocked,
              isAdmin: action === 'makeAdmin' ? true : action === 'removeAdmin' ? false : u.isAdmin
            };
          }
          return u;
        });
        
        setUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: `User ${selectedUser.name} was ${
            action === 'block' ? 'blocked' : 
            action === 'unblock' ? 'unblocked' : 
            action === 'makeAdmin' ? 'made admin' : 
            'removed from admin'
          } successfully.`,
        });
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSelectedUser(null);
      setAction(null);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'Admin',
        email: user.email || 'admin@example.com',
        isAdmin: true
      }}
      onLogout={handleLogout}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <CardTitle>Users</CardTitle>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={status === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus('all')}
              >
                All
              </Button>
              <Button
                variant={status === 'active' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={status === 'blocked' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus('blocked')}
              >
                Blocked
              </Button>
              <Button
                variant={status === 'admin' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus('admin')}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.isAdmin && (
                            <Badge variant="default" className="bg-blue-500">
                              Admin
                            </Badge>
                          )}
                          {user.blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(user.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.id === auth?.user?.id}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {user.isAdmin ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAction('removeAdmin');
                                }}
                                disabled={user.id === auth?.user?.id}
                                className="text-amber-600"
                              >
                                <ShieldOff className="mr-2 h-4 w-4" />
                                <span>Remove Admin</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAction('makeAdmin');
                                }}
                                disabled={user.id === auth?.user?.id}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Make Admin</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.blocked ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAction('unblock');
                                }}
                                disabled={user.id === auth?.user?.id}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Unblock User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAction('block');
                                }}
                                disabled={user.id === auth?.user?.id}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Block User</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-semibold">No users found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery
                            ? "No users match your search criteria."
                            : "There are no users available."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedUser && !!action} onOpenChange={() => { setSelectedUser(null); setAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'block' ? 'Block User' : 
               action === 'unblock' ? 'Unblock User' : 
               action === 'makeAdmin' ? 'Make User Admin' : 
               'Remove Admin Status'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'block' ? 
                `Are you sure you want to block ${selectedUser?.name}? They will no longer be able to log in.` : 
               action === 'unblock' ? 
                `Are you sure you want to unblock ${selectedUser?.name}? They will be able to log in again.` : 
               action === 'makeAdmin' ? 
                `Are you sure you want to make ${selectedUser?.name} an admin? They will have full access to all areas of the application.` : 
                `Are you sure you want to remove admin status from ${selectedUser?.name}? They will lose access to admin areas.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {action === 'block' ? 'Block' : 
               action === 'unblock' ? 'Unblock' : 
               action === 'makeAdmin' ? 'Make Admin' : 
               'Remove Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
