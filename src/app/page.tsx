'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('capiloflow-entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to parse entries from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('capiloflow-entries', JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save entries to localStorage", error);
    }
  }, [entries]);

  const handleAddIncome = (income: { amount: number; description: string }) => {
    const newEntry: IncomeEntry = {
      id: crypto.randomUUID(),
      timestamp: selectedDate ? new Date(selectedDate).setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()) : Date.now(),
      ...income,
    };
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleDeleteIncome = (id: string) => {
    setEntries((prevEntries) => prevEntries.filter(entry => entry.id !== id));
  };

  const {
    selectedDateTotal,
    weekTotal,
    previousWeekTotal,
    selectedDateEntries,
    isSaturday,
  } = useMemo(() => {
    const today = new Date();
    const date = selectedDate || today;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);

    const currentWeek = getWeekRange(date);
    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= currentWeek.start && entryDate <= currentWeek.end;
    });
    const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);

    const isTodaySaturday = date.getDay() === 6;

    let prevWeekTotal = 0;
    if (isTodaySaturday) {
      const previousWeek = getPreviousWeekRange(date);
      const previousWeekEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= previousWeek.start && entryDate <= previousWeek.end;
      });
      prevWeekTotal = previousWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
    }

    return {
      selectedDateTotal: dayTotal,
      weekTotal,
      previousWeekTotal: prevWeekTotal,
      selectedDateEntries: dayEntries,
      isSaturday: isTodaySaturday,
    };
  }, [entries, selectedDate]);

  if (!selectedDate) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Scissors className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const selectedDayIsToday = selectedDate && new Date().toDateString() === selectedDate.toDateString();

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
                onSelect={setSelectedDate}
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
