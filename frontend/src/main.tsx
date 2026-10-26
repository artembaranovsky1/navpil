import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import '@fontsource-variable/geologica';
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./api/queryClient.ts";
import './styles/main.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
)
