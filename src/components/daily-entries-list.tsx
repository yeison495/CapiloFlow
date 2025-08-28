import type { IncomeEntry } from "@/types";
import { formatCurrency } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, TrendingUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DailyEntriesListProps {
  entries: IncomeEntry[];
  onDelete: (id: string) => void;
  selectedDate: Date;
}

export default function DailyEntriesList({ entries, onDelete, selectedDate }: DailyEntriesListProps) {
  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const title = isToday ? "Entradas de Hoy" : "Entradas del Día";
  const description = isToday 
    ? "Aquí están todas las transacciones registradas hoy."
    : `Mostrando transacciones para el ${selectedDate.toLocaleDateString('es-CO')}.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <TrendingUp className="h-12 w-12 mb-4"/>
              <p className="font-medium">No hay registros para este día.</p>
              <p className="text-sm">¡Agrega un ingreso para empezar!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {entries.sort((a,b) => b.timestamp - a.timestamp).map((entry, index) => (
                <li key={entry.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString('es-CO')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-mono text-lg font-semibold text-primary">{formatCurrency(entry.amount)}</p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este registro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el ingreso de la base de datos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(entry.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {index < entries.length - 1 && <Separator className="mt-4"/>}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
