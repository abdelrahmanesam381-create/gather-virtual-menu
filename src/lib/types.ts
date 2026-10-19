export type MenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  photoUrl: string | null;
  isHidden: boolean;
};
export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  placements: { id: string; position: number; item: MenuItem }[];
};
export type MenuData = {
  id: string;
  slug: string;
  currency: string;
  pageTitle: string | null;
  description: string | null;
  bannerImageUrl: string | null;
  address: string | null;
  phone: string | null;
  contactEmail: string | null;
  mapUrl: string | null;
  categories: MenuCategory[];
  items: MenuItem[];
};
export type DashboardData = MenuData & {
  admins: { admin: { id: string; name: string | null; email: string } }[];
  invitations: {
    id: string;
    email: string;
    status: string;
    expiresAt: string;
  }[];
};
