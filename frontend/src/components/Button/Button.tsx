import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children: ReactNode;
};

export const Button = ({
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           disabled,
                           className,
                           type = 'button',
                           children,
                           ...rest
                       }: ButtonProps) => {
    const classes = [
        'button',
        `button--${variant}`,
        `button--${size}`,
        loading && 'button--loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <span className="button__spinner" aria-hidden="true" />}
            <span className="button__label">{children}</span>
        </button>
    );
};