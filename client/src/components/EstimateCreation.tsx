import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, FileBarChart } from 'lucide-react';

const projectTypes = ['residential', 'commercial', 'renovation'] as const;

const estimateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  projectType: z.enum(projectTypes, {
    errorMap: () => ({ message: 'Please select a project type' }),
  }),
  totalArea: z.coerce.number().positive('Area must be greater than 0'),
  notes: z.string().optional(),
});

type EstimateFormValues = z.infer<typeof estimateSchema>;

type EstimateCreationProps = {
  onCreationComplete?: (estimateId: number) => void;
};

export default function EstimateCreation({ onCreationComplete }: EstimateCreationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      name: '',
      projectType: undefined,
      totalArea: undefined,
      notes: '',
    },
  });
  
  // Query for documents to suggest automatic processing
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents'],
  });
  
  // Check if we have documents for auto-generation
  const hasSchematicDocuments = documents.some(doc => doc.type === 'schematic');
  const hasPricingDocuments = documents.some(doc => doc.type === 'pricing');
  
  // Mutation to create estimate
  const createMutation = useMutation({
    mutationFn: async (data: EstimateFormValues) => {
      setIsCreating(true);
      try {
        return await apiRequest('/api/estimates', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-progress'] });
      
      toast({
        title: 'Success',
        description: 'Estimate created successfully',
        variant: 'default',
      });
      
      form.reset();
      
      if (onCreationComplete && data.id) {
        onCreationComplete(data.id);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create estimate: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: EstimateFormValues) => {
    createMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Estimate</CardTitle>
        <CardDescription>
          Create a new estimate based on your company standards and uploaded documents
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimate Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Smith Residence Renovation" 
                      disabled={isCreating}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
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
                  <FormLabel>Total Area (sq ft) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 2500" 
                      disabled={isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional details about this estimate"
                      disabled={isCreating}
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(hasSchematicDocuments || hasPricingDocuments) && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-start">
                  <FileBarChart className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-blue-700">Automatic Processing Available</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      {hasSchematicDocuments && hasPricingDocuments ? (
                        "We've detected uploaded schematics and pricing documents. Materials and quantities will be automatically calculated from your documents."
                      ) : hasSchematicDocuments ? (
                        "We've detected uploaded schematics. Quantities will be automatically calculated from your blueprints."
                      ) : (
                        "We've detected uploaded pricing documents. Material costs will be automatically applied from your price lists."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Estimate
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}