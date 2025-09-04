import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, UserIcon, ShieldIcon } from "lucide-react";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional().or(z.literal("")),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

export default function AdminUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
    },
  });

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">User Management</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-create-user"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter username"
                            data-testid="input-create-username"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            placeholder="Enter password"
                            data-testid="input-create-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
                            data-testid="input-create-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              data-testid="input-create-firstname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              data-testid="input-create-lastname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-create-role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-create"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createUserMutation.isPending}
                      data-testid="button-submit-create"
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {users && users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              users?.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                  data-testid={`user-${user.id}`}
                >
                  <div className="flex items-center space-x-3">
                    {user.role === 'admin' ? (
                      <ShieldIcon className="text-primary h-5 w-5" />
                    ) : (
                      <UserIcon className="text-muted-foreground h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium" data-testid={`user-username-${user.id}`}>
                        {user.username}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {user.email && <span>{user.email}</span>}
                        {user.firstName && user.lastName && (
                          <span className="ml-2">{user.firstName} {user.lastName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}