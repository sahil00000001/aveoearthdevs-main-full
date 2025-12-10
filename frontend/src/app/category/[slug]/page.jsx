import { redirect } from "next/navigation";

export default function CategorySlugPage({ params }) {
  const { slug } = params || {};
  // Redirect to explore with category filter to leverage existing backend wiring/UI
  redirect(`/explore?category=${encodeURIComponent(slug || "")}`);
}


