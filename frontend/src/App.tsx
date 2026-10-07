import {Route, Routes} from "react-router";
import {HomePage} from "./pages/HomePage.tsx";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {UiKitPage} from "./pages/UiKitPage.tsx";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage.tsx";
import {TripsPage} from "./pages/TripsPage/TripsPage.tsx";
import {JoinTripPage} from "./pages/JoinTripPage.tsx";
import {NewTripPage} from "./pages/NewTripPage.tsx";
import {TripExpensesPage} from "./pages/TripExpensesPage.tsx";
import {SettlePage} from "./pages/SettlePage.tsx";
import {MembersPage} from "./pages/MembersPage.tsx";
import {AddExpensePage} from "./pages/AddExpensePage.tsx";
import {ExpenseDetailPage} from "./pages/ExpenseDetailPage.tsx";
import {ProtectedRoutes} from "./utils/ProtectedRoutes.tsx";
import {AppLayout} from "./components/AppLayout/AppLayout.tsx";

function App() {
    return (
        <Routes>
            <Route path='/home' element={<HomePage/>}/>

            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>

            <Route element={<ProtectedRoutes />} >
                <Route element={<AppLayout/>}>
                    <Route path='/join' element={<JoinTripPage/>}/>

                    <Route path='/trips' element={<TripsPage/>}/>
                    <Route path='/trips/new' element={<NewTripPage/>}/>
                    <Route path='/trips/:tripId' element={<TripExpensesPage/>}/>
                    <Route path='/trips/:tripId/settle' element={<SettlePage/>}/>
                    <Route path='/trips/:tripId/members' element={<MembersPage/>}/>

                    <Route path='/trips/:tripId/expenses/new' element={<AddExpensePage/>}/>
                    <Route path='/trips/:tripId/expenses/:expenseId' element={<ExpenseDetailPage/>}/>
                </Route>
            </Route>

            <Route path='/ui-kit' element={<UiKitPage/>}/>
            <Route path='*' element={<NotFoundPage/>}/>
        </Routes>
    )
}

export default App
