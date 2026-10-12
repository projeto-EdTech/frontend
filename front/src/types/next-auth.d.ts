import { User } from "next-auth";

// Augmentações de tipo para next-auth
declare module "next-auth" {
	interface Session {
		accessToken?: string;
		error?: string;
		user?: (User & { tier?: "FREE" | "SIMULAPRO" | "TEACHER" | "ADMIN" }) | undefined;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		/** `id_token` do Google, trocado pelo JWT do BFF em `/api/sync-user`. */
		googleIdToken?: string;
		expires_at?: number;
		tier?: "FREE" | "SIMULAPRO" | "TEACHER" | "ADMIN";
		user?: User;
		error?: string;
	}
}
