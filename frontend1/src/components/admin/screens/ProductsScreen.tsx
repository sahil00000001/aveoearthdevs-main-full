import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await adminService.getAllProducts({ search: search || undefined, status: status === 'all' ? undefined : status, limit: 10 });
        setProducts(result.products);
      } finally { setLoading(false); }
    };
    fetch();
  }, [search, status]);

  const review = async (id: string, approved: boolean) => {
    await adminService.reviewProduct(id, approved);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: approved ? 'approved' : 'rejected' } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <Input className="w-64" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">Loading products...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">No products found</TableCell></TableRow>
            ) : products.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name || 'Product'}</TableCell>
                <TableCell className="text-gray-700">{p.supplier_name || '—'}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-md text-xs font-medium ${p.status==='approved'?'bg-emerald-100 text-emerald-700':p.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{p.status || 'pending'}</span></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => review(p.id, true)}>Approve</Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => review(p.id, false)}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductsScreen;


