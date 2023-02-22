import React, { useState, useRef, setState } from 'react';
import './login.css'
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
// import Dashboard from './components/login/login'
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    let toast = useRef(null);
    let [user, setUser] = useState('');
    let [pass, setPass] = useState('');
    let [isLoggedIn, setIsLoggedIn] = useState(false);
    let status = '';

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
            let res = await fetch('http://192.168.10.108:8888/users/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "data": {
                        "userName": user,
                        "userPass": pass
                    }
                })
            })
            // let res = await fetch('http://192.168.10.108:8888/users');
            let resData = await res.json();
            if (res.status === 200) {
                setIsLoggedIn(true);
                status = await resData.userName;
                toast.current.show({ severity: 'success', summary: 'Success', detail: status });
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