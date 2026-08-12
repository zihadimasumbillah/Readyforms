"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
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
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Search, MoreHorizontal, Shield, ShieldOff, Ban, UserCheck, UserCog, Mail, Calendar, Clock, Lock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/api/admin-service';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types';

type StatusFilter = 'all' | 'active' | 'blocked' | 'admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailUserModal, setDetailUserModal] = useState<User | null>(null);
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
    let filtered = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) || 
        u.email?.toLowerCase().includes(query)
      );
    }
    
    if (status === 'blocked') {
      filtered = filtered.filter(u => u.blocked);
    } else if (status === 'active') {
      filtered = filtered.filter(u => !u.blocked);
    } else if (status === 'admin') {
      filtered = filtered.filter(u => u.isAdmin);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, status, users]);

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
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Governance & Profiles</h1>
        <p className="text-muted-foreground">Manage system users, credentials, roles, and security policies</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
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
                  <TableHead>User Profile</TableHead>
                  <TableHead>System Role & Status</TableHead>
                  <TableHead className="hidden md:table-cell">Registration Date</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center shrink-0">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{u.name}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {u.isAdmin ? (
                            <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                          {u.blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600">Active</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(u.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>User Governance</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDetailUserModal(u)}>
                              <UserCog className="mr-2 h-4 w-4 text-cyan-500" />
                              <span>View Full Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.isAdmin ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setAction('removeAdmin');
                                }}
                                disabled={u.id === auth?.user?.id}
                                className="text-amber-600"
                              >
                                <ShieldOff className="mr-2 h-4 w-4" />
                                <span>Remove Admin</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setAction('makeAdmin');
                                }}
                                disabled={u.id === auth?.user?.id}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Promote to Admin</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {u.blocked ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setAction('unblock');
                                }}
                                disabled={u.id === auth?.user?.id}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Unblock User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setAction('block');
                                }}
                                disabled={u.id === auth?.user?.id}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Block Account</span>
                              </DropdownMenuItem>
                            )}
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
                        <h3 className="text-lg font-semibold">No users match criteria</h3>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Interactive User View Details Modal */}
      <Dialog open={Boolean(detailUserModal)} onOpenChange={() => setDetailUserModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center">
                {detailUserModal?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p>{detailUserModal?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{detailUserModal?.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription>Full User Profile & Security Audit View</DialogDescription>
          </DialogHeader>

          {detailUserModal && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">System Role</span>
                  <Badge variant={detailUserModal.isAdmin ? "default" : "secondary"} className="mt-1">
                    {detailUserModal.isAdmin ? "Administrator" : "Standard User"}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Account Status</span>
                  <Badge variant={detailUserModal.blocked ? "destructive" : "outline"} className={`mt-1 ${!detailUserModal.blocked ? 'border-emerald-500 text-emerald-600' : ''}`}>
                    {detailUserModal.blocked ? "Blocked" : "Active"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2.5 rounded-lg border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-cyan-500" /> User UUID
                  </span>
                  <span className="font-mono text-xs">{detailUserModal.id}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-500" /> Email Address
                  </span>
                  <span className="font-medium">{detailUserModal.email}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-500" /> Registration Date
                  </span>
                  <span>{formatDate(detailUserModal.createdAt)}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-500" /> Last Active Timestamp
                  </span>
                  <span>{formatDate(detailUserModal.lastLoginAt)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDetailUserModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                `Are you sure you want to make ${selectedUser?.name} an admin?` : 
                `Are you sure you want to remove admin status from ${selectedUser?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirm Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
