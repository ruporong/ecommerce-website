import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

const resolveHostUrl = (req: any): string | null => {
  try {
    const forwardedHost = req?.headers?.get?.("x-forwarded-host") || req?.headers?.["x-forwarded-host"];
    const host = forwardedHost || req?.headers?.get?.("host") || req?.headers?.host;
    const forwardedProto = req?.headers?.get?.("x-forwarded-proto") || req?.headers?.["x-forwarded-proto"];
    const proto = forwardedProto || (host && !host.includes("localhost") ? "https" : "http");

    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  } catch (err) {
    console.error("Error resolving host url in NextAuth handler:", err);
  }
  return null;
};

const handler = async (req: any, res: any) => {
  const dynamicBaseUrl = resolveHostUrl(req);
  if (dynamicBaseUrl) {
    process.env.NEXTAUTH_URL = dynamicBaseUrl;
  }
  const options = await getAuthOptions();
  return NextAuth(req, res, options);
};

export { handler as GET, handler as POST };
