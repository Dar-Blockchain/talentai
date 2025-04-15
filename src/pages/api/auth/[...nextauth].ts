// pages/api/auth/[...nextauth].ts
import type { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
// Optionally, uncomment AppleProvider if needed:
// import AppleProvider from "next-auth/providers/apple";

// Extend session type to include our custom fields
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: any;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email ?? "";
        try {
          const response = await fetch("http://localhost:5000/auth/connect-gmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          });
          const data = await response.json();

          if (!response.ok) {
            console.error("Error from connect-gmail API:", data);
            return false;
          }
          console.log("API response:", data);
          // Store API response data in the account
          account.access_token = data.token;
          account.user_data = data.user;

          // Store in user object so it's accessible in jwt callback
          (user as any).token = data.token;
          (user as any).apiUser = data.user;

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userData = account.user_data;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: token.userData || session.user,
      };
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/preferences`;
    },
  },
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;