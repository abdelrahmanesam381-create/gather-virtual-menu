import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin, endpoint, jsonBody } from "@/lib/http";
import { acceptInvitation } from "@/lib/menu-service";
export async function POST(request: Request) {
  return endpoint(async () => {
    checkOrigin(request);
    const admin = await requireAdmin();
    const { token } = z
      .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
      .parse(await jsonBody(request));
    return acceptInvitation(token, admin.id, admin.email);
  });
}
