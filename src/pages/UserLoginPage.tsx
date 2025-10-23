import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { CustomSignUpForm } from '@/components/auth/CustomSignUpForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Seo } from '@/components/seo/Seo'; // Import Seo component

export function UserLoginPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-140px)] p-4">
      <Seo
        title="Login / Sign Up - Home Links"
        description="Login to your Home Links account or create a new one to submit and manage properties."
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Home Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <Auth
                supabaseClient={supabase}
                providers={[]}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(var(--primary))',
                        brandAccent: 'hsl(var(--primary-foreground))',
                      },
                    },
                  },
                }}
                theme="light"
                redirectTo={window.location.origin + '/'}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <CustomSignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}