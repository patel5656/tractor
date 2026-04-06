import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

const Button = forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const variants = {
    primary: "bg-emerald-600 text-earth-brown font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-earth-primary",
    secondary: "bg-earth-card-alt text-earth-brown border border-earth-dark/15 shadow-sm hover:bg-earth-card font-bold",
    outline: "bg-transparent text-earth-primary border-2 border-earth-primary/50 hover:bg-earth-primary/10 font-black uppercase tracking-widest",
    ghost: "bg-transparent text-earth-sub hover:bg-earth-card-alt hover:text-earth-brown font-bold",
    accent: "bg-earth-primary text-earth-brown font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:bg-earth-primary-hover",
    destructive: "bg-red-500 text-earth-brown font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-xl",
    md: "px-6 py-3 text-xs rounded-2xl",
    lg: "px-8 py-4 text-sm rounded-2xl",
    icon: "p-3 rounded-xl flex items-center justify-center",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
