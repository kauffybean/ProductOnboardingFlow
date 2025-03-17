import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { type OnboardingProgress } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Fetch onboarding progress
  const { data: progress, isLoading } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });

  const handleStartStandards = () => {
    navigate("/standards-wizard");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Assembli!</h1>
          <p className="mt-1 text-slate-600">Let's get you started quickly.</p>
        </div>

        {/* Onboarding Checklist */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Onboarding Checklist</h2>
            {isLoading ? (
              <div className="animate-pulse flex space-y-4 flex-col">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ) : (
              <OnboardingChecklist progress={progress} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="border border-slate-200 transition duration-150 hover:border-primary shadow-sm hover:shadow" 
            onClick={handleStartStandards}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-800">Set Your Company Standards</div>
                <div className="text-primary">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Define your estimating standards to speed up and improve the accuracy of your bids.
              </p>
            </CardContent>
          </Card>
          
          {/* Additional quick action cards would go here */}
        </div>
      </main>
    </div>
  );
}
