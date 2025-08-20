import type { IncomeEntry } from "@/types";
import { formatCurrency } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, TrendingUp } from "lucide-react";

interface DailyEntriesListProps {
  entries: IncomeEntry[];
  onDelete: (id: string) => void;
}

export default function DailyEntriesList({ entries, onDelete }: DailyEntriesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entradas de Hoy</CardTitle>
        <CardDescription>
          Aquí están todas las transacciones registradas hoy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <TrendingUp className="h-12 w-12 mb-4"/>
              <p className="font-medium">No hay registros hoy.</p>
              <p className="text-sm">¡Agrega tu primer ingreso para empezar!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry, index) => (
                <li key={entry.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString('es-CO')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-mono text-lg font-semibold text-primary">{formatCurrency(entry.amount)}</p>
                      <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => onDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
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
