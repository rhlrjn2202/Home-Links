"use client";

import { Link } from 'react-router-dom';
// import { cn } from '@/lib/utils'; // Removed unused import
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { SubmitPropertyButton } from '@/components/SubmitPropertyButton';
import { useSession } from '@/components/auth/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';

export function Header() {
  const { session, loading, isAdmin } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">Home Links</span>
        </Link>

        <div className="flex-1 flex items-center justify-end space-x-4">
          {/* Desktop Navigation/Buttons */}
          <nav className="hidden md:flex items-center space-x-4">
            <SubmitPropertyButton />
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : session ? (
              <>
                {isAdmin && (
                  <Button asChild variant="ghost">
                    <Link to="/admin/dashboard">Admin</Link>
                  </Button>
                )}
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/userauth/login">Login</Link>
              </Button>
            )}
          </nav>

          {/* Mobile Navigation/Buttons */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 p-4">
                <SubmitPropertyButton />
                {loading ? (
                  <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                ) : session ? (
                  <>
                    {isAdmin && (
                      <Button asChild variant="ghost" className="w-full">
                        <Link to="/admin/dashboard">Admin</Link>
                      </Button>
                    )}
                    <Button onClick={handleLogout} className="w-full">Logout</Button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/userauth/login">Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}