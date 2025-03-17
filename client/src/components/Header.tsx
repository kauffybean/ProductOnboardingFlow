import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Header() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Function to reset the demo
  const handleResetDemo = async () => {
    try {
      // Reset all data in the database
      await apiRequest('/api/reset-demo', {
        method: 'POST',
      });
      
      // Clear all cache
      queryClient.clear();
      
      // Navigate to the welcome page
      navigate('/');
      
      // Show success message
      toast({
        title: 'Demo Reset Complete',
        description: 'All progress has been cleared. You can start fresh from the beginning.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to reset demo:', error);
      toast({
        title: 'Reset Failed',
        description: 'Could not reset the demo. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img 
            src="/assets/assembli-logo.png" 
            alt="Assembli Logo" 
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDemo}
                  className="hidden sm:flex"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Demo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start the demo again from the beginning</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Mobile Reset Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetDemo}
            className="sm:hidden rounded-full text-slate-500"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
            <Bell className="h-6 w-6" />
          </Button>
          <div className="ml-4 flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium text-slate-700">John Doe</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
