import { AuthForm } from "@/components/auth-form";
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  return <AuthForm signup token={invite} />;
}
