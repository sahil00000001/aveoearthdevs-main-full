/**
 * Icon Component - Consistent icon system for Aveoearth
 * 
 * Features:
 * - Consistent sizing
 * - Accessible by default
 * - Support for custom SVGs and external icon libraries
 */

import Image from "next/image";

export default function Icon({ 
  name, 
  size = 16, 
  className = "",
  alt,
  ...props 
}) {
  // If alt text isn't provided, create descriptive text from the icon name
  const altText = alt || `${name.replace(/-/g, ' ')} icon`;

  return (
    <Image
      src={`/${name}.svg`}
      alt={altText}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      {...props}
    />
  );
}

// Alternative inline SVG component for custom icons
export function InlineSVG({ 
  children, 
  size = 16, 
  className = "",
  viewBox = "0 0 24 24",
  ...props 
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
}
