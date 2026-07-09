import NextAuth from "next-auth";
import { authOptions } from "@/lib/core/auth"; // ajuste o caminho se não usar alias "@/"

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };