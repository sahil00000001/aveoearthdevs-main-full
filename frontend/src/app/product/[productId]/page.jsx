import { redirect } from "next/navigation";

export default function ProductByIdPage({ params }) {
  const { productId } = params || {};
  // Forward to existing dynamic product route if available
  if (productId) {
    redirect(`/products/${encodeURIComponent(productId)}`);
  }
  redirect("/explore");
}


