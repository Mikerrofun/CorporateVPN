interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
      {message}
    </p>
  );
}
