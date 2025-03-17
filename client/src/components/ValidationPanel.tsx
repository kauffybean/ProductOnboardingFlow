import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, AlertTriangle, X, User, 
  Settings, UserPlus, CheckCircle,
  AlertCircle
} from "lucide-react";

type Ambiguity = {
  id: string;
  description: string;
  resolution?: string;
  options?: string[];
  type: 'selection' | 'delegation' | 'internal'
};

type DelegatedItem = {
  id: string;
  description: string;
  assignee: string;
  role: string;
};

type AppliedStandard = {
  id: string;
  description: string;
  source: string;
};

type ValidationPanelProps = {
  confidenceScore: number;
  appliedStandards: AppliedStandard[];
  ambiguities: Ambiguity[];
  delegatedItems: DelegatedItem[];
  onResolveAmbiguity: (id: string, resolution: string) => void;
  onDelegateItem: (id: string) => void;
  onEditStandards: () => void;
};

export default function ValidationPanel({
  confidenceScore,
  appliedStandards,
  ambiguities,
  delegatedItems,
  onResolveAmbiguity,
  onDelegateItem,
  onEditStandards
}: ValidationPanelProps) {
  // Helper function to determine confidence level color
  const getConfidenceColor = (score: number): string => {
    if (score >= 85) return "text-green-500 bg-green-50";
    if (score >= 65) return "text-amber-500 bg-amber-50";
    if (score >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };
  
  const getConfidenceLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };
  
  const confidenceColorClass = getConfidenceColor(confidenceScore);
  const confidenceBgClass = confidenceColorClass.split(" ")[1];
  const confidenceTextClass = confidenceColorClass.split(" ")[0];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className={`rounded-full w-10 h-10 flex items-center justify-center ${confidenceColorClass}`}>
            {confidenceScore >= 85 ? <CheckCircle className="w-6 h-6" /> :
             confidenceScore >= 65 ? <CheckCircle className="w-6 h-6" /> :
             confidenceScore >= 40 ? <AlertCircle className="w-6 h-6" /> :
             <X className="w-6 h-6" />}
          </div>
          <div className="ml-3">
            <span className="text-sm text-slate-600">Estimate Confidence</span>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${confidenceTextClass}`}>{confidenceScore}%</span>
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${confidenceBgClass} ${confidenceTextClass}`}>
                {getConfidenceLabel(confidenceScore)}
              </span>
            </div>
          </div>
        </div>

        {/* Applied Standards */}
        {appliedStandards.length > 0 && (
          <div className="border-t border-slate-200 pt-4 pb-2">
            <h3 className="font-medium text-slate-900 mb-3">
              Automatically Applied Standards ({appliedStandards.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appliedStandards.map(standard => (
                <div key={standard.id} className="bg-slate-50 rounded-md p-3 flex items-start">
                  <div className="text-green-500 mr-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-900">{standard.description}</span>
                    <span className="text-xs text-slate-500">({standard.source})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ambiguities */}
        {ambiguities.length > 0 && (
          <div className="border-t border-slate-200 pt-4 pb-2 mt-4">
            <h3 className="font-medium text-slate-900 mb-3">
              Ambiguities Requiring Clarification ({ambiguities.length})
            </h3>
            <div className="space-y-4">
              {ambiguities.map(ambiguity => (
                <div key={ambiguity.id} className="bg-amber-50 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="text-amber-500 mr-2">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-slate-900">{ambiguity.description}</span>
                      <div className="mt-2">
                        {ambiguity.type === 'selection' && ambiguity.options && (
                          <select className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="">Select an option</option>
                            {ambiguity.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        
                        {ambiguity.type === 'delegation' && (
                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm">Clarify internally</Button>
                            <Button variant="outline" size="sm" onClick={() => onDelegateItem(ambiguity.id)}>Delegate to SME</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delegated Items */}
        {delegatedItems.length > 0 && (
          <div className="border-t border-slate-200 pt-4 mt-4">
            <h3 className="font-medium text-slate-900 mb-3">
              Items Delegated to SMEs ({delegatedItems.length})
            </h3>
            {delegatedItems.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-md p-4">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-slate-500 mr-2" />
                    <div>
                      <span className="block text-sm font-medium text-slate-900">{item.description}</span>
                      <span className="text-xs text-slate-500">Sent to {item.assignee}, {item.role}</span>
                    </div>
                  </div>
                  <Button variant="link" size="sm">View Status</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
