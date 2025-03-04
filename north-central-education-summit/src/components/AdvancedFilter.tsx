'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

interface AdvancedFilterProps {
  options: FilterOption[];
  onFilter: (filters: any) => void;
}

const createFilterSchema = (options: FilterOption[]) => {
  const shape: any = {};
  
  options.forEach(option => {
    switch (option.type) {
      case 'text':
        shape[option.id] = z.string().optional();
        break;
      case 'select':
        shape[option.id] = z.string().optional();
        break;
      case 'date':
        shape[option.id] = z.date().optional();
        break;
      case 'number':
        shape[option.id] = z.number().optional();
        break;
    }
  });
  
  return z.object(shape);
};

export function AdvancedFilter({ options, onFilter }: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  
  const filterSchema = createFilterSchema(options);
  type FilterValues = z.infer<typeof filterSchema>;
  
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
  });

  const onSubmit = (values: FilterValues) => {
    // Remove empty values
    const filters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onFilter(filters);
    setOpen(false);
  };

  const resetFilters = () => {
    form.reset();
    onFilter({});
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Advanced Filter</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filter</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {options.map(option => (
              <FormField
                key={option.id}
                control={form.control}
                name={option.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{option.label}</FormLabel>
                    <FormControl>
                      {option.type === 'select' ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value as string}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {option.options?.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : option.type === 'date' ? (
                        <DatePicker
                          selected={field.value as Date}
                          onSelect={field.onChange}
                        />
                      ) : option.type === 'number' ? (
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      ) : (
                        <Input {...field} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button type="submit">Apply Filters</Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
