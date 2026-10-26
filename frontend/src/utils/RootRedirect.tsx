import {Navigate} from "react-router";
import {isAuthenticated} from "./auth.ts";


export const RootRedirect = () => {
    return <Navigate to={isAuthenticated() ? '/trips' : '/login'} replace/>
}
