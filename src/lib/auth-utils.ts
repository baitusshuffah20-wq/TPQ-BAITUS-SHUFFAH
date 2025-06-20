import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MUSYRIF' | 'WALI' | 'SANTRI';
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get auth token from cookies or headers
    const authToken = request.cookies.get('auth_token')?.value || 
                      request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return null;
    }
    
    // In a real app, you would validate the token here
    // For this demo, we'll check if it starts with "mock_token_"
    if (!authToken.startsWith('mock_token_')) {
      return null;
    }
    
    // Get user data from cookies or local storage
    // In a real app, you would decode the token or fetch user data from the database
    const userCookie = request.cookies.get('auth_user')?.value;
    
    if (!userCookie) {
      return null;
    }
    
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData as AuthUser;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}