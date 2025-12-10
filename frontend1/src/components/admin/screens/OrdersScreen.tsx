import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusColor: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Processing: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const OrdersScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const a = await adminService.getAnalytics();
        setOrders(a.orders || []);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-gray-500">Loading orders...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-gray-500">No orders found</TableCell></TableRow>
            ) : orders.map((o, idx) => (
              <TableRow key={idx}>
                <TableCell><span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span></TableCell>
                <TableCell className="font-medium">{o.count}</TableCell>
                <TableCell className="text-gray-700">{o.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersScreen;

