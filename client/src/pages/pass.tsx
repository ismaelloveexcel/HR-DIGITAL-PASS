import { useMemo } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import UniversalPass from '@/components/UniversalPass';
import { getCandidateByCode } from '@/lib/api';
import { getCandidate as getLocalCandidate } from '@/lib/passDataStore';
import { Link } from 'wouter';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import type { CandidateWithRelations } from '@shared/schema';

export default function PassPage() {
  const [, params] = useRoute('/pass/:code');
  const code = params?.code ? decodeURIComponent(params.code).toUpperCase() : '';
  
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', code],
    queryFn: () => getCandidateByCode(code),
    enabled: !!code,
  });

  // Use local storage data as fallback
  const fallbackCandidate = useMemo(() => {
    if (!code) return undefined;
    return getLocalCandidate(code);
  }, [code]);

  const candidateData = candidate ?? fallbackCandidate;

  if (isLoading && !candidateData) {
    return (
      <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading pass...</p>
      </div>
    );
  }

  if ((!candidateData && !isLoading) || (error && !fallbackCandidate)) {
    return (
      <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid Access Code</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The code "{code}" does not exist in our system.</p>
        <Link href="/" className="flex items-center gap-2 text-[#1E40AF] dark:text-blue-400 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    );
  }

  return <UniversalPass candidate={candidateData!} />;
}
