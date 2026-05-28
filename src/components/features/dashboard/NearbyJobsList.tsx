'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin, Navigation, Briefcase } from 'lucide-react';
import { JobCategory } from '@/types';
import { useNearbyJobs, NearbyJobWithDistance } from '@/hooks/useNearbyJobs';

const CATEGORY_META: Record<JobCategory, { label: string; color: string; dot: string }> = {
  TASK:    { label: 'Task',    color: 'bg-blue-50   text-blue-600',   dot: 'bg-blue-400'   },
  PROJECT: { label: 'Project', color: 'bg-violet-50 text-violet-600', dot: 'bg-violet-400' },
  EVENT:   { label: 'Event',   color: 'bg-rose-50   text-rose-600',   dot: 'bg-rose-400'   },
};

function JobCard({ job }: { job: NearbyJobWithDistance }) {
  const distLabel =
    job.distKm === 0
      ? null
      : job.distKm < 1
        ? `${Math.round(job.distKm * 1000)} m`
        : `${job.distKm.toFixed(1)} km`;

  const meta = CATEGORY_META[job.category];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        {distLabel && (
          <span className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
            <Navigation size={10} />
            {distLabel}
          </span>
        )}
      </div>

      <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{job.title}</p>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2.5">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-blue-600">
          Rp {job.budgetPerDay.toLocaleString('id-ID')}
          <span className="text-xs font-normal text-gray-400">/hari</span>
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-300" />
            {job.city}
          </span>
          <span className="text-gray-300">·</span>
          <span>{job.durationDays} hari</span>
        </div>
      </div>
    </div>
  );
}

export default function NearbyJobsList() {
  const [activeCategory, setActiveCategory] = useState<JobCategory | ''>('');

  const {
    jobs,
    total,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
  } = useNearbyJobs(50, activeCategory);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          fetchMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isLoading, fetchMore]);

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-blue-500" />
        <h3 className="font-bold text-gray-900 text-base">Pekerjaan di Sekitar</h3>
        {total > 0 && (
          <span className="ml-auto text-[11px] bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
            {total} tersedia
          </span>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {([
          { value: '',        label: 'Semua'   },
          { value: 'TASK',    label: 'Task'    },
          { value: 'PROJECT', label: 'Project' },
          { value: 'EVENT',   label: 'Event'   },
        ] as { value: JobCategory | ''; label: string }[]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === tab.value
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Mencari pekerjaan terdekat…</span>
        </div>
      )}

      {/* Job list — sentinel lives at the bottom of the cards so it starts below the fold */}
      {!isLoading && jobs.length > 0 && (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          <div ref={sentinelRef} className="h-1" aria-hidden />
        </div>
      )}

      {/* Status indicators outside the list */}
      {isFetchingMore && (
        <div className="flex items-center justify-center gap-2 py-3 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-medium">Memuat pekerjaan lainnya…</span>
        </div>
      )}
      {!isLoading && !hasMore && jobs.length > 0 && !isFetchingMore && (
        <p className="text-[11px] text-gray-300 font-medium text-center py-3">
          — Semua {total} pekerjaan telah dimuat —
        </p>
      )}

      {/* Empty */}
      {!isLoading && jobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-2 text-center">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Tidak ada pekerjaan tersedia</p>
          <p className="text-xs text-gray-400">
            {activeCategory
              ? `Belum ada ${activeCategory.toLowerCase()} terbuka di sekitarmu.`
              : 'Belum ada pekerjaan terbuka di sekitarmu.'}
          </p>
        </div>
      )}
    </div>
  );
}
