import {Button} from "../Button/Button.tsx";
import {Link, useLocation, useNavigate} from "react-router";
import {useLogin} from "../../hooks/mutations.ts";
import {ApiError} from "../../api/ApiError.ts";
import {useState} from "react";

type LoginFields = 'email' | 'password';
type FieldErrors = Partial<Record<LoginFields, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validate = (email: string, password: string) => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
        errors.email = 'Вкажіть email'
    } else if (!EMAIL_REGEX.test(email)) {
        errors.email = 'Невірний формат email'
    }

    if (!password) {
        errors.password = 'Вкажіть пароль'
    }

    return errors;
}


export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>();
    const location = useLocation();
    const [error, setError] = useState<string>(location.state?.authError ?? '');
    const login = useLogin();
    const isLoading = login.isPending;

    const navigate = useNavigate();

    const clearFieldError = (field: LoginFields) => {
        setFieldErrors((prev) => ({...prev, [field]: undefined}));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const errors = validate(email, password);
        setFieldErrors(errors)

        if (Object.keys(errors).length > 0) return;

        try {
            await login.mutateAsync({email, password});
            navigate('/trips', {replace: true});
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setError('Невірний email або пароль');
            } else if (error instanceof ApiError) {
                setError('Щось пішло не так, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    }


    return (
        <div className='login-form'>
            <h1 className="login-page__title text-h6">Вхід</h1>
            <form className='login-form__content' onSubmit={handleSubmit} noValidate>
                <div className="login-form__field">
                    <div className='text-body'>Email</div>
                    <input
                        id="login-email"
                        className="login-page__input input"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                            clearFieldError('email');
                            setEmail(event.target.value)
                        }}
                        disabled={isLoading}
                        required
                    />
                    {fieldErrors?.email && (
                        <p id="login-email-error" className="login-form__field-error">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>
                <div className="login-form__field">
                    <div className='text-body'>Password</div>
                    <input
                        id="login-password"
                        className="login-page__input input"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => {
                            clearFieldError('password')
                            setPassword(event.target.value)
                        }}
                        disabled={isLoading}
                        required
                    />
                    {fieldErrors?.password && (
                        <p id="login-password-error" className="login-form__field-error">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>
                {error && (
                    <p className="login-page__error" role="alert">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" loading={isLoading} className="login-page__submit">
                    Увійти
                </Button>
            </form>

            <p className="login-form__footer text-small">Ще немає акаунта?{' '}
                <Link className="text-link" to={'/register'}>Зареєструватися</Link>
            </p>
        </div>
    )
}