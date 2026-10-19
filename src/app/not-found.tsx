import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone-card">
      <h1>This table hasn’t been set.</h1>
      <p>We couldn’t find that menu. Check the link with the restaurant.</p>
      <Link href="/" className="button secondary">
        Go to Gather
      </Link>
    </main>
  );
}
