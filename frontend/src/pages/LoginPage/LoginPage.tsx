import './LoginPage.scss';
import {useState} from "react";
import {useNavigate} from "react-router";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        })

        const data = await response.json();
        console.log(response.status, data);

        if (!response.ok) {
            setError("Не вірний пароль");

            return;
        }

        localStorage.setItem('token', data.token);
        navigate('/trips', { replace: true });
    }

    return <div className="content">
        {/*<img className="login-page__logo" src={logo} alt="navpil" />*/}


        <form onSubmit={handleSubmit}>
            <div>
                <div>Email</div>
                <input type='text' placeholder='Email' onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div>
                <div>Password</div>
                <input type='text' placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <button type='submit'>Login</button>
        </form>

        {error && <p className="login-page__error" role="alert">{error}</p>}
    </div>

};