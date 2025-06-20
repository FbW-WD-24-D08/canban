/**
 * Comprehensive date utilities for the MeisterTask clone
 * Supports natural language parsing, smart formatting, and date calculations
 */

export interface DateStatus {
  status: "overdue" | "due-soon" | "normal" | "completed";
  color: string;
  bgColor: string;
  textColor: string;
  urgency: number; // 0-100, higher = more urgent
}

/**
 * Parse natural language date input into a Date object
 */
export function parseNaturalDate(input: string): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Clean and normalize input
  const cleanInput = input.toLowerCase().trim();

  // Handle empty input
  if (!cleanInput) return null;

  // Relative dates
  const relativeDates: Record<string, () => Date> = {
    today: () => today,
    tomorrow: () => {
      const date = new Date(today);
      date.setDate(date.getDate() + 1);
      return date;
    },
    yesterday: () => {
      const date = new Date(today);
      date.setDate(date.getDate() - 1);
      return date;
    },
    "next week": () => {
      const date = new Date(today);
      date.setDate(date.getDate() + 7);
      return date;
    },
    "next month": () => {
      const date = new Date(today);
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  };

  if (relativeDates[cleanInput]) {
    return relativeDates[cleanInput]();
  }

  // Handle "next [day]" patterns
  const nextDayMatch = cleanInput.match(
    /^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/
  );
  if (nextDayMatch) {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDay = dayNames.indexOf(nextDayMatch[1]);
    const currentDay = now.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Next week if today or past

    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  // Handle "in X days/weeks/months" patterns
  const inXMatch = cleanInput.match(
    /^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/
  );
  if (inXMatch) {
    const amount = parseInt(inXMatch[1]);
    const unit = inXMatch[2];
    const futureDate = new Date(today);

    if (unit.startsWith("day")) {
      futureDate.setDate(futureDate.getDate() + amount);
    } else if (unit.startsWith("week")) {
      futureDate.setDate(futureDate.getDate() + amount * 7);
    } else if (unit.startsWith("month")) {
      futureDate.setMonth(futureDate.getMonth() + amount);
    }

    return futureDate;
  }

  // Handle month names with days (e.g., "Dec 25", "January 15")
  const monthDayMatch = cleanInput.match(
    /^(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(?:st|nd|rd|th)?$/
  );
  if (monthDayMatch) {
    const monthNames = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };

    const month = monthNames[monthDayMatch[1] as keyof typeof monthNames];
    const day = parseInt(monthDayMatch[2]);

    if (month !== undefined && day >= 1 && day <= 31) {
      const year = now.getFullYear();
      const parsedDate = new Date(year, month, day);

      // If the date has passed this year, assume next year
      if (parsedDate < today) {
        parsedDate.setFullYear(year + 1);
      }

      return parsedDate;
    }
  }

  // Handle "X days ago" patterns
  const daysAgoMatch = cleanInput.match(/^(\d+)\s+days?\s+ago$/);
  if (daysAgoMatch) {
    const daysAgo = parseInt(daysAgoMatch[1]);
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate;
  }

  // Handle "end of week/month"
  if (cleanInput === "end of week" || cleanInput === "eow") {
    const endOfWeek = new Date(today);
    const daysToSunday = 7 - now.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + daysToSunday);
    return endOfWeek;
  }

  if (cleanInput === "end of month" || cleanInput === "eom") {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return endOfMonth;
  }

  // Try standard date parsing as fallback
  const standardDate = new Date(input);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  return null;
}

/**
 * Get date status with color coding and urgency
 */
export function getDateStatus(
  dueDate: string | Date,
  completed: boolean = false
): DateStatus {
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (completed) {
    return {
      status: "completed",
      color: "#4CAF50",
      bgColor: "#4CAF5020",
      textColor: "#4CAF50",
      urgency: 0,
    };
  }

  if (diffInHours < 0) {
    // Overdue - urgency increases with time overdue
    const daysOverdue = Math.abs(diffInDays);
    const urgency = Math.min(100, 70 + daysOverdue * 5);

    return {
      status: "overdue",
      color: "#F44336",
      bgColor: "#F4433620",
      textColor: "#F44336",
      urgency,
    };
  } else if (diffInHours < 24) {
    // Due soon (within 24 hours)
    const urgency = Math.max(50, 70 - diffInHours * 1.5);

    return {
      status: "due-soon",
      color: "#FF9800",
      bgColor: "#FF980020",
      textColor: "#FF9800",
      urgency,
    };
  } else {
    // Normal - urgency decreases with time until due
    const urgency = Math.max(10, 40 - diffInDays * 2);

    return {
      status: "normal",
      color: "#9E9E9E",
      bgColor: "#9E9E9E20",
      textColor: "#9E9E9E",
      urgency,
    };
  }
}

/**
 * Format date for display with smart relative formatting
 */
export function formatSmartDate(
  date: string | Date,
  options: {
    showRelative?: boolean;
    includeTime?: boolean;
    shortFormat?: boolean;
  } = {}
): string {
  const {
    showRelative = true,
    includeTime = false,
    shortFormat = false,
  } = options;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const taskDate = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  );

  if (showRelative) {
    // Check relative dates
    if (taskDate.getTime() === today.getTime()) {
      return includeTime
        ? `Today at ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        : "Today";
    }

    if (taskDate.getTime() === tomorrow.getTime()) {
      return includeTime
        ? `Tomorrow at ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        : "Tomorrow";
    }

    if (taskDate.getTime() === yesterday.getTime()) {
      return includeTime
        ? `Yesterday at ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        : "Yesterday";
    }

    // Check if it's this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    if (dateObj >= startOfWeek && dateObj <= endOfWeek) {
      const dayName = dateObj.toLocaleDateString("en-US", {
        weekday: shortFormat ? "short" : "long",
      });
      return includeTime
        ? `${dayName} at ${dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        : dayName;
    }
  }

  // Default formatting
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: shortFormat ? "short" : "long",
    day: "numeric",
  };

  // Include year if different from current year
  if (dateObj.getFullYear() !== now.getFullYear()) {
    formatOptions.year = "numeric";
  }

  if (includeTime) {
    formatOptions.hour = "numeric";
    formatOptions.minute = "2-digit";
  }

  return dateObj.toLocaleDateString("en-US", formatOptions);
}

/**
 * Get date suggestions based on input
 */
export function getDateSuggestions(
  input: string = ""
): Array<{ text: string; value: Date; description?: string }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cleanInput = input.toLowerCase().trim();

  const baseSuggestions = [
    {
      text: "Today",
      value: today,
      description: today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    },
    {
      text: "Tomorrow",
      value: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      description: new Date(
        today.getTime() + 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    },
    {
      text: "Next Monday",
      value: getNextWeekday(1),
      description: getNextWeekday(1).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    },
    {
      text: "Next Friday",
      value: getNextWeekday(5),
      description: getNextWeekday(5).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    },
    {
      text: "In 1 week",
      value: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: new Date(
        today.getTime() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    },
    {
      text: "In 2 weeks",
      value: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      description: new Date(
        today.getTime() + 14 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    },
    {
      text: "End of month",
      value: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      description: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    },
  ];

  if (!cleanInput) {
    return baseSuggestions.slice(0, 5);
  }

  // Filter suggestions based on input
  const filtered = baseSuggestions.filter(
    (suggestion) =>
      suggestion.text.toLowerCase().includes(cleanInput) ||
      suggestion.description?.toLowerCase().includes(cleanInput)
  );

  return filtered.slice(0, 5);
}

/**
 * Get the next occurrence of a specific weekday
 */
function getNextWeekday(targetDay: number): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentDay = now.getDay();

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) daysToAdd += 7;

  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
}

/**
 * Calculate business days between two dates (excluding weekends)
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Get the start and end of the current week
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday

  return { start, end };
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}
