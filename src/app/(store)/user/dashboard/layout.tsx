import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserSidebar from "./UserSidebar";

export const metadata = {
  title: "User Dashboard",
};

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await getAuthOptions());
  
  if (!session) {
    redirect('/user/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <UserSidebar user={session.user} />
          
          {/* Main Content */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
