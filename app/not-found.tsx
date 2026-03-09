import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-semibold text-neutral-900">404</h1>
      <p className="text-neutral-500">This page could not be found.</p>
      <Link
        href="/"
        className="mt-2 text-sm underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        Go home
      </Link>
    </div>
  );
}
