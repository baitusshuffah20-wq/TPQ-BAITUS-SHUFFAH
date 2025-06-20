'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
// Ensure this component is only used on the client side
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { 
  Menu, 
  X, 
  BookOpen, 
  Users, 
  Heart, 
  Phone, 
  Info,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  // Use try-catch to handle potential errors with useSession
  let session: {
    user: {
      name: string;
      email: string;
      avatar?: string;
    }
  } | null = null;
  let status: 'loading' | 'authenticated' | 'unauthenticated' = 'loading';
  
  try {
    const sessionData = useSession();
    session = sessionData.data;
    status = sessionData.status;
  } catch (error) {
    console.error('Error using useSession:', error);
    status = 'unauthenticated';
  }
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Beranda', href: '/', icon: BookOpen },
    { name: 'Tentang Kami', href: '/about', icon: Info },
    { name: 'Program', href: '/programs', icon: Users },
    { name: 'Donasi', href: '/donate', icon: Heart },
    { name: 'Kontak', href: '/contact', icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with Site Name */}
          <div className="flex items-center space-x-2">
            <Logo width={30} height={30} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-teal-600">TPQ Baitus Shuffah</span>
              <span className="text-xs text-gray-600">Rumah Tahfidz Al-Qur'an</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                  )}
                  onClick={(e) => {
                    // Add visual feedback when clicked
                    const target = e.currentTarget;
                    target.classList.add('bg-teal-100', 'scale-95');
                    setTimeout(() => {
                      target.classList.remove('bg-teal-100', 'scale-95');
                    }, 150);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' && session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity duration-150 active:scale-95"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
                      {session.user.avatar ? (
                        <Image 
                          src={session.user.avatar} 
                          alt={session.user.name} 
                          width={32} 
                          height={32} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center active:bg-gray-200 transition-colors duration-150"
                      onClick={(e) => {
                        setIsDropdownOpen(false);
                        // Add visual feedback
                        const target = e.currentTarget;
                        target.classList.add('bg-gray-200');
                        setTimeout(() => {
                          target.classList.remove('bg-gray-200');
                        }, 150);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      href="/dashboard/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center active:bg-gray-200 transition-colors duration-150"
                      onClick={(e) => {
                        setIsDropdownOpen(false);
                        // Add visual feedback
                        const target = e.currentTarget;
                        target.classList.add('bg-gray-200');
                        setTimeout(() => {
                          target.classList.remove('bg-gray-200');
                        }, 150);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                    
                    <button 
                      onClick={() => {
                        // Add visual feedback
                        const button = document.activeElement as HTMLElement;
                        button.classList.add('bg-red-100');
                        setTimeout(() => {
                          setIsDropdownOpen(false);
                          try {
                            signOut({ callbackUrl: '/' });
                          } catch (error) {
                            console.error('Error signing out:', error);
                            window.location.href = '/';
                          }
                        }, 150);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 active:bg-red-100 flex items-center transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="active:scale-95 transition-transform duration-150"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-teal-600 hover:bg-teal-700 active:scale-95 transition-transform duration-150"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 active:bg-gray-200 active:scale-95 transition-all duration-150"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-white">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                    )}
                    onClick={(e) => {
                      // Add visual feedback when clicked
                      const target = e.currentTarget;
                      target.classList.add('bg-teal-100', 'scale-95');
                      
                      // Close menu and navigate
                      setIsMenuOpen(false);
                      
                      // Add a small delay to show the visual feedback
                      setTimeout(() => {
                        target.classList.remove('bg-teal-100', 'scale-95');
                      }, 150);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Auth Buttons or User Profile */}
              <div className="pt-4 space-y-2">
                {status === 'authenticated' && session ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
                        {session.user.avatar ? (
                          <Image 
                            src={session.user.avatar} 
                            alt={session.user.name} 
                            width={40} 
                            height={40} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                        <div className="text-sm text-gray-500">{session.user.email}</div>
                      </div>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 active:bg-teal-50 transition-colors duration-150"
                      onClick={(e) => {
                        // Add visual feedback
                        const target = e.currentTarget;
                        target.classList.add('bg-teal-50', 'scale-95');
                        
                        // Close menu
                        setIsMenuOpen(false);
                        
                        setTimeout(() => {
                          target.classList.remove('bg-teal-50', 'scale-95');
                        }, 150);
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 active:bg-teal-50 transition-colors duration-150"
                      onClick={(e) => {
                        // Add visual feedback
                        const target = e.currentTarget;
                        target.classList.add('bg-teal-50', 'scale-95');
                        
                        // Close menu
                        setIsMenuOpen(false);
                        
                        setTimeout(() => {
                          target.classList.remove('bg-teal-50', 'scale-95');
                        }, 150);
                      }}
                    >
                      <User className="h-5 w-5" />
                      <span>Profil</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        // Add visual feedback
                        const button = document.activeElement as HTMLElement;
                        button.classList.add('bg-red-50', 'scale-95');
                        
                        setTimeout(() => {
                          button.classList.remove('bg-red-50', 'scale-95');
                          setIsMenuOpen(false);
                          try {
                            signOut({ callbackUrl: '/' });
                          } catch (error) {
                            console.error('Error signing out:', error);
                            window.location.href = '/';
                          }
                        }, 150);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 active:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start active:scale-95 transition-transform duration-150"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="primary" 
                        className="w-full justify-start bg-teal-600 hover:bg-teal-700 active:scale-95 transition-transform duration-150"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Daftar Santri
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
