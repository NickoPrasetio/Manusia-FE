'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useWorkerStore } from '@/store/workerStore';
import { useWorkersInfiniteQuery } from '@/hooks/useWorkersInfiniteQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { Worker } from '@/types';
import WorkerCard from './WorkerCard';
import WorkerDetailModal from './WorkerDetailModal';

function WorkerCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="flex justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/5" />
            <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
          </div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-2/5" />
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24" />
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-28 mb-1.5" />
          <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-24" />
        </div>
        <div className="h-8 bg-gray-200 rounded-xl animate-pulse w-16" />
      </div>
    </div>
  );
}

export default function WorkerList() {
  const { searchQuery, filterAvailable, setSearchQuery, setFilterAvailable } = useWorkerStore();
  const [inputValue,     setInputValue]     = useState(searchQuery);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(inputValue, 400);
  useEffect(() => { setSearchQuery(debouncedSearch); }, [debouncedSearch, setSearchQuery]);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkersInfiniteQuery(searchQuery, filterAvailable);

  const workers = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages.flatMap((p) => p.content) ?? []).filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, [data?.pages]);
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1, rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-4">

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Cari nama, lokasi, atau keahlian..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-gray-500" />
        <button
          onClick={() => setFilterAvailable(!filterAvailable)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            filterAvailable
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filterAvailable ? 'bg-white' : 'bg-green-400'}`} />
          Siap Bekerja
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <WorkerCardSkeleton key={i} />)}
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-2">{(error as Error)?.message ?? 'Gagal memuat data'}</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 text-blue-500 text-sm font-medium hover:underline">
            <RefreshCw size={14} /> Coba lagi
          </button>
        </div>
      )}

      {!isLoading && !isError && workers.length > 0 && (
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-800">{workers.length}</span>
          {totalElements > workers.length && <> dari <span className="font-semibold text-gray-800">{totalElements}</span></>} pekerja
        </p>
      )}

      {!isLoading && !isError && workers.length > 0 && (
        <div className="flex flex-col gap-3">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} onView={setSelectedWorker} />
          ))}
          <div ref={sentinelRef} className="h-1" aria-hidden />
          {isFetchingNextPage && <><WorkerCardSkeleton /><WorkerCardSkeleton /></>}
          {!hasNextPage && !isFetchingNextPage && (
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-gray-100" />
              <p className="text-xs text-gray-400 shrink-0">Semua {workers.length} pekerja sudah ditampilkan</p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && workers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-gray-600 font-medium">Tidak ada pekerja ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
        </div>
      )}

      {selectedWorker && (
        <WorkerDetailModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
      )}
    </div>
  );
}
