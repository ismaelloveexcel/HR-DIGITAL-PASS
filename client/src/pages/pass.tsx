import { useMemo } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import UniversalPass from '@/components/UniversalPass';
import { getCandidateByCode } from '@/lib/api';
import { Link } from 'wouter';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mockData';
import type { CandidateWithRelations } from '@shared/schema';

export default function PassPage() {
  const [, params] = useRoute('/pass/:code');
  const code = params?.code ? decodeURIComponent(params.code).toUpperCase() : '';
  
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', code],
    queryFn: () => getCandidateByCode(code),
    enabled: !!code,
  });

  const fallbackCandidate = useMemo(() => {
    if (!code) return undefined;
    return buildMockCandidate(code);
  }, [code]);

  const candidateData = candidate ?? fallbackCandidate;

  if (isLoading && !candidateData) {
    return (
      <div className="min-h-screen bg-subtle flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading pass...</p>
      </div>
    );
  }

  if ((!candidateData && !isLoading) || (error && !fallbackCandidate)) {
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

  return <UniversalPass candidate={candidateData!} />;
}

function buildMockCandidate(code: string): CandidateWithRelations | undefined {
  const mock = MOCK_USERS[code];
  if (!mock) return undefined;

  const now = new Date();

  const timeline = (mock.timeline ?? []).map((item, index) => ({
    id: -(index + 1),
    candidateId: -1,
    title: item.title,
    date: item.date,
    status: item.status,
    order: index + 1,
    createdAt: now,
  }));

  const evaluations = (mock.stats ?? []).map((stat, index) => ({
    id: -(index + 1),
    candidateId: -1,
    type: stat.label,
    score: stat.value,
    notes: '',
    evaluator: stat.icon ?? 'Auto',
    date: '—',
    createdAt: now,
  }));

  const documents = [
    {
      id: -1,
      candidateId: -1,
      title: 'Universal Brief',
      type: 'Summary',
      url: '#',
      uploadedAt: now,
    },
    {
      id: -2,
      candidateId: -1,
      title: 'Latest Update',
      type: 'Note',
      url: '#',
      uploadedAt: now,
    },
  ];

  return {
    id: -1,
    code: mock.code,
    name: mock.name,
    title: mock.title,
    email: mock.email ?? `${mock.name.split(' ')[0].toLowerCase()}@example.com`,
    phone: mock.phone ?? null,
    department: mock.department ?? null,
    location: mock.location ?? null,
    status: mock.status,
    createdAt: now,
    timeline,
    evaluations,
    documents,
  };
}
