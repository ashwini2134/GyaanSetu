import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'w-full py-2.5 rounded-lg border bg-slate-900/60 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2';

  const paddingStyles = leftIcon 
    ? (rightIcon ? 'pl-10 pr-10' : 'pl-10 pr-4') 
    : (rightIcon ? 'pl-4 pr-10' : 'pl-4 pr-4');

  const stateStyles = error
    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
    : 'border-slate-700/80 focus:ring-blue-500/30 focus:border-blue-500 hover:border-slate-600/80';

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {leftIcon}
        </div>
      )}
      <input
        {...props}
        className={`${baseStyles} ${paddingStyles} ${stateStyles} ${className}`}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
  );
};
