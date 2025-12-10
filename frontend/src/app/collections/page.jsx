export const metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-3">Curated Collections</h1>
      <p className="text-neutral-600 mb-8">Discover themed bundles designed for lower environmental impact.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-card hover:shadow-card-hover transition transform hover:-translate-y-1">
            <div className="aspect-[4/3] bg-neutral-100 rounded-t-2xl" />
            <div className="p-4">
              <h3 className="font-medium">Collection {i}</h3>
              <p className="text-sm text-neutral-600 mt-1">Curated • Low Waste • Carbon Offset</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


