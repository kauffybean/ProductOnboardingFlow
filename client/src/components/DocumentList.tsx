import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileArchive, FileText, FileSpreadsheet, Trash2, Loader2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function DocumentList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to load documents: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete document: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleDelete = (documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'schematic':
        return <FileArchive className="h-5 w-5 text-blue-500" />;
      case 'pricing':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'material_list':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };
  
  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'schematic':
        return 'Schematic/Blueprint';
      case 'pricing':
        return 'Pricing Sheet';
      case 'material_list':
        return 'Material List';
      default:
        return type;
    }
  };
  
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [documents]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No documents uploaded yet</p>
            <p className="text-sm">Upload documents to generate estimates automatically</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type)}
                      {getDocumentTypeLabel(doc.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={doc.originalFilename || doc.name}>
                    {doc.originalFilename || doc.name}
                  </TableCell>
                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={doc.processed ? "success" : "secondary"}>
                      {doc.processed ? 'Processed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}