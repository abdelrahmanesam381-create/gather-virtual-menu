import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { getDashboard } from "@/lib/menu-service";
import { db } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string }>;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/login");
  const { menu: id } = await searchParams;
  const menu = await getDashboard(admin.id, id);
  if (!menu)
    return (
      <main className="standalone-card">
        <h1>No menu access</h1>
        <p>
          You don’t have access to this menu. Ask an admin to invite you, or
          choose another restaurant.
        </p>
        <Link className="button primary" href="/dashboard">
          Your restaurants
        </Link>
        <Link className="button secondary" href="/login">
          Sign in with another account
        </Link>
      </main>
    );
  const menus = await db.menu.findMany({
    where: { admins: { some: { adminId: admin.id } } },
    select: { id: true, pageTitle: true },
  });
  return (
    <Dashboard
      menu={JSON.parse(JSON.stringify(menu))}
      admin={{ id: admin.id, name: admin.name, email: admin.email }}
      menus={menus}
    />
  );
}
