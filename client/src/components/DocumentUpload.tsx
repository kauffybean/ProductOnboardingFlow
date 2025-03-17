import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, X, Check, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type DocumentUploadProps = {
  onUploadComplete?: () => void;
};

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/documents'],
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to load documents: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      try {
        return await apiRequest('/api/documents/upload', {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type here, the browser will set it with the boundary
          },
        });
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-progress'] });
      
      setSelectedFile(null);
      setDocumentType('');
      setDescription('');
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
        variant: 'default',
      });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload document: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (!documentType) {
      toast({
        title: 'Missing information',
        description: 'Please select a document type',
        variant: 'destructive',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', documentType);
    formData.append('name', selectedFile.name);
    
    if (description) {
      formData.append('description', description);
    }
    
    uploadMutation.mutate(formData);
  };
  
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Construction Documents</CardTitle>
        <CardDescription>
          Upload schematics, pricing sheets, or material lists to automatically generate estimates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-4 flex flex-col items-center justify-center text-center
            ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer', minHeight: '200px' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.doc,.docx,.xls,.xlsx"
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-green-500">
                <Check size={48} />
              </div>
              <div className="font-medium text-lg">{selectedFile.name}</div>
              <div className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedFile();
                }}
                className="mt-2"
              >
                <X className="mr-1 h-4 w-4" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-slate-400 mb-2" />
              <div className="font-medium">Drop your file here or click to browse</div>
              <div className="text-sm text-slate-500 mt-1">
                Supports PDF, images, CAD files, Word and Excel documents
              </div>
              <div className="text-xs text-slate-400 mt-4">Maximum file size: 50MB</div>
            </>
          )}
        </div>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type *</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
              disabled={isUploading}
            >
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schematic">Schematic/Blueprint</SelectItem>
                <SelectItem value="pricing">Pricing Sheet/Material Costs</SelectItem>
                <SelectItem value="material_list">Material List/BOM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={clearSelectedFile}
          disabled={!selectedFile || isUploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}