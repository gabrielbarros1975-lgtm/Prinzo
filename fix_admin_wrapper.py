from pathlib import Path
src = Path('src/app/admin/page.js')
dst = Path('src/app/admin/AdminPageClient.js')
text = src.read_text(encoding='utf-8')
dst.write_text(text, encoding='utf-8')
wrapper = """import { Suspense } from 'react';
import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className=\"min-h-[70vh] flex items-center justify-center\">Carregando painel administrativo...</div>}>
      <AdminPageClient />
    </Suspense>
  );
}
"""
src.write_text(wrapper, encoding='utf-8')
print('done')
