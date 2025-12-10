"use client";

import { forwardRef } from "react";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false,
  type = "button",
  as: Component = "button",
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-poppins font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl border-2 border-emerald-600 hover:border-emerald-700",
    secondary: "bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 shadow-md hover:shadow-lg",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white",
    ghost: "text-emerald-700 hover:bg-emerald-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
    xl: "px-10 py-5 text-xl rounded-3xl"
  };
  
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  
  return (
    <Component
      ref={ref}
      type={Component === "button" ? type : undefined}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;