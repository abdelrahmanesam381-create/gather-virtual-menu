import { requireAdmin, throttle } from "@/lib/auth";
import { checkOrigin, endpoint, AppError } from "@/lib/http";
import { storeImage } from "@/lib/uploads";
export async function POST(request: Request) {
  return endpoint(async () => {
    checkOrigin(request);
    const admin = await requireAdmin();
    await throttle(`upload:${admin.id}`, 30);
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
      throw new AppError(413, "Images must be 5 MB or smaller.");
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) throw new AppError(400, "Choose an image.");
    if (file.size > 5 * 1024 * 1024)
      throw new AppError(413, "Images must be 5 MB or smaller.");
    return {
      url: await storeImage(Buffer.from(await file.arrayBuffer()), file.type),
    };
  });
}
