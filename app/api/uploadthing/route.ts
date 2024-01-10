import { createNextRouteHandler } from "uploadthing/next";
 
import { ourFileRouter } from "./core";
 
//アップロードされたファイルのルーティング
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});