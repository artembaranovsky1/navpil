
import {Route, Routes} from "react-router";
import {HomePage} from "./pages/HomePage.tsx";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {UiKitPage} from "./pages/UiKitPage.tsx";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";

function App() {
  return (
    <Routes>
        <Route path='/home' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/ui-kit' element={<UiKitPage />} />
        <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
