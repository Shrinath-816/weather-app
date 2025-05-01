import { useEffect, useState, useRef } from "react";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Login from "./Components/Login";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import Weather from "./Components/Weather";
import { v4 as uuidv4 } from 'uuid';
//import { db } from './firebase'; // ✅ Pre-configured and initialized


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "your api",
  authDomain: "weather-app-.firebaseapp.com",
  projectId: "weather-app-",
  storageBucket: "weather-app-.firebasestorage.app",
  messagingSenderId: "yourId",
  appId: "1::web:",
  measurementId: "yourId"
};


// Initialize Firebase

function App() {
  const [user, setUser] = useState([]);
  const logoutAfter = 3600000;
 // let app, auth, provider;
  const app = useRef(null);
  const auth = useRef(null);
  const provider = useRef(null);
  //const starCountRef = useRef(null);
  //const [dataObj, setDataObj] = useState({});
  useEffect(
    () => {
      app.current = initializeApp(firebaseConfig);
      auth.current = getAuth();
      provider.current = new GoogleAuthProvider();
    },
    []
  )
  useEffect(
    () => {
      const userData = localStorage.getItem("userData");
      const loginAt = localStorage.getItem("loginAt");
      const now = new Date().getTime();
      const duration = now - loginAt;
      if (duration > logoutAfter) {
        logout();
      } else {
        if (userData !== null) {
          // auto login
          setUser(JSON.parse(userData));
        }
      }
    },
    []
  )
  const addRecentToDb = (data) => {
    const db = getDatabase(app.current)
    const id = uuidv4()
    // console.log(user.email);
    // return 
    // console.log("addRecentToDb", data);
    set(ref(db, 'recents/' + id), {
      email: user.email,
      recentData: data
    });
  }

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("loginAt");
    localStorage.removeItem("localRecent");
  }

  const googleLoginHandler = () => {
    signInWithPopup(auth.current, provider.current)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
       // const credential = GoogleAuthProvider.credentialFromResult(result);
       // const token = credential.accessToken;
        // The signed-in user info.
        localStorage.setItem("userData", JSON.stringify(result.user));
        localStorage.setItem("loginAt", new Date().getTime())
        setUser(result.user);
        // ...
      }).catch((error) => {
        // Handle Errors here.
        //const errorCode = error.code;
        //const errorMessage = error.message;
        // The email of the user's account used.
        //const email = error.email;
        // The AuthCredential type that was used.
        //const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  const readData = () => {
    const db = getDatabase();
    const starCountRef = ref(db, 'recents');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const dataObj = Object.values(data)
      console.log(dataObj);
      const filteredData = dataObj.filter(
        (d) => {
          return d.email === user.email
        }
      )
      console.log(filteredData);
    });
  }

  return (
    <>
      <button className="btn btn-danger"
        onClick={
          readData
        } > Read </button> {
        user.length === 0 ?
          <Login handler={
            googleLoginHandler
          }
          /> :
          <Weather recentDbHandler={
            addRecentToDb
          }
          />
      }
    </>
  );
}

export default App;