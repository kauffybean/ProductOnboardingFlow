import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CriticalStandards, AdvancedStandards } from "@shared/schema";

type StandardsFormProps = {
  form: UseFormReturn<CriticalStandards> | UseFormReturn<AdvancedStandards>;
  onSubmit: (data: any) => void;
  submitText: string;
  submitIcon?: React.ReactNode;
  isLoading?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  skipText?: string;
};

export default function StandardsForm({
  form,
  onSubmit,
  submitText,
  submitIcon,
  isLoading = false,
  showSkip = false,
  onSkip,
  skipText = "Skip"
}: StandardsFormProps) {
  // Helper function to determine if this is a critical or advanced form
  const isCriticalForm = 'drywallWasteFactor' in form.getValues();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical Standards Fields */}
          {isCriticalForm && (
            <>
              <FormField
                control={form.control}
                name="drywallWasteFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drywall Waste Factor (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={0}
                          max={100}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="flooringWasteFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flooring Waste Factor (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={0}
                          max={100}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="standardCeilingHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard Ceiling Height</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={7}
                          max={30}
                          step={0.5}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">ft AFF</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="flooringInstallationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flooring Installation Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select installation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="adhesive">Adhesive</SelectItem>
                        <SelectItem value="floating">Floating</SelectItem>
                        <SelectItem value="nailed">Nailed</SelectItem>
                        <SelectItem value="glue-down">Glue-Down</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredHvacBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred HVAC Equipment Brand</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select HVAC brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="carrier">Carrier</SelectItem>
                        <SelectItem value="trane">Trane</SelectItem>
                        <SelectItem value="lennox">Lennox</SelectItem>
                        <SelectItem value="daikin">Daikin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Advanced Standards Fields */}
          {!isCriticalForm && (
            <>
              <FormField
                control={form.control}
                name="drywallFinishLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drywall Finish Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select finish level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="level3">Level 3</SelectItem>
                        <SelectItem value="level4">Level 4</SelectItem>
                        <SelectItem value="level5">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paintFinishStandard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paint Finish Standard</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select paint finish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="eggshell">Eggshell</SelectItem>
                        <SelectItem value="satin">Satin</SelectItem>
                        <SelectItem value="semi-gloss">Semi-Gloss</SelectItem>
                        <SelectItem value="gloss">Gloss</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wallFramingStandard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wall Framing Standard</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select wall framing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wood-16oc">Wood Stud 16" OC</SelectItem>
                        <SelectItem value="metal-16oc">Metal Stud 16" OC</SelectItem>
                        <SelectItem value="metal-24oc">Metal Stud 24" OC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="doorMaterialStandard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Door Material Standard</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select door material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hollow">Hollow-core</SelectItem>
                        <SelectItem value="solid">Solid-core</SelectItem>
                        <SelectItem value="fire-rated">Fire-Rated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ceilingTileBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ceiling Tile Brand Standard</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ceiling tile brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="armstrong">Armstrong</SelectItem>
                        <SelectItem value="usg">USG</SelectItem>
                        <SelectItem value="certainteed">CertainTeed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="restroomFixtureBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restroom Fixture Brand</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fixture brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kohler">Kohler</SelectItem>
                        <SelectItem value="toto">Toto</SelectItem>
                        <SelectItem value="american-standard">American Standard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        
        <div className={`flex ${showSkip ? "justify-between" : "justify-end"} pt-4`}>
          {showSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
            >
              {skipText}
            </Button>
          )}
          
          <Button type="submit" className="flex items-center">
            {submitText}
            {submitIcon}
          </Button>
        </div>
      </form>
    </Form>
  );
}
