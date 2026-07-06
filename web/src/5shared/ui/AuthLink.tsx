import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  text: string;
}

export function AuthLink({ href, text }: AuthLinkProps) {
  return (
    <p className="mt-6 text-center text-xs text-slate-500">
      <Link href={href} className="text-blue-400 hover:text-blue-300 transition-colors">
        {text}
      </Link>
    </p>
  );
}
