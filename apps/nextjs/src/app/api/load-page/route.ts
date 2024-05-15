// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { del, list } from "@vercel/blob";

// import type { OldPage, Page } from "~/app/types";
// import { api } from "~/trpc/server";

// export const runtime = "edge";

// export async function GET(request: NextRequest) {
//   // Use the prefix option to filter blobs by cacheKey
//   let response = await list();
//   const blobs = response.blobs;

//   while (response.blobs.length === 1000) {
//     response = await list({
//       cursor: response.cursor,
//     });
//     blobs.push(...response.blobs);
//     console.log("blobs:", blobs.length);
//   }

//   const existingPages = (await api.page.loadAll()).map((page) => page.id);

//   console.log("blobs:", blobs.length);
//   for (const blob of blobs) {
//     const id = blob.pathname;

//     if (!existingPages.includes(id)) {
//       // Fetch the content of the blob using the downloadUrl
//       const pageResponse = await fetch(blob.downloadUrl);
//       let page: OldPage;
//       try {
//         page = (await pageResponse.json()) as OldPage;
//       } catch (error) {
//         console.log("error parsing", blob.downloadUrl);
//         continue;
//       }

//       if (!page.userId) {
//         console.log("skipping due to missing userId", page.cacheKey);
//         continue;
//       }

//       if (!page.content) {
//         console.log("skipping due to missing content", page.cacheKey);
//         continue;
//       }

//       void api.page.saveAsUser({
//         title: page.title,
//         fakeUrl: page.fakeUrl,
//         prompt: page.prompt,
//         content: page.content,
//         id: page.cacheKey,
//         response: page.response ?? page.content,
//         parentId: page.parentId ?? "home",
//         userId: page.userId,
//       });

//       console.log("saved", page.cacheKey);
//     }
//     //await del(blob.downloadUrl);
//     //console.log("processed", blob.downloadUrl);
//   }

//   return NextResponse.json({});
// }
