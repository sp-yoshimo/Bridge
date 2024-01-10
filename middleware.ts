import { authMiddleware } from "@clerk/nextjs";
 
// ログイン時の時に入れるページなどをふるい分けするミドルウェア
export default authMiddleware({

    //未ログインでも入れるページの配列
    publicRoutes:[
        "/",
        "/api/uploadthing"
    ]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 