import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfileDataServer() {
  try {
    const session = await getServerSession(authOptions);
    const userToken = session?.accessToken || "";

    const externalApiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
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
            return <ProfileClient initialProfileDataProps={data} />;
        }
    }
  } catch (error) {
    console.error("Erro no fetch ProfileDataServer:", error);
  }

  // Falhou ou sem token, envia null para forçar o handle de erro / sem dados do lado cliente
  return <ProfileClient initialProfileDataProps={null} />;
}
