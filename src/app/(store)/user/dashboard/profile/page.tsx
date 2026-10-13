import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import ProfileForm from "./ProfileForm";

async function updateProfile(formData: FormData) {
  "use server";
  
  try {
    const session = await getServerSession(await getAuthOptions());
    if (!session?.user) return { success: false, error: 'Not authenticated' };

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const thana = formData.get('thana') as string;

    await connectToDatabase();
    
    let userId = (session.user as any).id;
    let dbUser = userId ? await User.findById(userId).lean() : null;
    
    if (!dbUser && session.user.email) {
      dbUser = await User.findOne({ email: session.user.email }).lean();
      if (dbUser) userId = dbUser._id.toString();
    }
    if (!userId) return { success: false, error: 'User record not found' };

    await User.findByIdAndUpdate(userId, { name, phone, address, city, thana }, { strict: false });
    
    revalidatePath('/user/dashboard/profile');
    revalidatePath('/user/dashboard');
    
    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
}

export default async function UserProfilePage() {
  const session = await getServerSession(await getAuthOptions());
  
  await connectToDatabase();
  let userId = session?.user?.id;
  let dbUser = userId ? await User.findById(userId).lean() : null;
  
  if (!dbUser && session?.user?.email) {
    dbUser = await User.findOne({ email: session.user.email }).lean();
    if (dbUser) userId = dbUser._id.toString();
  }

  console.log("PROFILE RENDER", { sessionUserId: session?.user?.id, sessionEmail: session?.user?.email, userId, dbUser: !!dbUser });
  const userData = {
    name: dbUser?.name || session?.user?.name,
    email: dbUser?.email || session?.user?.email,
    phone: dbUser?.phone || '',
    address: dbUser?.address || '',
    city: dbUser?.city || '',
    thana: dbUser?.thana || '',
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and contact details.</p>
      </div>

      <ProfileForm key={userData.name + userData.phone + userData.address + userData.city + userData.thana} user={userData} updateAction={updateProfile} />
    </div>
  );
}
