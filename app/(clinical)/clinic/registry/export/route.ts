import { directoryCsv } from "../../_lib/registry";
import { getClientDirectory } from "../../_lib/registry-data";

export async function GET() {
  const owners = await getClientDirectory();
  const cacheControl = { "Cache-Control": "private, no-store" };
  if (!owners)
    return new Response("Could not export the client directory.", {
      status: 502,
      headers: cacheControl,
    });

  return new Response(directoryCsv(owners), {
    headers: {
      ...cacheControl,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="vertivet-client-directory.csv"',
      "X-Content-Type-Options": "nosniff",
    },
  });
}
