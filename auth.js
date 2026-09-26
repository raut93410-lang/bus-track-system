// ==========================================
// BUS TRACKING SYSTEM - AUTHENTICATION
// REGISTER + LOGIN
// ==========================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// REGISTER PAGE
// ==========================================

const registerForm =
    document.getElementById("registerForm");


// Check if Register page
if (registerForm) {

    const role =
        document.getElementById("role");

    const driverSection =
        document.getElementById("driverSection");

    const busNumberInput =
        document.getElementById("busNumber");


    // ======================================
    // DRIVER / CUSTOMER ROLE CHANGE
    // ======================================

    if (role) {

        role.addEventListener(
            "change",
            function () {

                if (role.value === "driver") {

                    // Show Bus Number
                    driverSection.style.display = "block";

                    // Bus number required
                    busNumberInput.required = true;

                } else {

                    // Hide Bus Number
                    driverSection.style.display = "none";

                    // Bus number not required
                    busNumberInput.required = false;

                    // Clear old value
                    busNumberInput.value = "";
                }

            }
        );

    }


    // ======================================
    // REGISTER FORM SUBMIT
    // ======================================

    registerForm.addEventListener(
        "submit",
        async function (event) {

            // Prevent page reload
            event.preventDefault();


            // ----------------------------------
            // GET FORM VALUES
            // ----------------------------------

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const mobile =
                document
                    .getElementById("mobile")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const userRole =
                role.value;


            let busNumber = "";


            // ----------------------------------
            // VALIDATE ROLE
            // ----------------------------------

            if (!userRole) {

                alert(
                    "Please select your role."
                );

                return;
            }


            // ----------------------------------
            // DRIVER BUS NUMBER
            // ----------------------------------

            if (userRole === "driver") {

                busNumber =
                    busNumberInput.value
                        .trim()
                        .toUpperCase();


                if (!busNumber) {

                    alert(
                        "Please enter your Bus Number."
                    );

                    busNumberInput.focus();

                    return;
                }

            }


            // ----------------------------------
            // MOBILE VALIDATION
            // ----------------------------------

            if (!/^[0-9]{10}$/.test(mobile)) {

                alert(
                    "Please enter a valid 10 digit mobile number."
                );

                return;
            }


            // ----------------------------------
            // PASSWORD VALIDATION
            // ----------------------------------

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            try {

                // ----------------------------------
                // CREATE FIREBASE AUTH ACCOUNT
                // ----------------------------------

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "Firebase Auth user created:",
                    user.uid
                );


                // ----------------------------------
                // SAVE USER IN FIRESTORE
                // ----------------------------------

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        name: name,

                        mobile: mobile,

                        email: email,

                        role: userRole,

                        busNumber: busNumber,

                        createdAt: new Date()

                    }
                );


                console.log(
                    "User data saved to Firestore."
                );


                // ----------------------------------
                // CREATE BUS DOCUMENT FOR DRIVER
                // ----------------------------------

                if (userRole === "driver") {

                    await setDoc(
                        doc(
                            db,
                            "buses",
                            busNumber
                        ),
                        {

                            busNumber: busNumber,

                            driverId: user.uid,

                            status: "offline",

                            latitude: null,

                            longitude: null,

                            lastUpdated: null

                        }
                    );


                    console.log(
                        "Bus document created:",
                        busNumber
                    );

                }


                // ----------------------------------
                // SUCCESS
                // ----------------------------------

                alert(
                    "Registration Successful! 🎉"
                );


                // Go to Login
                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                // ----------------------------------
                // FRIENDLY ERROR MESSAGES
                // ----------------------------------

                let message =
                    "Registration failed.";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        message =
                            "This email is already registered.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/weak-password":

                        message =
                            "Password must contain at least 6 characters.";

                        break;


                    case "permission-denied":

                        message =
                            "Firestore permission denied. Check Firebase rules.";

                        break;


                    default:

                        message =
                            error.message;

                }


                alert(
                    "Registration Failed ❌\n\n" +
                    message
                );

            }

        }
    );

}


// ==========================================
// LOGIN PAGE
// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            // Prevent reload
            event.preventDefault();


            // ----------------------------------
            // GET LOGIN VALUES
            // ----------------------------------

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            // ----------------------------------
            // BASIC VALIDATION
            // ----------------------------------

            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;
            }


            try {

                // ----------------------------------
                // FIREBASE LOGIN
                // ----------------------------------

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "Login successful:",
                    user.uid
                );


                // ----------------------------------
                // GET USER PROFILE
                // ----------------------------------

                const userDoc =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                // ----------------------------------
                // CHECK USER DOCUMENT
                // ----------------------------------

                if (!userDoc.exists()) {

                    alert(
                        "User profile not found in Firestore."
                    );

                    return;
                }


                const userData =
                    userDoc.data();


                // ----------------------------------
                // CHECK ROLE
                // ----------------------------------

                if (!userData.role) {

                    alert(
                        "User role is missing."
                    );

                    return;
                }


                // ----------------------------------
                // LOGIN SUCCESS
                // ----------------------------------

                alert(
                    "Login Successful! ✅"
                );


                // ----------------------------------
                // DRIVER
                // ----------------------------------

                if (
                    userData.role === "driver"
                ) {

                    window.location.href =
                        "driver.html";

                    return;
                }


                // ----------------------------------
                // CUSTOMER
                // ----------------------------------

                if (
                    userData.role === "customer"
                ) {

                    window.location.href =
                        "customer.html";

                    return;
                }


                // ----------------------------------
                // INVALID ROLE
                // ----------------------------------

                alert(
                    "Invalid user role."
                );

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                // ----------------------------------
                // FRIENDLY LOGIN ERRORS
                // ----------------------------------

                let message =
                    "Login failed.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Invalid email or password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "User account not found.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Incorrect password.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "permission-denied":

                        message =
                            "Firestore permission denied.";

                        break;


                    default:

                        message =
                            error.message;

                }


                alert(
                    "Login Failed ❌\n\n" +
                    message
                );

            }

        }
    );

}