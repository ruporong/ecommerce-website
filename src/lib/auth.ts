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
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user || !user.password) return null;
        
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) return null;
        
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, image: user.image };
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
    secret: process.env.NEXTAUTH_SECRET || 'secret123',
    debug: process.env.NODE_ENV === 'development'
  };
};
