// Natural language date and time parser
class DateParser {
    static parse(text) {
        const result = {
            text: text,
            date: null,
            time: null,
            cleanedText: text
        };

        const now = new Date();
        let foundDate = null;
        let foundTime = null;

        // Time patterns
        const timePatterns = [
            { regex: /\b(noon|midday)\b/i, handler: () => '12:00 PM' },
            { regex: /\bmidnight\b/i, handler: () => '12:00 AM' },
            { regex: /\b(\d{1,2})\s*(am|pm)\b/i, handler: (match) => {
                let hour = parseInt(match[1]);
                const period = match[2].toUpperCase();
                return `${hour}:00 ${period}`;
            }},
            { regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i, handler: (match) => {
                const hour = match[1];
                const minute = match[2];
                const period = match[3] ? match[3].toUpperCase() : '';
                return period ? `${hour}:${minute} ${period}` : `${hour}:${minute}`;
            }}
        ];

        // Check for time patterns
        for (const pattern of timePatterns) {
            const match = text.match(pattern.regex);
            if (match) {
                foundTime = pattern.handler(match);
                result.cleanedText = result.cleanedText.replace(pattern.regex, '').trim();
                break;
            }
        }

        // Date patterns
        const datePatterns = [
            {
                regex: /\btoday\b/i,
                handler: () => new Date(now)
            },
            {
                regex: /\btomorrow\b/i,
                handler: () => {
                    const date = new Date(now);
                    date.setDate(date.getDate() + 1);
                    return date;
                }
            },
            {
                regex: /\byesterday\b/i,
                handler: () => {
                    const date = new Date(now);
                    date.setDate(date.getDate() - 1);
                    return date;
                }
            },
            {
                regex: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i,
                handler: (match) => {
                    const amount = parseInt(match[1]);
                    const unit = match[2].toLowerCase();
                    const date = new Date(now);

                    if (unit.startsWith('day')) {
                        date.setDate(date.getDate() + amount);
                    } else if (unit.startsWith('week')) {
                        date.setDate(date.getDate() + (amount * 7));
                    } else if (unit.startsWith('month')) {
                        date.setMonth(date.getMonth() + amount);
                    }
                    return date;
                }
            },
            {
                regex: /\bon\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/i,
                handler: (match) => {
                    const months = {
                        january: 0, february: 1, march: 2, april: 3,
                        may: 4, june: 5, july: 6, august: 7,
                        september: 8, october: 9, november: 10, december: 11
                    };
                    const month = months[match[1].toLowerCase()];
                    const day = parseInt(match[2]);
                    const year = match[3] ? parseInt(match[3]) : now.getFullYear();
                    return new Date(year, month, day);
                }
            },
            {
                regex: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
                handler: (match) => {
                    const month = parseInt(match[1]) - 1;
                    const day = parseInt(match[2]);
                    let year = now.getFullYear();
                    if (match[3]) {
                        year = match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3]);
                    }
                    return new Date(year, month, day);
                }
            },
            {
                regex: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
                handler: (match) => {
                    const days = {
                        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                        thursday: 4, friday: 5, saturday: 6
                    };
                    const targetDay = days[match[1].toLowerCase()];
                    const currentDay = now.getDay();
                    const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
                    const date = new Date(now);
                    date.setDate(date.getDate() + daysUntil);
                    return date;
                }
            }
        ];

        // Check for date patterns
        for (const pattern of datePatterns) {
            const match = text.match(pattern.regex);
            if (match) {
                foundDate = pattern.handler(match);
                result.cleanedText = result.cleanedText.replace(pattern.regex, '').trim();
                break;
            }
        }

        // Format results
        if (foundDate) {
            result.date = this.formatDate(foundDate);
        }
        if (foundTime) {
            result.time = foundTime;
        }

        // Clean up multiple spaces
        result.cleanedText = result.cleanedText.replace(/\s+/g, ' ').trim();

        return result;
    }

    static formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }

    static getDateDisplay(dateString) {
        if (!dateString) return '';

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Parse the MM/DD format
        const parts = dateString.split('/');
        if (parts.length !== 2) return dateString;

        const taskDate = new Date(now.getFullYear(), parseInt(parts[0]) - 1, parseInt(parts[1]));

        // If the date has passed this year, it might be for next year
        if (taskDate < today) {
            taskDate.setFullYear(taskDate.getFullYear() + 1);
        }

        // Compare dates
        if (taskDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else if (taskDate < today) {
            return dateString; // Overdue
        }

        return dateString;
    }

    static isOverdue(dateString) {
        if (!dateString) return false;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const parts = dateString.split('/');
        if (parts.length !== 2) return false;

        const taskDate = new Date(now.getFullYear(), parseInt(parts[0]) - 1, parseInt(parts[1]));

        return taskDate < today;
    }
}
