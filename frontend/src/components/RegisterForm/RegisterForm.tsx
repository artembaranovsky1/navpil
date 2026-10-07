import {Button} from "../Button/Button.tsx";
import {Link, useNavigate} from "react-router";
import {useState} from "react";
import {register} from "../../api/auth.ts";
import {ApiError} from "../../api/ApiError.ts";

export const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('')
        setFieldErrors({})
        setIsLoading(true);

        try {
            await register(name, email, password)

            navigate('/login', {replace: true}); // потім замінити на trips
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError('Цей email уже зареєстрований');
            } else if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as Record<string, string[]>);
            } else if (err instanceof ApiError) {
                setError("Щось пішло не так, спробуй ще")
            } else {
                setError("Немає зєднання")
            }
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className='login-form'>
            <h1 className="login-page__title text-h6">Створити акаунт</h1>
            <div className='text-small'>Друзі побачать ваше ім'я у спільних подорожах.</div>
            <form className='login-form__content' onSubmit={handleSubmit}>
                <div className="login-form__field">
                    <div className='text-body'>Імʼя</div>
                    <input
                        id="login-name"
                        className="login-page__input input"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="login-form__field">
                    <div className='text-body'>Email</div>
                    <input
                        id="login-email"
                        className="login-page__input input"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="login-form__field">
                    <div className='text-body'>Password</div>
                    <input
                        id="login-password"
                        className="login-page__input input"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={isLoading}
                        required
                    />
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