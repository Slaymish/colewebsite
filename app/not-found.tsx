import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-semibold text-black">404</h1>
      <p className="text-black/50">This page could not be found.</p>
      <Link
        href="/"
        className="mt-2 text-xs uppercase tracking-wider underline underline-offset-2 text-black/50 duration-100 hover:text-black"
      >
        Go home
      </Link>
    </div>
  );
}
