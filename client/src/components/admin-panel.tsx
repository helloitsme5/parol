import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  DatabaseIcon, 
  FileTextIcon, 
  ClockIcon, 
  UploadCloudIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  BarChart3Icon,
  ActivityIcon,
  SettingsIcon,
  FileUpIcon
} from "lucide-react";

interface AdminStats {
  totalRecords: number;
  filesProcessed: number;
  queueCount: number;
}

interface ProcessingJob {
  id: string;
  filename: string;
  originalSize: string;
  status: string;
  progress: number;
  recordsProcessed: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface JobsResponse {
  jobs: ProcessingJob[];
  processingStatus: {
    isProcessing: boolean;
    currentJobId: string | null;
  };
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState("upload");

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 5000,
  });

  // Fetch processing jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<JobsResponse>({
    queryKey: ["/api/admin/jobs"],
    refetchInterval: 2000,
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "File uploaded and queued for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.txt')) {
        toast({
          title: "Invalid File Type",
          description: "Only .txt files are allowed.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024 * 1024) { // 10GB
        toast({
          title: "File Too Large",
          description: "File size must be less than 10GB.",
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <Card className="glass-effect sticky top-24">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Admin Dashboard</h3>
            <nav className="space-y-2">
              <Button
                variant={activeSection === "upload" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("upload")}
                data-testid="button-nav-upload"
              >
                <FileUpIcon className="mr-2 h-4 w-4" />
                File Upload
              </Button>
              <Button
                variant={activeSection === "processing" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("processing")}
                data-testid="button-nav-processing"
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Processing
              </Button>
              <Button
                variant={activeSection === "stats" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("stats")}
                data-testid="button-nav-stats"
              >
                <BarChart3Icon className="mr-2 h-4 w-4" />
                Statistics
              </Button>
              <Button
                variant={activeSection === "logs" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("logs")}
                data-testid="button-nav-logs"
              >
                <ActivityIcon className="mr-2 h-4 w-4" />
                Activity
              </Button>
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Statistics Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Records</p>
                  <p className="text-2xl font-bold" data-testid="text-total-records">
                    {statsLoading ? "..." : formatNumber(stats?.totalRecords || 0)}
                  </p>
                </div>
                <DatabaseIcon className="text-primary text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Files Processed</p>
                  <p className="text-2xl font-bold" data-testid="text-files-processed">
                    {statsLoading ? "..." : formatNumber(stats?.filesProcessed || 0)}
                  </p>
                </div>
                <FileTextIcon className="text-green-500 text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Processing Queue</p>
                  <p className="text-2xl font-bold" data-testid="text-queue-count">
                    {statsLoading ? "..." : stats?.queueCount || 0}
                  </p>
                </div>
                <ClockIcon className="text-amber-500 text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Section */}
        {activeSection === "upload" && (
          <Card className="glass-effect">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Data Files</h3>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={handleFileUpload}
                data-testid="drop-zone-upload"
              >
                <UploadCloudIcon className="text-4xl text-muted-foreground mb-4 h-16 w-16 mx-auto" />
                <p className="text-lg mb-2">Drop files here or click to browse</p>
                <p className="text-muted-foreground text-sm mb-4">Supports .txt files up to 10GB</p>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={uploadMutation.isPending}
                  data-testid="button-select-files"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Select Files"}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".txt" 
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Supported formats:</strong> url,username,password or url;username;password</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Status */}
        {(activeSection === "processing" || activeSection === "logs") && (
          <Card className="glass-effect">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Status</h3>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobsData?.jobs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No processing jobs found.</p>
                  ) : (
                    jobsData?.jobs.map((job) => (
                      <div 
                        key={job.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          job.status === 'completed' 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : job.status === 'failed'
                            ? 'bg-destructive/10 border-destructive/20'
                            : 'bg-muted/50 border-border'
                        }`}
                        data-testid={`job-${job.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          {job.status === 'processing' && (
                            <div className="loading-spinner"></div>
                          )}
                          {job.status === 'completed' && (
                            <CheckCircleIcon className="text-green-500 h-5 w-5" />
                          )}
                          {job.status === 'failed' && (
                            <AlertCircleIcon className="text-destructive h-5 w-5" />
                          )}
                          <div>
                            <p className="font-medium" data-testid={`job-filename-${job.id}`}>
                              {job.filename}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {job.originalSize}
                            </p>
                            {job.errorMessage && (
                              <p className="text-sm text-destructive mt-1">
                                Error: {job.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {job.status === 'processing' ? (
                            <>
                              <p className="text-sm font-medium" data-testid={`job-progress-${job.id}`}>
                                Processing... {job.progress}%
                              </p>
                              <div className="w-32 mt-1">
                                <Progress value={job.progress} className="h-2" />
                              </div>
                            </>
                          ) : job.status === 'completed' ? (
                            <>
                              <p className="text-sm font-medium text-green-500">Completed</p>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(job.recordsProcessed)} records processed
                              </p>
                            </>
                          ) : job.status === 'failed' ? (
                            <p className="text-sm font-medium text-destructive">Failed</p>
                          ) : (
                            <p className="text-sm font-medium text-muted-foreground">Pending</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
