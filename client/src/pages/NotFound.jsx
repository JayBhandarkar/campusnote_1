import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <BookOpen className="w-8 h-8" />
      </div>
      <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">404 Error</span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The study material, subject module, or administrative page you are looking for does not exist or has been relocated.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => window.history.back()} icon={ArrowLeft}>
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
