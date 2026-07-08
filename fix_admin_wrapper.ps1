$src = 'src\app\admin\page.js'
$dst = 'src\app\admin\AdminPageClient.js'
Copy-Item -Path $src -Destination $dst -Force
$wrapper = @'
import { Suspense } from 'react';
import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Carregando painel administrativo...</div>}>
      <AdminPageClient />
    </Suspense>
  );
}
'@
Set-Content -Path $src -Value $wrapper -Encoding utf8
