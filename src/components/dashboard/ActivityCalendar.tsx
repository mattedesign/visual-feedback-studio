import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ActivityCalendar() {
  // Generate a grid of days for the calendar heatmap
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Generate 35 days (5 weeks)
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Random activity level for demo
      const activity = Math.random();
      let className = 'w-4 h-4 rounded-sm ';
      
      if (activity > 0.8) {
        className += 'bg-primary';
      } else if (activity > 0.6) {
        className += 'bg-primary/70';
      } else if (activity > 0.3) {
        className += 'bg-primary/40';
      } else if (activity > 0.1) {
        className += 'bg-primary/20';
      } else {
        className += 'bg-muted';
      }
      
      days.push({ date, className, activity });
    }
    
    return days;
  };

  const calendarData = generateCalendarData();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg mb-1">Active Days</CardTitle>
            <p className="text-sm text-muted-foreground">July 4 - July 18</p>
          </div>
          <Select defaultValue="weekly">
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-muted-foreground text-center p-1">
                {day}
              </div>
            ))}
            {calendarData.map((day, index) => (
              <div key={index} className="flex justify-center p-1">
                <div className={day.className} title={day.date.toDateString()} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}