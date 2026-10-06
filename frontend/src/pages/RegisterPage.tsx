import {useState} from "react";
import {Button} from "../components/Button/Button.tsx";
import { Link, useNavigate} from "react-router";
import {register} from "../api/auth.ts";
import {ApiError} from "../api/ApiError.ts";

export const RegisterPage = () => {
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

    return <div className="content">
        <h1>RegisterPage</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <div>Name</div>
                <input
                    id="register-name"
                    className="register-page__input"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div>
                <div>Email</div>
                <input
                    id="register-email"
                    className="register-page__input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div>
                <div>Password</div>
                <input
                    id="register-password"
                    className="register-page__input"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            {error && (
                <p className="register-page__error" role="alert">
                    {error}
                </p>
            )}

            <Button type="submit" size="lg" loading={isLoading} className="login-page__submit">
                Увійти
            </Button>
        </form>

        <p className="login-page__footer">Вже є акаунт?
            <Link to={'/login'}>Увійти</Link>
        </p>
    </div>;
};