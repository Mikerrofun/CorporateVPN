import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  text: string;
  linkText: string;
}

export function AuthLink({ href, text, linkText }: AuthLinkProps) {
  return (
    <p className="mt-6 text-center text-xs">
      <span className="text-slate-500">{text}</span>{' '}
      <Link href={href} className="text-accent">
        {linkText}
      </Link>
    </p>
  );
}
