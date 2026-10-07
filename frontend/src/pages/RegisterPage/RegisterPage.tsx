import '../RegisterPage/RegisterPage.scss';
import {PointList} from "./PointList/PointList.tsx";
import {RegisterForm} from "../../components/RegisterForm/RegisterForm.tsx";

export const RegisterPage = () => {


    return <div className="content">
        <div className="register-page">
            <div className="register-page__right">
                <div className="register-page__right-content">
                    <div className="register-page__logo"></div>
                    <div className="register-page__right-center">
                        <h1 className="register-page__right-main-text text-h1">
                            Один акаунт —<br />
                            усі подорожі.
                        </h1>
                        <div className="register-page__point-list" >
                            <PointList />
                        </div>

                    </div>
                    <div className="register-page__right-add-text text-body">Безкоштовно для будь-якої кількості
                        подорожей.
                    </div>
                </div>
            </div>
            <div className="register-page__left">

                <RegisterForm />
            </div>
        </div>
    </div>
}