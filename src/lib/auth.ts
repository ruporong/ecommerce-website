import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Setting from "@/models/Setting";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";

export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'd3d3ZWNvbWJ1aWxkYml6';

export const getAuthOptions = async () => {
  await connectToDatabase();
  
  const enabledSetting = await Setting.findOne({ key: 'google_auth_enabled' });
  const clientIdSetting = await Setting.findOne({ key: 'google_client_id' });
  const clientSecretSetting = await Setting.findOne({ key: 'google_client_secret' });

  // Detect HTTPS
  let isSecure = process.env.NODE_ENV === 'production';
  try {
    const cookieStore = await cookies();
    if (cookieStore.has('__Secure-next-auth.session-token')) {
      isSecure = true;
    } else if (cookieStore.has('next-auth.session-token')) {
      isSecure = false;
    }
  } catch (e) {}

  try {
    const headerStore = await headers();
    const proto = headerStore.get('x-forwarded-proto');
    if (proto === 'https') isSecure = true;
    if (proto === 'http') isSecure = false;
    const host = headerStore.get('host') || headerStore.get('x-forwarded-host');
    if (host && !host.includes('localhost') && (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('localhost'))) {
      process.env.NEXTAUTH_URL = `https://${host}`;
    }
  } catch (e) {}

  const cookiePrefix = isSecure ? "__Secure-" : "";

  const providers: any[] = [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const email = credentials.email.toString().toLowerCase().trim();
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) return null;
        
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) return null;
        
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role || 'customer', 
          image: user.image 
        };
      }
    })
  ];

  if (enabledSetting?.value === 'true' && clientIdSetting?.value && clientSecretSetting?.value) {
    providers.push(
      GoogleProvider({
        clientId: clientIdSetting.value,
        clientSecret: clientSecretSetting.value,
      })
    );
  }

  return {
    providers,
    useSecureCookies: isSecure,
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: isSecure,
        },
      },
    },
    callbacks: {
      async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        let effectiveBase = baseUrl;
        if (effectiveBase.includes('localhost') && process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
          effectiveBase = process.env.NEXTAUTH_URL;
        }

        // Relative URL
        if (url.startsWith('/')) {
          return `${effectiveBase}${url}`;
        }

        // Absolute URL
        try {
          const parsedUrl = new URL(url);
          const parsedBase = new URL(effectiveBase);
          if (parsedUrl.origin === parsedBase.origin) {
            return url;
          }
          if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
            return `${effectiveBase}${parsedUrl.pathname}${parsedUrl.search}`;
          }
          return url;
        } catch {
          return effectiveBase;
        }
      },
      async signIn({ user, account, profile }: any) {
        if (account?.provider === 'google') {
          await connectToDatabase();
          let existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            const count = await User.countDocuments();
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: profile?.sub,
              role: count === 0 ? 'admin' : 'customer'
            });
          }
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
        }
        return true;
      },
      async jwt({ token, user }: any) {
        if (user) {
          token.role = user.role;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: any) {
        if (session.user) {
          session.user.role = token.role;
          session.user.id = token.id;
        }
        return session;
      }
    },
    pages: {
      signIn: '/user/login',
      error: '/user/error',
    },
    session: {
      strategy: 'jwt' as const
    },
    secret: AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development'
  };
};

/**
 * Bulletproof server-side session helper for Server Actions & API routes
 * Checks standard getServerSession, and seamlessly falls back to direct getToken decoding
 */
export async function getAuthenticatedUser(): Promise<{ id?: string; name?: string; email?: string; role?: string } | null> {
  // 1. Try getServerSession
  try {
    const options = await getAuthOptions();
    const session = await getServerSession(options);
    if (session?.user) {
      return session.user as any;
    }
  } catch (e) {}

  // 2. Direct cookie fallback using getToken
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const req = {
      headers: Object.fromEntries(headerStore.entries()),
      cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
    } as any;

    let token = await getToken({ req, secret: AUTH_SECRET });
    if (!token) {
      token = await getToken({ req, secret: AUTH_SECRET, secureCookie: true });
    }
    if (!token) {
      token = await getToken({ req, secret: AUTH_SECRET, secureCookie: false });
    }

    if (token) {
      return {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
      };
    }
  } catch (e) {
    console.error("Error in getAuthenticatedUser fallback:", e);
  }

  return null;
}
