import AdminLoginForm from './AdminLoginForm';

export const metadata = {
  title: 'Admin Login',
};

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-black mb-2">Admin Portal</h1>
        <p className="text-gray-500 text-sm">Secure access for store management</p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
