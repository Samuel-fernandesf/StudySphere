import React from "react";
import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Dashboard from "./components/Dashboard";
import AuthScreen from "./components/auth/auth";


function Rotas(){
    return(
        <Routes>
            <Route Component={AuthScreen} path="/" exact/>
            <Route Component={Dashboard} path='/home'/>
        </Routes>
        )
}
export default Rotas