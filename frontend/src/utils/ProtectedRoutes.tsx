import {Outlet, Navigate} from "react-router";


export const ProtectedRoutes = () => {
    const token = localStorage.getItem("token");


    return token ? <Outlet/> : <Navigate to='/login'/>
}