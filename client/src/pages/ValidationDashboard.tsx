import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ValidationPanel from "@/components/ValidationPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Check, AlertTriangle, User, 
  CheckCircle, Settings, UserPlus 
} from "lucide-react";

export default function ValidationDashboard() {
  const [, navigate] = useLocation();
  
  // In a real app, these would be fetched from the backend
  const [confidenceScore, setConfenceScore] = useState(84);
  
  // Helper function to determine confidence level color
  const getConfidenceColor = (score: number): string => {
    if (score >= 85) return "text-green-500 bg-green-50";
    if (score >= 65) return "text-amber-500 bg-amber-50";
    if (score >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };
  
  const confidenceColorClass = getConfidenceColor(confidenceScore);
  const confidenceBgClass = confidenceColorClass.split(" ")[1];
  const confidenceTextClass = confidenceColorClass.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Estimate Validation & Refinement Center</h1>
          <p className="mt-1 text-slate-600">Review your estimate and make necessary adjustments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Confidence Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center ${confidenceColorClass}`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm text-slate-600">Estimate Confidence</span>
                    <div className="flex items-center">
                      <span className={`text-2xl font-bold ${confidenceTextClass}`}>{confidenceScore}%</span>
                      <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${confidenceBgClass} ${confidenceTextClass}`}>
                        {confidenceScore >= 85 ? "Excellent" :
                         confidenceScore >= 65 ? "Good" :
                         confidenceScore >= 40 ? "Fair" : "Poor"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Applied Standards */}
                <div className="border-t border-slate-200 pt-4 pb-2">
                  <h3 className="font-medium text-slate-900 mb-3">Automatically Applied Standards (5)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-md p-3 flex items-start">
                      <div className="text-green-500 mr-2">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-slate-900">Drywall Waste: 10%</span>
                        <span className="text-xs text-slate-500">(Default)</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-md p-3 flex items-start">
                      <div className="text-green-500 mr-2">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-slate-900">Flooring Method: Adhesive</span>
                        <span className="text-xs text-slate-500">(Default)</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-md p-3 flex items-start">
                      <div className="text-green-500 mr-2">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-slate-900">Ceiling Height: 9' AFF</span>
                        <span className="text-xs text-slate-500">(Default)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambiguities */}
                <div className="border-t border-slate-200 pt-4 pb-2 mt-4">
                  <h3 className="font-medium text-slate-900 mb-3">Ambiguities Requiring Clarification (2)</h3>
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-md p-4">
                      <div className="flex items-start">
                        <div className="text-amber-500 mr-2">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-medium text-slate-900">Lobby Flooring Type unclear</span>
                          <div className="mt-2">
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Flooring Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lvt">LVT</SelectItem>
                                <SelectItem value="hardwood">Hardwood</SelectItem>
                                <SelectItem value="carpet">Carpet Tile</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-md p-4">
                      <div className="flex items-start">
                        <div className="text-amber-500 mr-2">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-medium text-slate-900">Paint Color not defined (Tenant Branding)</span>
                          <div className="mt-2 flex space-x-3">
                            <Button variant="outline" size="sm">Clarify internally</Button>
                            <Button variant="outline" size="sm">Delegate to SME</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delegated Items */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="font-medium text-slate-900 mb-3">Items Delegated to SMEs (1)</h3>
                  <div className="bg-slate-50 rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-slate-500 mr-2" />
                        <div>
                          <span className="block text-sm font-medium text-slate-900">HVAC Load Calculations</span>
                          <span className="text-xs text-slate-500">Sent to John Doe, Mechanical SME</span>
                        </div>
                      </div>
                      <Button variant="link" size="sm">View Status</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-slate-900 mb-6">Actions</h3>
                
                <div className="space-y-4">
                  <Button className="w-full flex items-center justify-center" size="lg">
                    <Check className="mr-2 h-5 w-5" />
                    Confirm and Update Estimate
                  </Button>
                  
                  <Button className="w-full flex items-center justify-center" variant="outline" size="lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Delegate More Items
                  </Button>
                  
                  <Button 
                    className="w-full flex items-center justify-center" 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/standards-wizard")}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Edit Standards
                  </Button>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Estimate Summary</h4>
                  <div className="bg-slate-50 rounded-md p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Total Cost:</span>
                      <span className="font-medium text-slate-900">$243,750.00</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Area:</span>
                      <span className="font-medium text-slate-900">5,250 sq ft</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Cost per sq ft:</span>
                      <span className="font-medium text-slate-900">$46.43</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                      <span className="text-slate-600">Last updated:</span>
                      <span className="font-medium text-slate-900">Today, 2:45 PM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
