const MONTHS_GENITIVE = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

export const formatMoney = (amount: number): string =>
    Math.abs(amount).toLocaleString('uk-UA', {maximumFractionDigits: 2});

// +2 800 / −1 940 / 0
export const formatSignedMoney = (amount: number): string => {
    if (amount > 0) return `+${formatMoney(amount)}`;
    if (amount < 0) return `−${formatMoney(amount)}`;
    return '0';
};

const parseDate = (date: string) => {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return {year, month, day};
};

// "12–16 травня", "28 квітня – 3 травня"
export const formatTripDates = (startDate?: string, endDate?: string): string => {
    if (!startDate && !endDate) return '';

    if (!startDate || !endDate) {
        const {month, day} = parseDate((startDate ?? endDate)!);
        return `${day} ${MONTHS_GENITIVE[month - 1]}`;
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (start.year === end.year && start.month === end.month) {
        return start.day === end.day
            ? `${start.day} ${MONTHS_GENITIVE[start.month - 1]}`
            : `${start.day}–${end.day} ${MONTHS_GENITIVE[end.month - 1]}`;
    }

    return `${start.day} ${MONTHS_GENITIVE[start.month - 1]} – ${end.day} ${MONTHS_GENITIVE[end.month - 1]}`;
};

const MONTHS_SHORT = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];

// "12 трав"
export const formatShortDate = (date: string): string => {
    const {month, day} = parseDate(date);
    return `${day} ${MONTHS_SHORT[month - 1]}`;
};

// "12 травня"
export const formatLongDate = (date: string): string => {
    const {month, day} = parseDate(date);
    return `${day} ${MONTHS_GENITIVE[month - 1]}`;
};

// pluralize(2, ['переказ', 'перекази', 'переказів']) -> "перекази"
export const pluralize = (count: number, [one, few, many]: [string, string, string]): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
};

// Сьогоднішня дата за місцевим часом у форматі РРРР-ММ-ДД
export const todayIso = (): string => new Date().toLocaleDateString('sv-SE');
