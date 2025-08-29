'use client';

import { useState, useEffect } from 'react';
import type { IncomeEntry } from '@/types';
import { getWeekRange, getPreviousWeekRange } from '@/lib/date-utils';
import { DollarSign, CalendarDays, Scissors, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/header';
import SummaryCard from '@/components/summary-card';
import PayoutCard from '@/components/payout-card';
import IncomeForm from '@/components/income-form';
import DailyEntriesList from '@/components/daily-entries-list';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('income-entries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('income-entries', JSON.stringify(entries));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [entries]);

  const handleAddIncome = (income: { amount: number; description: string }) => {
    const newEntry: IncomeEntry = {
      id: new Date().toISOString(),
      ...income,
      timestamp: new Date().getTime(),
    };
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleDeleteIncome = (id: string) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const selectedDateEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.getFullYear() === selectedDate.getFullYear() &&
           entryDate.getMonth() === selectedDate.getMonth() &&
           entryDate.getDate() === selectedDate.getDate();
  });

  const selectedDateTotal = selectedDateEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const currentWeek = getWeekRange(selectedDate);
  const weekEntries = entries.filter((entry) => {
    const entryTimestamp = entry.timestamp;
    return entryTimestamp >= currentWeek.start.getTime() && entryTimestamp <= currentWeek.end.getTime();
  });
  const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const isSaturday = selectedDate.getDay() === 6;

  let previousWeekTotal = 0;
  if (isSaturday) {
    const previousWeek = getPreviousWeekRange(selectedDate);
    const previousWeekEntries = entries.filter((entry) => {
      const entryTimestamp = entry.timestamp;
      return entryTimestamp >= previousWeek.start.getTime() && entryTimestamp <= previousWeek.end.getTime();
    });
    previousWeekTotal = previousWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Scissors className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const selectedDayIsToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">Resumen</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title={selectedDayIsToday ? "Ingresos de Hoy" : "Ingresos del Día"} value={selectedDateTotal} icon={<DollarSign className="h-6 w-6 text-primary" />} />
          <SummaryCard title="Total de la Semana" value={weekTotal} icon={<CalendarDays className="h-6 w-6 text-primary" />} />
          {isSaturday && <PayoutCard amount={previousWeekTotal} />}
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <IncomeForm onAddIncome={handleAddIncome} />
          </div>
          <div className="lg:col-span-3">
            <DailyEntriesList entries={selectedDateEntries} onDelete={handleDeleteIncome} selectedDate={selectedDate} />
          </div>
        </div>
      </main>
    </div>
  );
}
