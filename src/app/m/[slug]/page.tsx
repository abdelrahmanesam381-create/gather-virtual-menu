import { cache } from "react";
import { notFound } from "next/navigation";
import { getPublicMenu } from "@/lib/public-menu";
import { PublicMenu } from "@/components/public-menu";
import { LiveRefresh } from "@/components/live-refresh";
const read = cache(getPublicMenu);
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await read(slug);
  if (!menu) return { title: "Menu not found" };
  const base = process.env.APP_URL || "http://localhost:3000";
  return {
    title: menu.pageTitle || "Our menu",
    description: menu.description || "Discover our menu.",
    openGraph: {
      title: menu.pageTitle || "Our menu",
      description: menu.description || "Discover our menu.",
      ...(menu.bannerImageUrl
        ? { images: [new URL(menu.bannerImageUrl, base).toString()] }
        : {}),
    },
  };
}
export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await read(slug);
  if (!menu) notFound();
  return (
    <main>
      <PublicMenu menu={menu} />
      <LiveRefresh />
    </main>
  );
}
