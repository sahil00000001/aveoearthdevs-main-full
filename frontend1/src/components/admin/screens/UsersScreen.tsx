import React, { useEffect, useMemo, useState } from 'react';
import adminService from '../../../services/adminService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const roleColors: Record<string, string> = {
  admin: 'bg-emerald-100 text-emerald-700',
  supplier: 'bg-blue-100 text-blue-700',
  buyer: 'bg-purple-100 text-purple-700'
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-red-100 text-red-700'
};

const UsersScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[]; total: number; page: number; limit: number }>({ users: [], total: 0, page: 1, limit: 10 });

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data.total || 0) / limit)), [data.total, limit]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await adminService.getAllUsers({ page, limit, search, role: role === 'all' ? undefined : role, status: status === 'all' ? undefined : status });
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, limit, search, role, status]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setData(prev => ({ ...prev, users: prev.users.map(u => (u.id === userId ? { ...u, status: newStatus } : u)) }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Total: <span className="font-medium text-gray-900">{data.total}</span></p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-gray-500">Loading users...</TableCell></TableRow>
            ) : data.users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-gray-500">No users found</TableCell></TableRow>
            ) : (
              data.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                  <TableCell className="text-gray-700">{u.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[u.status] || 'bg-gray-100 text-gray-700'}`}>{u.status}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="ghost" className="hover:bg-emerald-50 text-emerald-700" onClick={() => handleStatusChange(u.id, 'active')}>Activate</Button>
                    <Button size="sm" variant="ghost" className="hover:bg-yellow-50 text-yellow-700" onClick={() => handleStatusChange(u.id, 'inactive')}>Deactivate</Button>
                    <Button size="sm" variant="ghost" className="hover:bg-red-50 text-red-600" onClick={() => handleStatusChange(u.id, 'suspended')}>Suspend</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}><ChevronLeftIcon className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}><ChevronRightIcon className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersScreen;


