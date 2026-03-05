import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/board",
        "/calendar",
        "/goals",
        "/goals/:path*"
    ]
};
