import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StandardsWizard from "@/pages/StandardsWizard";
import ValidationDashboard from "@/pages/ValidationDashboard";
import EstimateDetail from "@/pages/EstimateDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/standards-wizard" component={StandardsWizard} />
      <Route path="/validation-dashboard" component={ValidationDashboard} />
      <Route path="/estimates/:id" component={EstimateDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
