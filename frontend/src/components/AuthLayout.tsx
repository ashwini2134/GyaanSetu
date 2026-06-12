import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-slate-900 relative overflow-hidden">
      {/* Dynamic Theme-Adaptive Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="auth-glow-1"></div>
        <div className="auth-glow-2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Fraylon Academy"
            className="h-14 w-auto object-contain drop-shadow-lg"
          />
        </div>

        {/* Card */}
        <div className="auth-card rounded-xl p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
            <p className="text-slate-400 text-sm md:text-base">{subtitle}</p>
          </div>

          {children}

          {/* Footer Link */}
          <div className="mt-8 border-t border-slate-700/50 pt-6 text-center">
            <p className="text-sm text-slate-400">
              {footerText}{' '}
              {footerLink}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
