import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/core/auth";
import { decodeJWT } from "@/app/service/jwtDecoder";
import { getDiscordLinked } from "@/lib/core/discordLinked";
import ProfileClient from "./ProfileClient";

export default async function ProfileDataServer() {
  try {
    const session = await getServerSession(authOptions);
    const userToken = session?.accessToken || "";

    // Flag de conta Discord vinculada: lido do JWT user_data (HttpOnly).
    // Decodificação SEMPRE via jwtDecoder (regra de segurança do projeto).
    const userDataToken = (await cookies()).get("user_data")?.value;
    const discordLinked = getDiscordLinked(
      userDataToken ? decodeJWT(userDataToken) : null,
    );

    const externalApiUrl = process.env.BACKEND_API_URL;
    const backendUrl = `${externalApiUrl}/api/user/stats`;

    // Se o usuário tem token, puxamos os stats no sevidor
    if (userToken) {
        const apiResponse = await fetch(backendUrl, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
            cache: "no-store",
        });

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            // Injeta o flag derivado do JWT nos stats consumidos pela badge.
            if (data && typeof data === "object" && data.stats) {
              data.stats.discordLinked = discordLinked;
            }
            return <ProfileClient initialProfileDataProps={data} />;
        }
    }
  } catch (error) {
    console.error("Erro no fetch ProfileDataServer:", error);
  }

  // Falhou ou sem token, envia null para forçar o handle de erro / sem dados do lado cliente
  return <ProfileClient initialProfileDataProps={null} />;
}
