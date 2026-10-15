import './Skeleton.scss'
import type {CSSProperties, ReactNode} from "react";

type SkeletonProps = {
    width?: number | string;
    height?: number | string;
    radius?: number | string;
    // на темному фоні (як блок активної подорожі)
    dark?: boolean;
    className?: string;
}

// Сірий блок-заглушка з анімацією «мерехтіння»
export const Skeleton = ({width = '100%', height = 14, radius = 8, dark = false, className}: SkeletonProps) => {
    const style: CSSProperties = {width, height, borderRadius: radius};
    const classes = ['skeleton', dark && 'skeleton--dark', className].filter(Boolean).join(' ');

    return <span className={classes} style={style} aria-hidden="true"/>;
};

type SkeletonScreenProps = {
    label?: string;
    className?: string;
    children: ReactNode;
}

// Обгортка для екрана завантаження: скрінрідер чує текст, а бачимо — заглушки
export const SkeletonScreen = ({label = 'Завантаження…', className, children}: SkeletonScreenProps) => (
    <div role="status" aria-live="polite" className={['skeleton-screen', className].filter(Boolean).join(' ')}>
        <span className="skeleton-screen__label">{label}</span>
        {children}
    </div>
);
