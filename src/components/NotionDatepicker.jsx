import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isWithinInterval, addMonths, subMonths, 
  startOfWeek, endOfWeek, isAfter, isBefore, parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function NotionDatepicker({ dateRange, setDateRange }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Internal State (Before Applying)
  const [tempStart, setTempStart] = useState(dateRange.start ? parseISO(dateRange.start) : new Date());
  const [tempEnd, setTempEnd] = useState(dateRange.end ? parseISO(dateRange.end) : new Date());
  const [clickStep, setClickStep] = useState(0); // 0 = ready for start, 1 = ready for end
  
  // Calendar View Month
  const [currentMonth, setCurrentMonth] = useState(tempStart);

  useEffect(() => {
    // Reset temp state if opened
    if (isOpen) {
      setTempStart(parseISO(dateRange.start));
      setTempEnd(parseISO(dateRange.end));
      setCurrentMonth(parseISO(dateRange.start));
      setClickStep(0);
    }
  }, [isOpen, dateRange]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cn = (...inputs) => twMerge(clsx(inputs));

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDayClick = (day) => {
    if (clickStep === 0) {
      setTempStart(day);
      setTempEnd(day); // reset end to same day initially
      setClickStep(1);
    } else {
      if (isBefore(day, tempStart)) {
        // reversed click
        setTempEnd(tempStart);
        setTempStart(day);
      } else {
        setTempEnd(day);
      }
      setClickStep(0); // ready to re-select
    }
  };

  const handleApply = () => {
    setDateRange({
      start: format(tempStart, 'yyyy-MM-dd'),
      end: format(tempEnd, 'yyyy-MM-dd')
    });
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const formatDateLabel = () => {
    return `${format(parseISO(dateRange.start), 'dd MMM, yyyy', {locale: ptBR})} → ${format(parseISO(dateRange.end), 'dd MMM, yyyy', {locale: ptBR})}`;
  };

  return (
    <div className="relative" ref={popoverRef}>
       {/* Opener Button */}
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto px-4 py-2 min-h-[44px] bg-dark-surface border border-dark-border hover:border-active-blue/50 rounded-lg text-sm font-medium transition-colors"
       >
         <Calendar size={16} className="text-active-blue" />
         {formatDateLabel()}
       </button>

       {/* Popover / Overlay via Portal para escapar qualquer limite CSS */}
       {isOpen && typeof document !== 'undefined' && createPortal(
         <div className="fixed inset-0 z-50 flex items-end md:items-start md:justify-end" style={{ pointerEvents: 'none' }}>
           {/* Backdrop para fechar */}
           <div className="fixed inset-0 bg-black/60 md:hidden pointer-events-auto" onClick={() => setIsOpen(false)}></div>
           
           {/* Popover Calendar Container */}
           <div 
             ref={popoverRef}
             className="w-full md:w-[340px] md:fixed pointer-events-auto mt-auto md:mt-0 bg-dark-surface border-t md:border border-dark-border rounded-t-2xl md:rounded-xl shadow-2xl p-6 md:p-4 animate-in slide-in-from-bottom flex flex-col max-h-[85vh] md:max-h-none overflow-y-auto"
             style={{
               // Desktop absolute behavior emulation via fixed relative coords!
               top: typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? '90px' : 'auto',
               right: typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? '32px' : '0'
             }}
           >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
               <button onClick={prevMonth} className="p-2 hover:bg-dark-border rounded text-slate-400 min-h-[44px] flex items-center"><ChevronLeft size={20}/></button>
               <span className="font-semibold text-slate-200 capitalize text-lg">
                 {format(currentMonth, 'MMMM yyyy', {locale: ptBR})}
               </span>
               <button onClick={nextMonth} className="p-2 hover:bg-dark-border rounded text-slate-400 min-h-[44px] flex items-center"><ChevronRight size={20}/></button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-500">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
               {calendarDays.map((day, idx) => {
                 const isSelectedStart = isSameDay(day, tempStart);
                 const isSelectedEnd = isSameDay(day, tempEnd);
                 const isBetween = tempStart && tempEnd && isWithinInterval(day, { start: tempStart, end: tempEnd });
                 
                 // Classes logic
                 const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                 
                 return (
                   <button
                     key={idx}
                     onClick={() => handleDayClick(day)}
                     className={cn(
                       "relative h-11 md:h-9 text-sm md:text-xs flex items-center justify-center transition-all",
                       !isCurrentMonth && "text-slate-600",
                       isCurrentMonth && "text-slate-300 hover:text-white",
                       // In Between highlighting
                       isBetween && !isSelectedStart && !isSelectedEnd && "bg-active-blue/20",
                       // Start/End highlights
                       (isSelectedStart || isSelectedEnd) && "bg-active-blue text-white font-bold rounded-md shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"
                     )}
                   >
                     {/* Rectangle connectors for "in-between" look */}
                     {isSelectedStart && isBetween && tempStart !== tempEnd && <div className="absolute right-0 w-1/2 h-full bg-active-blue/20 -z-10"></div>}
                     {isSelectedEnd && isBetween && tempStart !== tempEnd && <div className="absolute left-0 w-1/2 h-full bg-active-blue/20 -z-10"></div>}
                     
                     {format(day, 'd')}
                   </button>
                 );
               })}
            </div>

            {/* Actions */}
            <div className="mt-6 md:mt-4 pt-4 border-t border-dark-border flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
               <div className="text-sm md:text-xs text-slate-400">
                  {clickStep === 1 ? 'Selecione a data de fim...' : 'Selecione a data de início'}
               </div>
               <button 
                 onClick={handleApply}
                 className="flex items-center justify-center gap-2 w-full md:w-auto min-h-[44px] bg-profit-neon hover:bg-profit-hover text-dark-bg px-6 py-2 rounded-lg font-bold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
               >
                 <Check size={18} />
                 Aplicar
               </button>
            </div>
         </div>
         </div>,
         document.body
       )}
    </div>
  );
}
