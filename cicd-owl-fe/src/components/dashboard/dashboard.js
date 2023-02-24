import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css'
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

function Dashboard() {
    const navigate = useNavigate();
    let toast = useRef(null);
    useEffect(() => {
        const validateToken = async () => {
            let token = localStorage.getItem('token');
            if (token) {
                let res = await fetch('http://192.168.10.108:8888/users/login/token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "data": token
                    })
                })
                if (res.status === 401) {
                    navigate("/login");
                }
            }
        }
        validateToken();
    }, []);

    let LogoutClick = async () => {
        localStorage.removeItem('token');
        navigate("/login");
    }

    return (
        <>
            <Button label="Logout" type="logout" className="p-button-danger logout-button" onClick={() => LogoutClick()} />
            <Toast ref={toast} />
            <h1>Dashboard</h1>
            {/* <div className="card flex justify-content-center">
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
            </div> */}
        </>
    )
}

export default Dashboard;