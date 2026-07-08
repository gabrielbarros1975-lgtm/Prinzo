import { Suspense } from 'react';
import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Carregando painel administrativo...</div>}>
      <AdminPageClient />
    </Suspense>
  );
}
