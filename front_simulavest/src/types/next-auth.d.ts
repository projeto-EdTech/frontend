import { User } from "next-auth";

// Augmentações de tipo para next-auth
declare module "next-auth" {
	interface Session {
		accessToken?: string;
		error?: string;
		user?: (User & { tier?: "FREE" | "Simula PRO" }) | undefined;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		expires_at?: number;
		tier?: "FREE" | "Simula PRO";
		user?: User;
		error?: string;
	}
}
