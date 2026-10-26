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
                        <div className="register-page__right-second-text text-h14">Кожен записує, що купив, а наприкінці
                            navpil показує, хто кому скільки переказати — мінімальною кількістю переказів.
                        </div>
                        <div className="register-page__right-diagrama">
                            <div className="register-page__diagrama-header">
                                <span>Карпати · розрахунок</span><span>9 000 ₴</span>
                            </div>

                            <div className="register-page__diagrama-row">
                                <span className="register-page__diagrama-name">Андрій</span>
                                <div className="register-page__diagrama-track">
                                    <div className="register-page__diagrama-half register-page__diagrama-half--negative"></div>
                                    <div className="register-page__diagrama-half">
                                        <div className="register-page__diagrama-bar register-page__diagrama-bar--positive"
                                             style={{width: '100%'}}></div>
                                    </div>
                                </div>
                                <span className="register-page__diagrama-amount register-page__diagrama-amount--positive">+2 800</span>
                            </div>

                            <div className="register-page__diagrama-row">
                                <span className="register-page__diagrama-name">Оля</span>
                                <div className="register-page__diagrama-track">
                                    <div className="register-page__diagrama-half register-page__diagrama-half--negative">
                                        <div className="register-page__diagrama-bar register-page__diagrama-bar--negative"
                                             style={{width: '69%'}}></div>
                                    </div>
                                    <div className="register-page__diagrama-half"></div>
                                </div>
                                <span className="register-page__diagrama-amount">−1 940</span>
                            </div>

                            <div className="register-page__diagrama-row">
                                <span className="register-page__diagrama-name">Марія</span>
                                <div className="register-page__diagrama-track">
                                    <div className="register-page__diagrama-half register-page__diagrama-half--negative">
                                        <div className="register-page__diagrama-bar register-page__diagrama-bar--negative"
                                             style={{width: '31%'}}></div>
                                    </div>
                                    <div className="register-page__diagrama-half"></div>
                                </div>
                                <span className="register-page__diagrama-amount">−860</span>
                            </div>
                        </div>
                    </div>
                    <div className="register-page__right-add-text text-body">Для друзів, які разом їздять, а не рахують
                        у таблицях.
                    </div>
                </div>
            </div>
            <div className='register-page__left'>
                <LoginForm/>
            </div>
        </div>
    </div>

};