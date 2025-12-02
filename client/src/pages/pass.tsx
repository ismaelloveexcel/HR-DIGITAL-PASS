import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import UniversalPass from '@/components/UniversalPass';
import { getCandidateByCode } from '@/lib/api';
import { Link } from 'wouter';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function PassPage() {
  const [, params] = useRoute('/pass/:code');
  const code = params?.code ? decodeURIComponent(params.code).toUpperCase() : '';
  
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', code],
    queryFn: () => getCandidateByCode(code),
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading pass...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Access Code</h1>
        <p className="text-slate-500 mb-8">The code "{code}" does not exist in our system.</p>
        <Link href="/" className="flex items-center gap-2 text-[#1E40AF] font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    );
  }

  return <UniversalPass candidate={candidate} />;
}
