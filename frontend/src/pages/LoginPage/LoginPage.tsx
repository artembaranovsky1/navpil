import './LoginPage.scss';
import {useState} from "react";
import {useNavigate, Link} from "react-router";
import {login} from "../../api/auth.ts";
import {ApiError} from "../../api/ApiError.ts";
import {Button} from "../../components/Button/Button.tsx";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const {token} = await login(email, password);

            localStorage.setItem('token', token);
            navigate('/trips', { replace: true });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setError('Невірний email або пароль');
            } else if (error instanceof ApiError) {
                setError('Щось пішло не так, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return <div className="content">
        <h1 className="login-page__title">Вхід</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <div>Email</div>
                <input
                    id="login-email"
                    className="login-page__input"
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
                    id="login-password"
                    className="login-page__input"
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
                Увійти
            </Button>
        </form>

        <p className="login-page__footer">Ще немає акаунта?
            <Link to={'/register'}>Зареєструватися</Link>
        </p>

    </div>

};