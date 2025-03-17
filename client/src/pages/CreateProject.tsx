import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ArrowLeft, ArrowRight, Upload, AlertCircle, Clock } from "lucide-react";
import { type OnboardingProgress } from "@shared/schema";

// Schema for project creation
const projectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  projectType: z.enum(["commercial", "residential", "renovation"], {
    required_error: "Please select a project type",
  }),
  totalArea: z.coerce.number().positive({ message: "Please enter a valid area" }),
  notes: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Schema for document upload
const documentSchema = z.object({
  name: z.string().min(1, { message: "Document name is required" }),
  type: z.string().min(1, { message: "Document type is required" }),
  description: z.string().optional(),
});

export default function CreateProject() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; type: string; size: number }>>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Form for project details
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      projectType: "commercial",
      totalArea: 0,
      notes: "",
    },
  });
  
  // Get onboarding progress
  const { data: progress } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });
  
  // Mutation for creating project
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const response = await apiRequest("/api/estimates", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Project created successfully!",
        description: "Your project has been created.",
        variant: "default",
      });
      
      // Update onboarding progress
      updateProgressMutation.mutate();
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Navigate to estimate detail after a short delay
      setTimeout(() => {
        navigate(`/estimates/${data.id}`);
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
      console.error("Project creation error:", error);
    },
  });
  
  // Mutation for updating onboarding progress
  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/onboarding-progress", {
        method: "PATCH",
        body: JSON.stringify({ firstEstimateCreated: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding-progress"] });
    },
  });
  
  // Handle document upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // For this prototype, just track the files that would be uploaded
    const newDocuments = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
    
    // Clear the input to allow uploading the same file again if needed
    event.target.value = "";
    
    toast({
      title: "Documents added",
      description: `${newDocuments.length} document(s) added for upload`,
      variant: "default",
    });
  };
  
  // Handle form submission
  const onSubmit = (data: ProjectFormValues) => {
    createProjectMutation.mutate(data);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate("/documents-upload");
  };
  
  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Your First Project</h1>
          <p className="text-slate-500 mt-2">
            Enter project details and upload relevant documents to start your estimate
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> 
          <span>Estimated time: 5 minutes</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information about your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Downtown Office Renovation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Area (sqft)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details about the project..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating Project..." : "Create Project & Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
          {showSuccessMessage && (
            <CardFooter className="bg-green-50 border-t border-green-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Project created successfully!</h4>
                  <p className="text-sm text-green-700">
                    Your project is now ready for estimation. You'll be redirected shortly.
                  </p>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>
              Upload relevant project documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
              <h3 className="font-medium text-slate-700 mb-2">Upload Project Files</h3>
              <p className="text-sm text-slate-500 mb-4">
                Drag & drop or click to upload RFPs, plans, or specifications
              </p>
              
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" className="w-full">
                  Select Files
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-500">Recommended Documents:</div>
              
              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Request for Proposal (RFP)</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      The official project requirements and specifications
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Blueprints/Schematics</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Project plans and architectural drawings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Uploaded Documents Section */}
      {uploadedDocuments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              These documents will be associated with your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-slate-500">
                        {(doc.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing Information
        </Button>
        
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={createProjectMutation.isPending}
        >
          Create Project & Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}