import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

const handler = async (req: any, res: any) => {
  const options = await getAuthOptions();
  return NextAuth(req, res, options);
};

export { handler as GET, handler as POST };
