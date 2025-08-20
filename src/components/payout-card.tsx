import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/date-utils";
import { Landmark } from "lucide-react";

interface PayoutCardProps {
  amount: number;
}

export default function PayoutCard({ amount }: PayoutCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground border-2 border-primary/80 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">DÍA DE PAGO</CardTitle>
        <Landmark className="h-6 w-6 text-primary-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(amount)}
        </div>
        <p className="text-xs text-primary-foreground/80 pt-1">Total de la semana anterior</p>
      </CardContent>
    </Card>
  );
}
