import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { 
    env: { NODE_ENV: 'production' },
    browser: true,
    version: '',
    nextTick: (fn: any) => setTimeout(fn, 0),
    cwd: () => '/',
  };
}
