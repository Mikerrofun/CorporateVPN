'use client';

import { Dropdown, SwitchGlobal } from '@/5shared/ui';
import { useConnectPanel } from '../model/useConnectPanel';
import { Instructions } from './Instructions';
import type { OS } from '@/5shared/lib/device/types';
import type { ConnectPanelProps } from '../model/types';
import type { DropdownOption } from '@/5shared/ui/Dropdown';

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.954 4.45z" />
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 001 18h22a10.81 10.81 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.55L10.6 4.5v6.5H3V5.55zM11.6 4.35L21 3v8H11.6V4.35zM3 12h7.6v6.5L3 17.45V12zM11.6 12H21v9l-9.4-1.35V12z" />
    </svg>
  );
}

const OS_OPTIONS: DropdownOption[] = [
  { key: 'ios' as OS, label: 'iOS', icon: AppleIcon },
  { key: 'android' as OS, label: 'Android', icon: AndroidIcon },
  { key: 'windows' as OS, label: 'Windows', icon: WindowsIcon },
  { key: 'mac' as OS, label: 'macOS', icon: AppleIcon },
];

export function ConnectPanel({ subscriptionUrl }: ConnectPanelProps) {
  const {
    os,
    activeApp,
    apps,
    currentApp,
    handleOSChange,
    handleAppChange,
  } = useConnectPanel();

  if (!subscriptionUrl) {
    return (
      <div className="card border border-rose-500/10 bg-rose-500/5 p-6 text-center">
        <p className="text-sm font-semibold text-rose-300">VPN-ключ еще не выдан.</p>
        <p className="mt-1 text-xs text-slate-400">
          Пожалуйста, свяжитесь с системным администратором вашей компании для активации доступа.
        </p>
      </div>
    );
  }

  if (!currentApp) {
    return null;
  }

  return (
    <div className="card space-y-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight text-white">
          Как подключиться?
        </h2>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <SwitchGlobal
            equalWidth
            options={apps.map((app) => ({
              key: app.id,
              component: (
                <span
                  className={`flex h-11 items-center justify-center p-3.5 text-sm font-normal leading-none transition-colors duration-200 ${
                    activeApp === app.id ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {app.label}
                </span>
              ),
            }))}
            value={activeApp || ''}
            onChange={handleAppChange}
            className="border border-white/[0.05] bg-black/35 p-1 flex-[3]"
            sliderClassName="bg-gradient-to-r from-blue-600 to-indigo-600"
          />

          <Dropdown
            className="sm:flex-[2]"
            value={os}
            options={OS_OPTIONS}
            onSelect={(key) => handleOSChange(key as OS)}
          />
        </div>
      </div>

      <Instructions app={currentApp} subscriptionUrl={subscriptionUrl} />
    </div>
  );
}
