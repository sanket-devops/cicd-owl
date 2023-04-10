import React, { useState, useRef, setState, useEffect } from 'react';
import './login.css'
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { userLogin, validateToken } from '../../service/dashboard.service';

function Login() {
    const navigate = useNavigate();
    let toast = useRef(null);
    let [user, setUser] = useState('');
    let [pass, setPass] = useState('');
    let [isLoggedIn, setIsLoggedIn] = useState(false);
    let status = '';

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            (async function () {
                let res = await validateToken(token);
                if (res.status === 200) {
                    navigate("/dashboard");
                }
            }());
        }
        else {
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Logout Success' });
        }
    }, []);

    let Greeting = () => {
        if (isLoggedIn) {
            return <h1>Welcome {user}</h1>;
        } else {
            return <h1>Please login...</h1>;
        }
    }
    let userChange = (e) => {
        setUser(e.target.value)
    }

    let passChange = (e) => {
        setPass(e.target.value)
    }

    let LoginClick = async () => {
        if (user) {
            let res = await userLogin(user, pass)
            let resData = await res.json();
            if (res.status === 200) {
                setIsLoggedIn(true);
                localStorage.setItem('token', resData.token)
                navigate("/dashboard");
            } else {
                setIsLoggedIn(false);
                status = await resData.error;
                toast.current.show({ severity: 'error', summary: 'Error', detail: status });
            }
        } else {
            status = 'Please Enter Username and Password';
            toast.current.show({ severity: 'error', summary: 'Error', detail: status });
        }
    }
    return (
        <>
            <>{Greeting()}</>
            <Toast ref={toast} />
            <div className="card flex justify-content-center">
                <div className="flex flex-column gap-2">
                    <label htmlFor="username">Username</label>
                    <InputText id="username" value={user} onChange={(e) => userChange(e)} aria-describedby="username-help" />
                    <small id="username-help">
                        Enter your username.
                    </small>
                    <br />
                    <label htmlFor="password">Password</label>
                    <InputText id="password" value={pass} onChange={(e) => passChange(e)} aria-describedby="password-help" />
                    <small id="password-help">
                        Enter your password.
                    </small>
                    <br />
                    <Button label="Submit" type="submit" onClick={() => LoginClick()} icon="pi pi-check" />
                </div>
            </div>
        </>
    )
}

export default Login;