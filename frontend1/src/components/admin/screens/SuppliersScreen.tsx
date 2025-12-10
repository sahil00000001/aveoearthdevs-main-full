import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const SuppliersScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // placeholder using users endpoint as mock
        const result = await adminService.getAllUsers({ role: 'supplier', limit: 10 });
        setSuppliers(result.users.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email, status: 'pending' })));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openReview = (s: any, a: 'approve' | 'reject') => { setSelectedSupplier(s); setAction(a); setComment(''); setReviewOpen(true); };
  const submitReview = async () => {
    // Wire to backend when available
    setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? { ...s, status: action === 'approve' ? 'verified' : 'rejected' } : s));
    setReviewOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">Loading suppliers...</TableCell></TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">No suppliers found</TableCell></TableRow>
            ) : suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-gray-700">{s.email}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-md text-xs font-medium ${s.status==='verified'?'bg-emerald-100 text-emerald-700':s.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{s.status}</span></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openReview(s, 'approve')} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => openReview(s, 'reject')} className="border-red-200 text-red-700 hover:bg-red-50">Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === 'approve' ? 'Approve Supplier' : 'Reject Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Supplier: <span className="font-medium text-gray-900">{selectedSupplier?.name}</span></p>
            <Input placeholder="Add an optional review comment" value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} className={action==='approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}>
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersScreen;


