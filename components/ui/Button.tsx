
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'notion';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100",
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500",
    notion: "bg-transparent hover:bg-slate-100 text-slate-700 text-left justify-start font-medium px-2 py-1.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <i className="fas fa-circle-notch animate-spin"></i>
      ) : children}
    </button>
  );
};
