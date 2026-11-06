import Svg, {Path} from 'react-native-svg';
import {colors} from '@/color';

// контури іконок — ті самі, що в svg на фронті
export const ICONS = {
    plus: 'M12 5v14M5 12h14',
    close: 'M6 6l12 12M18 6L6 18',
    back: 'M15 5l-7 7 7 7',
    arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    home: 'M3 20h18M5 20V10l7-5 7 5v10M10 20v-5h4v5',
    house: 'M4 21V9l8-6 8 6v12M9 21v-7h6v7',
    calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
    userPlus: 'M9 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6',
    copy: 'M9 9h11v11H9zM5 15V5a1 1 0 0 1 1-1h9',
    share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5',
    check: 'M5 12l5 5 9-10',
    logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
    name?: IconName;
    // або власний контур
    path?: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export function Icon({name, path, size = 20, color = colors.text, strokeWidth = 1.8}: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d={path ?? (name ? ICONS[name] : '')}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
