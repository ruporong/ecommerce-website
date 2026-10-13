export const dynamic = 'force-dynamic';
import RegisterForm from './RegisterForm';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export default async function RegisterPage() {
  await connectToDatabase();
  const googleEnabled = await Setting.findOne({ key: 'google_auth_enabled' });
  const isGoogleEnabled = googleEnabled?.value === 'true';

  return (
    <>
      <h2 className="text-4xl font-serif text-black mb-8">Sign Up</h2>
      <RegisterForm isGoogleEnabled={isGoogleEnabled} />
    </>
  );
}
