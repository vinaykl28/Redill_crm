declare module 'next' {
  export type Metadata = {
    title?: string | { default: string; template: string };
    description?: string;
    icons?: any;
    keywords?: string[];
  };
  export type NextConfig = any;
}

declare module 'next/types.js';
declare module 'next/server' {
  export class NextRequest extends Request {
    [key: string]: any;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    [key: string]: any;
  }
}
declare module 'next/server.js' {
  export * from 'next/server';
}


declare module 'next/font/google' {
  export function Geist(options?: any): { variable: string; className: string };
  export function Geist_Mono(options?: any): { variable: string; className: string };
  export function Inter(options?: any): { variable: string; className: string };
}

declare module 'next/image' {
  import React from 'react';
  const Image: React.FC<any>;
  export default Image;
}

declare module 'next/link' {
  import React from 'react';
  const Link: React.FC<any>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
}

declare module 'lucide-react';
