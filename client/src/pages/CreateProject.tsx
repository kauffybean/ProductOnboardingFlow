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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  AlertCircle, 
  Clock, 
  LayoutList, 
  FileText, 
  ClipboardEdit,
  Building,
  Home,
  FileBarChart,
  CircleCheck
} from "lucide-react";
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

// Enum for project creation steps
enum ProjectStep {
  PROJECT_INFO = 1,
  DOCUMENTS = 2,
  REVIEW = 3,
  COMPLETE = 4
}

export default function CreateProject() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ProjectStep>(ProjectStep.PROJECT_INFO);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; type: string; size: number }>>([]);
  const [projectData, setProjectData] = useState<ProjectFormValues | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  
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
      // Simulate API call for prototype
      // In a real implementation, this would be an actual API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: 1, ...data });
        }, 1000);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Project created successfully!",
        description: "Your project has been created.",
        variant: "default",
      });
      
      // Update onboarding progress
      updateProgressMutation.mutate();
      
      // Move to complete step
      setCurrentStep(ProjectStep.COMPLETE);
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
  
  // Handle project info form submission
  const handleProjectInfoSubmit = (data: ProjectFormValues) => {
    setProjectData(data);
    setCurrentStep(ProjectStep.DOCUMENTS);
  };
  
  // Handle documents step completion
  const handleDocumentsSubmit = () => {
    setCurrentStep(ProjectStep.REVIEW);
    
    // Simulate document processing
    setTimeout(() => {
      setProcessingComplete(true);
    }, 2000);
  };
  
  // Handle review step completion
  const handleReviewSubmit = () => {
    if (projectData) {
      createProjectMutation.mutate(projectData);
    } else {
      toast({
        title: "Missing project information",
        description: "Please go back and complete the project information form.",
        variant: "destructive",
      });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentStep === ProjectStep.PROJECT_INFO) {
      navigate("/documents-upload");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle finish
  const handleFinish = () => {
    navigate("/");
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex flex-col items-center ${currentStep >= ProjectStep.PROJECT_INFO ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full ${currentStep >= ProjectStep.PROJECT_INFO ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-semibold`}>
              1
            </div>
            <span className="text-xs mt-1">Project Info</span>
          </div>
          
          <div className={`w-16 h-0.5 ${currentStep >= ProjectStep.DOCUMENTS ? 'bg-primary' : 'bg-slate-200'}`}></div>
          
          <div className={`flex flex-col items-center ${currentStep >= ProjectStep.DOCUMENTS ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full ${currentStep >= ProjectStep.DOCUMENTS ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-semibold`}>
              2
            </div>
            <span className="text-xs mt-1">Documents</span>
          </div>
          
          <div className={`w-16 h-0.5 ${currentStep >= ProjectStep.REVIEW ? 'bg-primary' : 'bg-slate-200'}`}></div>
          
          <div className={`flex flex-col items-center ${currentStep >= ProjectStep.REVIEW ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full ${currentStep >= ProjectStep.REVIEW ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-semibold`}>
              3
            </div>
            <span className="text-xs mt-1">Review</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderProjectInfoStep = () => {
    return (
      <>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information about your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProjectInfoSubmit)} className="space-y-6">
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
                            <SelectItem value="commercial">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Commercial
                              </div>
                            </SelectItem>
                            <SelectItem value="residential">
                              <div className="flex items-center">
                                <Home className="h-4 w-4 mr-2" />
                                Residential
                              </div>
                            </SelectItem>
                            <SelectItem value="renovation">
                              <div className="flex items-center">
                                <ClipboardEdit className="h-4 w-4 mr-2" />
                                Renovation
                              </div>
                            </SelectItem>
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
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button type="submit">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </>
    );
  };
  
  const renderDocumentsStep = () => {
    return (
      <>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>
              Upload relevant documents for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
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
                  <Button variant="outline" className="w-full max-w-sm mx-auto">
                    Select Files
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="text-sm font-medium text-slate-500">Recommended Documents:</div>
              
              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileBarChart className="h-4 w-4 text-blue-600" />
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
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-green-600" />
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
            
            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <div className="border rounded-md p-4 mb-6">
                <h3 className="font-medium mb-3">Uploaded Files ({uploadedDocuments.length})</h3>
                <div className="divide-y">
                  {uploadedDocuments.map((doc, index) => (
                    <div key={index} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
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
              </div>
            )}
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project Info
              </Button>
              
              <Button 
                onClick={handleDocumentsSubmit}
              >
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };
  
  const renderReviewStep = () => {
    return (
      <>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Review Project Information</CardTitle>
            <CardDescription>
              Review the extracted information from your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!processingComplete ? (
              <div className="py-10 flex flex-col items-center justify-center">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Processing Your Documents</h3>
                <p className="text-slate-600 text-center max-w-md mb-8">
                  We're analyzing your uploaded documents to extract key project information. This will help ensure your estimate is accurate.
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6 flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">Document Processing Complete</h3>
                    <p className="text-sm text-green-700">
                      We've extracted the following information from your documents. Please review and confirm.
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-500">Project Name</div>
                        <div className="font-medium text-slate-900">{projectData?.name || "Untitled Project"}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-slate-500">Project Type</div>
                        <div className="font-medium text-slate-900 capitalize">{projectData?.projectType || "Commercial"}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-slate-500">Notes</div>
                        <div className="font-medium text-slate-900">{projectData?.notes || "No notes provided"}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-500">Uploaded Documents</div>
                        <div className="font-medium text-slate-900">{uploadedDocuments.length} documents</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-slate-500">Key Specifications</div>
                        <ul className="text-sm text-slate-900 list-disc list-inside">
                          <li>Total Area: 3,200 sqft</li>
                          <li>Estimated Duration: 6 months</li>
                          <li>Required Completion: Oct 2025</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-3">Extracted Requirements</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Material Requirements</h4>
                        <Badge>High Priority</Badge>
                      </div>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        <li>Premium-grade drywall required for all interior walls</li>
                        <li>Eco-friendly insulation materials required</li>
                        <li>LEED-certified flooring materials only</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Special Considerations</h4>
                        <Badge variant="outline">Medium Priority</Badge>
                      </div>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        <li>Work hours restricted to 8am-5pm on weekdays</li>
                        <li>Noise restrictions apply during certain hours</li>
                        <li>Existing structure must be preserved where possible</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Client Preferences</h4>
                        <Badge variant="secondary">Information</Badge>
                      </div>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        <li>Client prefers neutral color palette throughout</li>
                        <li>Energy-efficient lighting systems requested</li>
                        <li>Sustainable materials preferred where possible</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Documents
                  </Button>
                  
                  <Button 
                    onClick={handleReviewSubmit}
                    disabled={createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? "Creating Project..." : "Create Project & Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  };
  
  const renderCompleteStep = () => {
    return (
      <>
        <Card className="mb-8">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CircleCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <CardTitle>Project Created Successfully!</CardTitle>
                <CardDescription className="text-green-700">
                  Your project is ready for estimation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">Project Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Project Name</div>
                    <div className="font-medium text-lg">{projectData?.name || "Untitled Project"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Project Type</div>
                    <div className="flex items-center">
                      {projectData?.projectType === "commercial" && <Building className="h-4 w-4 mr-2 text-blue-600" />}
                      {projectData?.projectType === "residential" && <Home className="h-4 w-4 mr-2 text-green-600" />}
                      {projectData?.projectType === "renovation" && <ClipboardEdit className="h-4 w-4 mr-2 text-amber-600" />}
                      <span className="font-medium capitalize">{projectData?.projectType || "Commercial"}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Documents Uploaded</div>
                    <div className="font-medium">{uploadedDocuments.length} documents</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Next Steps</div>
                    <ul className="text-sm space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Project created and ready for estimation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 mr-2 flex-shrink-0" />
                        <span>Complete quantity takeoff using automatic measurement tools</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 mr-2 flex-shrink-0" />
                        <span>Review and validate estimate calculations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 mr-2 flex-shrink-0" />
                        <span>Generate final project estimate and proposal</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <Button onClick={handleFinish} className="px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
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
      
      {currentStep !== ProjectStep.COMPLETE && renderStepIndicator()}
      
      {currentStep === ProjectStep.PROJECT_INFO && renderProjectInfoStep()}
      {currentStep === ProjectStep.DOCUMENTS && renderDocumentsStep()}
      {currentStep === ProjectStep.REVIEW && renderReviewStep()}
      {currentStep === ProjectStep.COMPLETE && renderCompleteStep()}
    </div>
  );
}