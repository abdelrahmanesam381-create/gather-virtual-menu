import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync } from "node:fs";
const db = new PrismaClient();
const email = process.env.SEED_EMAIL || "demo@example.com";
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12)
  throw Error("Set SEED_PASSWORD to at least 12 characters before seeding.");
if (await db.menu.findUnique({ where: { slug: "olive-table" } })) {
  console.log("Sample menu already exists; left unchanged.");
  await db.$disconnect();
  process.exit(0);
}
if (await db.admin.findUnique({ where: { email } }))
  throw Error(
    "Seed email already exists. Choose a new email; existing accounts are never changed by the seed.",
  );
const photo = (name: string) =>
  existsSync(`public/images/${name}.webp`) ? `/images/${name}.webp` : null;
await db.$transaction(async (tx) => {
  const admin = await tx.admin.create({
    data: {
      name: "Alex Morgan",
      email,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  const menu = await tx.menu.create({
    data: {
      slug: "olive-table",
      pageTitle: "The Olive Table",
      description:
        "Seasonal ingredients, Mediterranean roots, and a little love in every dish. Pull up a chair. Stay a while.",
      currency: "EGP",
      bannerImageUrl: photo("restaurant"),
      address: "18 Road 9, Maadi, Cairo",
      phone: "+20 2 2358 0142",
      contactEmail: "hello@example.com",
      mapUrl: "https://maps.google.com/?q=Maadi+Cairo",
      admins: { create: { adminId: admin.id } },
    },
  });
  const groups = [
    {
      name: "Small plates",
      description: "A few good things to start with.",
      items: [
        {
          title: "Roasted tomato bruschetta",
          description:
            "Sourdough, slow-roasted tomatoes, fresh basil & a drizzle of olive oil.",
          price: "95.00",
          image: "bruschetta",
        },
        {
          title: "Garden greens",
          description:
            "Seasonal leaves, cherry tomatoes, cucumber & our lemon herb dressing.",
          price: "110.00",
          image: "salad",
        },
        {
          title: "Burrata & heirloom tomatoes",
          description:
            "Creamy burrata, sweet tomatoes, basil oil & toasted sourdough.",
          price: "165.00",
          image: "salad",
          hidden: true,
        },
      ],
    },
    {
      name: "From the kitchen",
      description: "Made slowly. Enjoyed together.",
      items: [
        {
          title: "Basil pesto linguine",
          description:
            "Fresh linguine tossed in basil pesto, parmesan & toasted pine nuts.",
          price: "220.00",
          image: "pasta",
        },
        {
          title: "Pan-seared salmon",
          description:
            "Atlantic salmon, roasted seasonal vegetables & lemon butter sauce.",
          price: "340.00",
          image: "salmon",
        },
      ],
    },
    {
      name: "Something sweet",
      description: "There’s always a little room.",
      items: [
        {
          title: "Chocolate celebration cake",
          description:
            "Rich chocolate layers, silky ganache & a spoonful of happiness.",
          price: "125.00",
          image: "dessert",
        },
      ],
    },
    {
      name: "Coffee & more",
      description: "Your favorite way to linger.",
      items: [
        {
          title: "Flat white",
          description:
            "Double espresso with silky steamed milk. Your everyday ritual.",
          price: "75.00",
          image: "coffee",
        },
      ],
    },
  ];
  for (const [position, group] of groups.entries()) {
    const category = await tx.category.create({
      data: {
        menuId: menu.id,
        name: group.name,
        description: group.description,
        position,
      },
    });
    for (const [order, item] of group.items.entries())
      await tx.item.create({
        data: {
          menuId: menu.id,
          title: item.title,
          description: item.description,
          price: item.price,
          photoUrl: photo(item.image),
          isHidden: "hidden" in item && !!item.hidden,
          placements: { create: { categoryId: category.id, position: order } },
        },
      });
  }
});
console.log("Sample restaurant created at /m/olive-table.");
await db.$disconnect();
