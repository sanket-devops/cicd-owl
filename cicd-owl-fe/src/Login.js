import React, { useState, useEffect } from 'react';
// import App from './App';

class LoginControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoggedIn: false, user: '', pass: '' };

    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.LoginClick = this.LoginClick.bind(this);

    this.Greeting = ()=>{
      return <h1>Please login...</h1>;
    }
  }

  userChange(event) {
    this.setState({ user: event.target.value });
    // console.log(this.state)
  }

  passChange(event) {
    this.setState({ pass: event.target.value });
    // console.log(this.state)
  }


  LoginClick(event) {
    this.setState({ isLoggedIn: true });
    // alert('A User was submitted: ' + this.state.user + 'A Pass was submitted: ' + this.state.pass);
    event.preventDefault();
    console.log(this.state)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.LoginClick}>
          <h1>{this.state.isLoggedIn}</h1>
          <label>
            User:
            <input type="text" name='user' value={this.state.user} onChange={this.userChange} />
          </label>
          <br />
          <label>
            Password:
            <input type="text" value={this.state.pass} onChange={this.passChange} />
          </label>
          <br />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

// function UserGreeting(props) {
//   return <h1>Welcome back!</h1>;
// }

// function GuestGreeting(props) {
//   return <h1>Please login...</h1>;
// }

// function Greeting() {
//   console.log("hello from out function...")
//   // const isLoggedIn = props.isLoggedIn;
//   // if (isLoggedIn) {
//   //   console.log(isLoggedIn)
//   //   return <UserGreeting />;
//   // }
//   // console.log(isLoggedIn)
//   // return <GuestGreeting />;
// }

// function LoginButton(props) {
//   return (
//     <button onClick={props.onClick}>
//       Login
//     </button>
//   );
// }

// function LogoutButton(props) {
//   return (
//     <button onClick={props.onClick}>
//       Logout
//     </button>
//   );
// }

export default LoginControl;