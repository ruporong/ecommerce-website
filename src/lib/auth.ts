import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Setting from "@/models/Setting";
import bcrypt from "bcryptjs";

export const getAuthOptions = async () => {
  await connectToDatabase();
  
  const enabledSetting = await Setting.findOne({ key: 'google_auth_enabled' });
  const clientIdSetting = await Setting.findOne({ key: 'google_client_id' });
  const clientSecretSetting = await Setting.findOne({ key: 'google_client_secret' });

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
    secret: process.env.NEXTAUTH_SECRET || 'd3d3ZWNvbWJ1aWxkYml6',
    debug: process.env.NODE_ENV === 'development'
  };
};
