import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const useAuth = () => {
  const { data: session } = useSession();
  const { token: reduxToken, user: reduxUser } = useSelector((state: RootState) => state.auth);

  const [isClient, setIsClient] = useState(false); // ✅ Add client-side state

  useEffect(() => {
    setIsClient(true); // ✅ Only after mounting, client is ready
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      if ((session as any)?.accessToken) {
        localStorage.setItem("token", (session as any).accessToken);
        localStorage.setItem("user", JSON.stringify(session?.user));
      } else if (reduxToken) {
        localStorage.setItem("token", reduxToken);
        localStorage.setItem("user", JSON.stringify(reduxUser));
      }
    }
  }, [session, reduxToken, isClient]);

  return {
    isLoggedIn: isClient && (!!(session as any)?.accessToken || !!reduxToken),
    user: isClient ? session?.user || reduxUser : null,
  };
};
