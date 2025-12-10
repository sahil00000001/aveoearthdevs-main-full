export default function OrderTableHeader() {
  return (
    <div className="hidden sm:flex items-center py-4 px-7 border-b border-[#989898] bg-white">
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Order ID</span>
      </div>
      <div className="w-[180px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Product</span>
      </div>
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Items</span>
      </div>
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Total</span>
      </div>
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Date</span>
      </div>
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Status</span>
      </div>
      <div className="w-[120px] text-center">
        <span className="font-reem font-medium text-[16px] text-black">Action</span>
      </div>
    </div>
  );
}
