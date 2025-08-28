'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  amount: z.coerce.number().min(1, 'El valor debe ser mayor a 0.'),
  description: z.string().min(2, 'La descripción es muy corta.').max(50, 'La descripción es muy larga.'),
});

interface IncomeFormProps {
  onAddIncome: (income: { amount: number; description: string }) => void;
}

export default function IncomeForm({ onAddIncome }: IncomeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '' as any,
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddIncome(values);
    toast({
      title: "✅ Ingreso registrado",
      description: `Se agregó un ingreso de ${values.amount} por "${values.description}".`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Ingreso</CardTitle>
        <CardDescription>Añade un nuevo ingreso para el día seleccionado.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (COP)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Corte de cabello" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Ingreso
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
