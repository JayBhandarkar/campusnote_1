import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Download, BookOpen } from 'lucide-react';
import { api } from '../api/axios';
import { ResourceCard } from '../components/ui/ResourceCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export const FacultyVerifiedList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerified = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/me/verified');
        if (res.data?.success) {
          setResources(res.data.data?.resources || []);
        }
      } catch (err) {
        toast.error('Failed to load verified materials');
      } finally {
        setLoading(false);
      }
    };
    fetchVerified();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Materials Verified by You
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of all student contributions you have reviewed, endorsed, and awarded the "Faculty Verified" badge.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <ResourceCard key={res._id} resource={res} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No verified materials yet"
          description="Check the Verification Queue to review and endorse pending student notes."
          actionLabel="Go to Verification Queue"
          onAction={() => (window.location.href = '/verification-queue')}
        />
      )}
    </div>
  );
};
