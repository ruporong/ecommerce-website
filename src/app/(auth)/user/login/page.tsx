export const dynamic = 'force-dynamic';
import LoginForm from './LoginForm';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export default async function LoginPage() {
  await connectToDatabase();
  const googleEnabled = await Setting.findOne({ key: 'google_auth_enabled' });
  const isGoogleEnabled = googleEnabled?.value === 'true';

  return (
    <>
      <h2 className="text-4xl font-serif text-black mb-8">Login</h2>
      <LoginForm isGoogleEnabled={isGoogleEnabled} />
    </>
  );
}
