import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Check if Google OAuth credentials are configured
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
	console.error(
		"\x1b[31m%s\x1b[0m",
		"Error: Google OAuth credentials are missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file."
	);
}

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: googleClientId ?? "",
			clientSecret: googleClientSecret ?? "",
			authorization: {
				params: {
					scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive",
					prompt: "consent",
					access_type: "offline",
				},
			},
		}),
		CredentialsProvider({
			// The name to display on the sign in form (e.g. 'Sign in with...')
			name: 'Credentials',
			// The credentials is used to generate a suitable form on the sign in page.
			// You can specify whatever fields you are expecting to be submitted.
			// e.g. domain, username, password, 2FA token, etc.
			// You can pass any HTML attribute to the <input> tag through the object.
			credentials: {
			  username: { label: "Username", type: "text", placeholder: "jsmith" },
			  password: { label: "Password", type: "password" }
			},
			async authorize(credentials, req) {
			  // You need to provide your own logic here that takes the credentials
			  // submitted and returns either a object representing a user or value
			  // that is false/null if the credentials are invalid.
			  // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
			  // You can also use the `req` object to obtain additional parameters
			  // (i.e., the request IP address)
			//   const res = await fetch("/your/endpoint", {
			// 	method: 'POST',
			// 	body: JSON.stringify(credentials),
			// 	headers: { "Content-Type": "application/json" }
			//   })
			//   const user = await res.json()
		
			//   // If no error and we have user data, return it
			//   if (res.ok && user) {
			// 	return user
			//   }
			  // Return null if user data could not be retrieved
			  return { id: "1", name: 'J Smith', email: 'jsmith@example.com' };
			//   return null
			}
		  })
		
	],
	callbacks: {
		async session({ session, token }) {
			// Send properties to the client
			session.accessToken = token.accessToken as string;
			session.refreshToken = token.refreshToken as string;
			session.expiresAt = token.expiresAt as number;

			// In development, always return a mock session
			// if (process.env.NODE_ENV === "development") {
			// 	console.log("Development mode: returning mock session");
			// 	return {
			// 		...session,
			// 		user: {
			// 			name: "Development User",
			// 			email: "dev@example.com",
			// 			image: "https://via.placeholder.com/150",
			// 		},
			// 	};
			// }
			return session;
		},
		async jwt({ token, account }) {
			// Persist the OAuth access_token and refresh_token to the token right after sign-in
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = account.expires_at;
			}
			// In development, always return a mock token
			// if (process.env.NODE_ENV === "development") {
			// 	console.log("Development mode: returning mock token in JWT callback");
			// 	return {
			// 		...token,
			// 		accessToken: "mock-access-token",
			// 		refreshToken: "mock-refresh-token",
			// 	};
			// }
			return token;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
