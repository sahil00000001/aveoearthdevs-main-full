export const metadata = { title: "Impact" };

export default function ImpactPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-3">Impact & Methodology</h1>
      <p className="text-neutral-600 mb-8">Stories and stats. Third-party verified where applicable.</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-card">
          <div className="text-4xl font-bold text-[var(--color-eco-primary)]">2,847</div>
          <div className="text-sm text-neutral-600">trees planted (YTD)</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-card">
          <div className="text-4xl font-bold text-[var(--color-eco-primary)]">15.2T</div>
          <div className="text-sm text-neutral-600">CO₂ offset (verified)</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-card">
          <div className="text-4xl font-bold text-[var(--color-eco-primary)]">500K+</div>
          <div className="text-sm text-neutral-600">plastic items saved</div>
        </div>
      </div>
    </div>
  );
}


