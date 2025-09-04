import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShieldIcon, UserIcon, LockIcon } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const user = await response.json();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`,
      });

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      // Reload to refresh auth state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground gradient-bg flex items-center justify-center">
      <Card className="w-full max-w-md glass-effect">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <ShieldIcon className="text-primary h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your username"
                          className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring pr-10"
                          data-testid="input-username"
                          {...field}
                        />
                        <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring pr-10"
                          data-testid="input-password"
                          {...field}
                        />
                        <LockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              data-testid="button-back-home"
            >
              ← Back to Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}