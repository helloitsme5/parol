import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserIcon, AlertTriangleIcon, CheckCircleIcon, ShieldCheckIcon } from "lucide-react";

const searchSchema = z.object({
  username: z.string().min(1, "Username is required").max(255, "Username too long"),
});

type SearchForm = z.infer<typeof searchSchema>;

interface SearchResult {
  username: string;
  exposureCount: number;
  message: string;
}

export default function UserSearch() {
  const { toast } = useToast();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      username: "",
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: SearchForm) => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      return response.json();
    },
    onSuccess: (data: SearchResult) => {
      setSearchResult(data);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Unable to search for username. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchForm) => {
    searchMutation.mutate(data);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Check Your Password Exposure</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter your username to see how many data breaches have exposed your credentials across different websites.
        </p>
      </div>

      {/* Search Interface */}
      <div className="max-w-2xl mx-auto mb-12">
        <Card className="glass-effect">
          <CardContent className="p-8">
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
                            placeholder="Enter your username..."
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
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors"
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <span>Searching...</span>
                      <div className="loading-spinner ml-2"></div>
                    </div>
                  ) : (
                    "Check Exposure"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {searchResult && (
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Results Card */}
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Exposure Results</h3>
                  {searchResult.exposureCount > 0 ? (
                    <AlertTriangleIcon className="text-destructive h-6 w-6" />
                  ) : (
                    <ShieldCheckIcon className="text-green-500 h-6 w-6" />
                  )}
                </div>
                <div className="text-center">
                  <div 
                    className={`text-4xl font-bold mb-2 ${
                      searchResult.exposureCount > 0 ? 'text-destructive' : 'text-green-500'
                    }`}
                    data-testid="text-exposure-count"
                  >
                    {searchResult.exposureCount}
                  </div>
                  <p className="text-muted-foreground">
                    {searchResult.exposureCount === 1 ? 'website with exposed credentials' : 'websites with exposed credentials'}
                  </p>
                </div>
                <div className={`mt-4 p-3 rounded-lg border ${
                  searchResult.exposureCount > 0 
                    ? 'bg-destructive/10 border-destructive/20' 
                    : 'bg-green-500/10 border-green-500/20'
                }`}>
                  <p className={`text-sm ${
                    searchResult.exposureCount > 0 ? 'text-destructive' : 'text-green-500'
                  }`}>
                    <AlertTriangleIcon className="inline mr-2 h-4 w-4" />
                    {searchResult.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="text-green-500 mt-1 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Change passwords on affected sites</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="text-green-500 mt-1 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Enable two-factor authentication</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="text-green-500 mt-1 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Use unique passwords for each site</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="text-green-500 mt-1 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Monitor your accounts regularly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
