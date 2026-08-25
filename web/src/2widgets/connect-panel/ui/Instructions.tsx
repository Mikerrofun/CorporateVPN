'use client';

import { generateDeepLink } from '@/5shared/config/vpnApps.config';
import type { AppWithDownload } from '@/5shared/config/vpnApps.config';

interface InstructionsProps {
  app: AppWithDownload;
  subscriptionUrl: string;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export function Instructions({ app, subscriptionUrl }: InstructionsProps) {
  const deepLink = generateDeepLink(app.id, subscriptionUrl);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-xl border border-white/[0.03] bg-black/20 p-4">
        <h3 className="text-sm font-semibold text-white">1. Скачайте приложение</h3>
        {app.downloadLink ? (
          <a
            href={app.downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-3"
          >
            <DownloadIcon className="h-4 w-4" />
            Скачать {app.label}
          </a>
        ) : (
          <p className="text-sm text-slate-400">
            Ссылка для скачивания недоступна для этой платформы
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/[0.03] bg-black/20 p-4">
        <h3 className="text-sm font-semibold text-white">2. Добавьте ключ</h3>        <button
          type="button"
          onClick={() => {
            window.location.href = deepLink;
          }}
          className="btn-ghost w-full py-3"
        >
          <KeyIcon className="h-4 w-4 text-blue-400" />
          Добавить в {app.label}
        </button>
      </div>
    </div>
  );
}
