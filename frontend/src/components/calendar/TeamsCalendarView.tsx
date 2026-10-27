'use client';

import React, { useState, useMemo } from 'react';
import { SiteVisit, SiteVisitStatus, UserProfile, Lead } from '@/types/crm';
import { VisitDetailDrawer } from './VisitDetailDrawer';
import { ScheduleVisitModal } from '@/components/site-visits/ScheduleVisitModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  User,
  Plus,
  MapPin,
  CheckCircle2,
  CalendarDays,
  Filter,
  Sparkles,
  Phone,
  Layers,
} from 'lucide-react';

interface TeamsCalendarViewProps {
  visits: SiteVisit[];
  leads: Lead[];
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onVisitsUpdated: () => void;
}

type CalendarViewMode = 'week' | 'work_week' | 'day' | 'month';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function TeamsCalendarView({
  visits,
  leads,
  currentUser,
  telecallers,
  onVisitsUpdated,
}: TeamsCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);

  // New site visit modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string>('');

  // Calculate start of week (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  // Generate days array for the week
  const weekDays = useMemo(() => {
    const count = viewMode === 'work_week' ? 5 : 7;
    return Array.from({ length: count }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  }, [weekStart, viewMode]);

  // Date range title (e.g., "October 26 – November 1, 2026")
  const dateRangeLabel = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
    }
    const start = weekDays[0];
    const end = weekDays[weekDays.length - 1];
    const startMonth = start.toLocaleDateString('en-IN', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-IN', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
  }, [currentDate, viewMode, weekDays]);

  // Navigate functions
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchProject = projectFilter === 'all' || v.project_name === projectFilter;
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchProject && matchStatus;
    });
  }, [visits, projectFilter, statusFilter]);

  // Unique projects for filtering
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.project_name))).filter(Boolean);
  }, [visits]);

  // Find visits matching a specific day and hour
  const getVisitsForSlot = (day: Date, hour: number) => {
    return filteredVisits.filter((v) => {
      const vDate = new Date(v.scheduled_date);
      const isSameDay =
        vDate.getFullYear() === day.getFullYear() &&
        vDate.getMonth() === day.getMonth() &&
        vDate.getDate() === day.getDate();
      const vHour = vDate.getHours();
      return isSameDay && vHour === hour;
    });
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      today.getFullYear() === day.getFullYear() &&
      today.getMonth() === day.getMonth() &&
      today.getDate() === day.getDate()
    );
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const slotDate = new Date(day);
    slotDate.setHours(hour, 0, 0, 0);
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const localIso = new Date(slotDate.getTime() - slotDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setPrefilledDate(localIso);
    setIsScheduleOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Teams Schedule Top Bar */}
      <div className="luxury-card rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border border-slate-200 shadow-xs">
        {/* Left: Date Nav Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={handlePrev}
              title="Previous"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              title="Next"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            {dateRangeLabel}
          </h3>
        </div>

        {/* Center: View Switcher (Teams Style) */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 self-start lg:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white text-amber-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('work_week')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'work_week'
                ? 'bg-white text-amber-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white text-amber-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white text-amber-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Month
          </button>
        </div>

        {/* Right: Filters & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Developments</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled (Blocked)</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => {
              setPrefilledDate('');
              setIsScheduleOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Book Site Visit</span>
          </button>
        </div>
      </div>

      {/* Week & Work Week Grid (Microsoft Teams Layout) */}
      {(viewMode === 'week' || viewMode === 'work_week') && (
        <div className="luxury-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          {/* Header Row: Days of Week */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50 text-center divide-x divide-slate-200">
            <div className="py-3 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-['Space_Grotesk'] flex items-center justify-center">
              Time
            </div>
            {weekDays.map((day, idx) => {
              const todayFlag = isToday(day);
              const dayName = day.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
              const dayNum = day.getDate();
              return (
                <div
                  key={idx}
                  className={`py-2.5 px-2 transition ${
                    todayFlag ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-['Space_Grotesk']">
                    {dayName}
                  </p>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${
                        todayFlag
                          ? 'gold-gradient-bg text-white shadow-xs'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slot Rows (8 AM to 8 PM) */}
          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {HOURS.map((hour) => {
              const displayTime = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
              return (
                <div
                  key={hour}
                  className="grid grid-cols-[70px_repeat(7,1fr)] min-h-[76px] divide-x divide-slate-100 group"
                >
                  {/* Time Column */}
                  <div className="p-2 text-right text-[11px] font-mono font-semibold text-slate-400 bg-slate-50/60 select-none">
                    {displayTime}
                  </div>

                  {/* Day Slots */}
                  {weekDays.map((day, dIdx) => {
                    const slotVisits = getVisitsForSlot(day, hour);
                    const todayFlag = isToday(day);

                    return (
                      <div
                        key={dIdx}
                        onClick={() => slotVisits.length === 0 && handleSlotClick(day, hour)}
                        className={`p-1.5 relative transition ${
                          todayFlag ? 'bg-amber-500/3' : 'bg-white'
                        } ${
                          slotVisits.length === 0
                            ? 'hover:bg-slate-50/80 cursor-pointer group/cell'
                            : ''
                        }`}
                      >
                        {slotVisits.length === 0 ? (
                          <div className="w-full h-full rounded-lg border border-transparent group-hover/cell:border-dashed group-hover/cell:border-slate-300 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Plus className="w-3 h-3 text-amber-600" />
                              Block Slot
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {slotVisits.map((visit) => {
                              const isScheduled = visit.status === 'scheduled';
                              const isCompleted = visit.status === 'completed';
                              const isInProgress = visit.status === 'in_progress';

                              return (
                                <div
                                  key={visit.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVisit(visit);
                                  }}
                                  className={`rounded-xl p-2.5 text-left border-l-4 shadow-sm hover:shadow-md transition cursor-pointer select-none relative overflow-hidden group/card ${
                                    isCompleted
                                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                                      : isInProgress
                                      ? 'bg-purple-50/90 border-purple-500 text-purple-950'
                                      : 'bg-amber-500/10 border-amber-600 text-amber-950'
                                  }`}
                                >
                                  {/* Top badge */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full font-['Space_Grotesk'] ${
                                        isCompleted
                                          ? 'bg-emerald-200/80 text-emerald-900'
                                          : isInProgress
                                          ? 'bg-purple-200/80 text-purple-900'
                                          : 'bg-amber-200/80 text-amber-900'
                                      }`}
                                    >
                                      {isCompleted
                                        ? 'COMPLETED'
                                        : isInProgress
                                        ? 'ON ROAD'
                                        : 'BLOCKED • VISIT'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                                      {new Date(visit.scheduled_date).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  {/* Client & Project */}
                                  <p className="font-extrabold text-xs truncate text-slate-900 font-['Outfit']">
                                    {visit.lead_name || 'Prospect Client'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                                    {visit.project_name}
                                  </p>

                                  {/* Fleet & Escort Meta */}
                                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                    <span className="flex items-center gap-1 truncate font-semibold text-slate-700">
                                      <Car className="w-3 h-3 text-blue-600 shrink-0" />
                                      {visit.vehicle_type?.split(' ')[0] || 'Innova'}
                                    </span>
                                    <span className="truncate text-slate-500">
                                      {visit.escort_name?.split(' ')[0] || 'Escort'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="luxury-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                Detailed Operations Schedule for {dateRangeLabel}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-600 font-mono">
              {filteredVisits.filter((v) => {
                const vd = new Date(v.scheduled_date);
                return (
                  vd.getFullYear() === currentDate.getFullYear() &&
                  vd.getMonth() === currentDate.getMonth() &&
                  vd.getDate() === currentDate.getDate()
                );
              }).length}{' '}
              Visits Blocked Today
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {HOURS.map((hour) => {
              const displayTime = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
              const slotVisits = getVisitsForSlot(currentDate, hour);

              return (
                <div
                  key={hour}
                  className="grid grid-cols-[100px_1fr] min-h-[90px] divide-x divide-slate-100 group"
                >
                  <div className="p-4 text-right text-xs font-mono font-bold text-slate-500 bg-slate-50/60 select-none">
                    {displayTime}
                  </div>

                  <div
                    onClick={() => slotVisits.length === 0 && handleSlotClick(currentDate, hour)}
                    className="p-3 transition hover:bg-slate-50/50 cursor-pointer"
                  >
                    {slotVisits.length === 0 ? (
                      <div className="h-full flex items-center text-slate-400 text-xs gap-1.5 opacity-60 hover:opacity-100 transition">
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Empty Slot — Click to schedule site visit and block fleet</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {slotVisits.map((visit) => (
                          <div
                            key={visit.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVisit(visit);
                            }}
                            className="p-4 rounded-xl border-l-4 border-amber-600 bg-amber-500/10 shadow-xs hover:shadow-md transition text-slate-800"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                                BLOCKED • SITE VISIT
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-600">
                                {new Date(visit.scheduled_date).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                              {visit.lead_name}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">{visit.project_name}</p>

                            <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <Car className="w-3.5 h-3.5 text-blue-600" />
                                {visit.vehicle_type} ({visit.driver_name})
                              </span>
                              <span>Escort: {visit.escort_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="luxury-card rounded-2xl p-5 border border-slate-200 shadow-sm bg-white">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 font-['Space_Grotesk'] uppercase tracking-wider mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, idx) => {
              const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              );
              const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // monday is 0
              const cellDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                idx - startOffset + 1
              );
              const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
              const todayFlag = isToday(cellDate);

              const dayVisits = filteredVisits.filter((v) => {
                const vd = new Date(v.scheduled_date);
                return (
                  vd.getFullYear() === cellDate.getFullYear() &&
                  vd.getMonth() === cellDate.getMonth() &&
                  vd.getDate() === cellDate.getDate()
                );
              });

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(cellDate);
                    setViewMode('day');
                  }}
                  className={`min-h-[96px] p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    todayFlag
                      ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                      : isCurrentMonth
                      ? 'border-slate-200 bg-white hover:bg-slate-50'
                      : 'border-slate-100 bg-slate-50/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        todayFlag
                          ? 'w-6 h-6 rounded-full gold-gradient-bg text-white flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    {dayVisits.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayVisits.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisit(v);
                        }}
                        className="text-[10px] font-bold p-1 rounded-md bg-amber-500/15 text-amber-900 truncate border-l-2 border-amber-600 hover:scale-[1.02] transition"
                      >
                        {new Date(v.scheduled_date).toLocaleTimeString('en-IN', {
                          hour: 'numeric',
                        })}{' '}
                        • {v.lead_name}
                      </div>
                    ))}
                    {dayVisits.length > 2 && (
                      <p className="text-[9px] text-slate-400 font-semibold text-center">
                        +{dayVisits.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Visit Details Drawer */}
      <VisitDetailDrawer
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onUpdated={onVisitsUpdated}
      />

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        leads={leads}
        currentUser={currentUser}
        telecallers={telecallers}
        onScheduled={() => {
          onVisitsUpdated();
          setIsScheduleOpen(false);
        }}
      />
    </div>
  );
}
