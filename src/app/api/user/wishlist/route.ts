import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }
  
  await dbConnect();
  const user = await User.findById(session.user.id).select('wishlist').lean<{ wishlist: string[] }>();
  
  return NextResponse.json(user?.wishlist?.map(id => id.toString()) || []);
}
