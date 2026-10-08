import './LoginPage.scss';
import '../../components/Input/Input.scss'
import {LoginForm} from "../../components/LoginForm/LoginForm.tsx";

export const LoginPage = () => {
    return <div>
        <div className="register-page">
            <div className="register-page__right">
                <div className="register-page__right-content">
                    <div className="register-page__logo"></div>
                    <div className="register-page__right-center">
                        <h1 className="register-page__right-main-text text-h1">Подорожуйте разом. Рахуйте навпіл.</h1>
                        <div className="register-page__right-second-text text-h14">Кожен записує, що купив, а наприкінці navpil показує, хто кому скільки переказати — мінімальною кількістю переказів.</div>
                        <div className="register-page__right-diagrama"></div>
                    </div>
                    <div className="register-page__right-add-text text-body">Для друзів, які разом їздять, а не рахують у таблицях.</div>
                </div>
            </div>
            <div className='register-page__left'>
                <LoginForm />
            </div>
        </div>
    </div>

};