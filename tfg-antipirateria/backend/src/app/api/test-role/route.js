import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { protegerRuta } from '../../../../middleware/auth';

export async function GET(request) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  await dbConnect();
  const user = await User.findById(request.user.userId).select('name role');
  
  return NextResponse.json({ success: true, user });
}
