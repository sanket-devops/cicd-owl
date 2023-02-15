
import App from './App';

function Login(props) {
    let isLoggedIn = props.isLoggedIn
    if (isLoggedIn) {
        return (
            <div className="Login">
              <App />
            </div>
        );
    }
    return (
        <div className="Login">
          <h1>Please login...</h1>
        </div>
    );
}

export default Login;