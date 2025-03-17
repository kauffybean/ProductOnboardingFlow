import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [, navigate] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-2 text-xl font-bold text-slate-800">Assembli</span>
        </div>
        <div className="flex items-center">
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
