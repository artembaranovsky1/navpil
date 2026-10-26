import {Button} from "../Button/Button.tsx";
import {Link, useNavigate} from "react-router";
import {useState} from "react";
import {useRegister} from "../../hooks/mutations.ts";
import {ApiError} from "../../api/ApiError.ts";

type RegisterFields = 'name' | 'email' | 'password';
type FieldErrors = Partial<Record<RegisterFields, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validate = (name: string, email: string, password: string) => {
    const errors: FieldErrors = {};

    if (name.trim().length < 3) {
        errors.name = "Імʼя повинно складатися хоча б з 3 літер";
    }

    if (!email.trim()) {
        errors.email = 'Вкажіть email'
    } else if (!EMAIL_REGEX.test(email)) {
        errors.email = 'Невірний формат email'
    }

    if (!password.trim()) {
        errors.password = 'Вкажіть пароль'
    } else if (password.length < 8) {
        errors.password = 'Пароль має складатися хоча б з 8 символів'
    }

    return errors;
}


export const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const register = useRegister();
    const isLoading = register.isPending;

    const navigate = useNavigate();

    const clearFieldError = (field: RegisterFields) => {
        setFieldErrors((prev) => ({...prev, [field]: undefined}));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('')

        const errors = validate(name, email, password);
        setFieldErrors(errors)

        if (Object.keys(errors).length > 0) return;

        try {
            await register.mutateAsync({name: name.trim(), email: email.trim(), password: password.trim()});
            navigate('/trips', { replace: true });
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError('Цей email уже зареєстрований');
            } else if (err instanceof ApiError && err.status === 422) {
                setError('Трапилась помилка');
            } else if (err instanceof ApiError) {
                setError("Щось пішло не так, спробуй ще")
            } else {
                setError("Немає зєднання")
            }
        }
    }


    return (
        <div className='login-form'>
            <h1 className="login-page__title text-h6">Створити акаунт</h1>
            <div className='text-small'>Друзі побачать ваше ім'я у спільних подорожах.</div>
            <form className='login-form__content' onSubmit={handleSubmit} noValidate>
                <div className="login-form__field">
                    <div className='text-body'>Імʼя</div>
                    <input
                        id="login-name"
                        className="login-page__input input"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => {
                            clearFieldError('name');
                            setName(event.target.value)
                        }}
                        disabled={isLoading}
                        required
                    />
                    {fieldErrors?.name && (
                        <p id="login-name-error" className="login-form__field-error">
                            {fieldErrors.name}
                        </p>
                    )}
                </div>

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
                            clearFieldError('password');
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
                    Зареєструватися
                </Button>
            </form>

            <p className="login-form__footer text-small">Вже є акаунт?{' '}
                <Link className="text-link" to={'/login'}>Увійти</Link>
            </p>
        </div>
    )
}