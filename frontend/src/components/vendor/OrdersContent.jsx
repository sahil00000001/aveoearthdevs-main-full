import OrdersHeader from './orders/OrdersHeader';
import OrdersSearch from './orders/OrdersSearch';
import OrdersTable from './orders/OrdersTable';

export default function OrdersContent() {
  return (
    <div className="bg-white w-full h-full p-4 sm:p-7 pb-4">
      <div className="w-full">
        <OrdersHeader />
        <OrdersSearch />
        <OrdersTable />
      </div>
    </div>
  );
}
