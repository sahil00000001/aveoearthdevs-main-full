import Card, { CardContent, CardHeader } from "../ui/Card";

export default function AnalyticsContent() {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Analytics & Reports</h2>
        <p className="text-sm sm:text-base text-gray-600">View your sales analytics and reports here.</p>
      </div>
    </div>
  );
}
