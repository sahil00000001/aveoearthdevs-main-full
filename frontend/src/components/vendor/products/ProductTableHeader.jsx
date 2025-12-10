export default function ProductTableHeader() {
  return (
    <div className="hidden sm:grid grid-cols-12 gap-4 py-4 text-[16px] font-reem-kufi font-medium text-black">
      <div className="col-span-4 text-left pl-4">
        Product
      </div>
      <div className="col-span-2 text-center">
        Product
      </div>
      <div className="col-span-1 text-center">
        Price
      </div>
      <div className="col-span-1 text-center">
        Stock
      </div>
      <div className="col-span-2 text-center">
        Status
      </div>
      <div className="col-span-2 text-center">
        Action
      </div>
    </div>
  );
}
