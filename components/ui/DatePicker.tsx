'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  min?: string;
}

export function DatePicker({ 
  label, 
  value, 
  onChange, 
  error, 
  required,
  min 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState<{ hours: number; minutes: number }>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime({ hours: date.getHours(), minutes: date.getMinutes() });
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (hours: number, minutes: number) => {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
    setSelectedDate(newDate);
    const isoString = newDate.toISOString().slice(0, 16);
    onChange(isoString);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      const isoString = newDate.toISOString().slice(0, 16);
      onChange(isoString);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );

  const minDate = min ? new Date(min) : new Date();
  minDate.setHours(0, 0, 0, 0);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = date < minDate;
      const isSelected = selectedDate && 
        date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && handleDateSelect(date)}
          disabled={isPast}
          className={`w-10 h-10 font-bold text-sm border-2 border-black transition-all ${
            isSelected
              ? 'bg-blue-500 text-white'
              : isPast
              ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
              : isToday
              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
              : 'bg-[#2a2a2a] text-white hover:bg-[#333333]'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="w-full" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-black uppercase tracking-wide text-white mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-[#2a2a2a] border-4 border-black font-medium text-white text-left focus:outline-none focus:bg-[#333333] ${
            error ? 'border-red-500 bg-red-900/20' : ''
          }`}
        >
          {value ? (
            <div className="flex items-center justify-between">
              <span>{formatDate(selectedDate)} at {formatTime(selectedTime.hours, selectedTime.minutes)}</span>
              <span className="text-2xl">📅</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-gray-400">
              <span>Select date and time</span>
              <span className="text-2xl">📅</span>
            </div>
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 bg-[#2a2a2a] border-4 border-black neobrutal-shadow-lg w-full max-w-sm">
            {/* Calendar Header */}
            <div className="p-4 border-b-4 border-black bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="px-3 py-1 bg-blue-500 text-white border-2 border-black font-bold hover:bg-blue-400 transition-colors"
                >
                  ←
                </button>
                <h3 className="text-lg font-black uppercase text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="px-3 py-1 bg-blue-500 text-white border-2 border-black font-bold hover:bg-blue-400 transition-colors"
                >
                  →
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-black uppercase text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            {/* Time Picker */}
            <div className="p-4 border-t-4 border-black bg-[#1a1a1a]">
              <div className="mb-2">
                <label className="text-xs font-black uppercase text-white mb-2 block">Time</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={selectedTime.hours}
                      onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, selectedTime.minutes)}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border-2 border-black text-white font-bold text-center focus:outline-none focus:bg-[#333333]"
                    />
                  </div>
                  <span className="text-2xl font-black text-white pt-6">:</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={selectedTime.minutes}
                      onChange={(e) => handleTimeChange(selectedTime.hours, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border-2 border-black text-white font-bold text-center focus:outline-none focus:bg-[#333333]"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white border-2 border-black font-black uppercase hover:bg-blue-400 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm font-bold text-red-400 uppercase">{error}</p>
      )}
    </div>
  );
}

