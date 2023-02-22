import React, { useState, setState } from 'react';
import './login.css'
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';

function Login() {
    let [user, setUser] = useState('');
    let [pass, setPass] = useState('');
    let [isLoggedIn, setsIsLoggedIn] = useState(false);

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
        setsIsLoggedIn(true);
        fetch('http://192.168.10.108:8888/users/login', {
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
        // let data = await res.json();
        // console.log(data.data)
        // console.log(user, pass, isLoggedIn)
    }

    return (
        <>
            <>{Greeting()}</>
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









// class Login extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { isLoggedIn: false, user: '', pass: '' };

//         this.userChange = this.userChange.bind(this);
//         this.passChange = this.passChange.bind(this);
//         this.LoginClick = this.LoginClick.bind(this);

//     }

//     Greeting = () => {
//         if (this.state.isLoggedIn) {
//             return <h1>Welcome {this.state.user}</h1>;
//         } else {
//             return <h1>Please login...</h1>;
//         }
//     }
//     userChange(event) {
//         this.setState({ user: event.target.value });
//         // console.log(this.state)
//     }

//     passChange(event) {
//         this.setState({ pass: event.target.value });
//         // console.log(this.state)
//     }

//     LoginClick(event) {
//         this.setState({ isLoggedIn: true });
//         event.preventDefault();
//         console.log(this.state)
//     }

//     render() {
//         return (
//             <>
//                 <>{this.Greeting()}</>
//                 <div className="card flex justify-content-center">
//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="username">Username</label>
//                         <InputText id="username" value={this.state.user} onChange={this.userChange} aria-describedby="username-help" />
//                         <small id="username-help">
//                             Enter your username.
//                         </small>
//                         <br />
//                         <label htmlFor="password">Password</label>
//                         <InputText id="password" value={this.state.pass} onChange={this.passChange} aria-describedby="password-help" />
//                         <small id="password-help">
//                             Enter your password.
//                         </small>
//                         <br />
//                         <Button label="Submit" type="submit" onClick={this.LoginClick} icon="pi pi-check" />
//                     </div>
//                 </div>
//             </>
//         )
//     }
// }
export default Login;