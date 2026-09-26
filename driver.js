// ==========================================
// BUS TRACKING SYSTEM - DRIVER
// GPS + START TRIP + END TRIP
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// VARIABLES
// ==========================================

let currentUser = null;
let busNumber = null;
let watchId = null;


// ==========================================
// HTML ELEMENTS
// ==========================================

const driverBus =
    document.getElementById("driverBus");

const gpsStatus =
    document.getElementById("gpsStatus");

const startTrip =
    document.getElementById("startTrip");

const endTrip =
    document.getElementById("endTrip");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// CHECK LOGIN USER
// ==========================================

onAuthStateChanged(
    auth,
    async function (user) {

        // ----------------------------------
        // USER NOT LOGGED IN
        // ----------------------------------

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        currentUser = user;


        try {

            // ----------------------------------
            // GET USER DATA
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
            // USER DATA NOT FOUND
            // ----------------------------------

            if (!userDoc.exists()) {

                alert(
                    "User data not found in Firestore."
                );

                await signOut(auth);

                window.location.href =
                    "login.html";

                return;
            }


            const userData =
                userDoc.data();


            // ----------------------------------
            // CHECK DRIVER ROLE
            // ----------------------------------

            if (
                userData.role !== "driver"
            ) {

                alert(
                    "Access denied. Driver account required."
                );

                window.location.href =
                    "customer.html";

                return;
            }


            // ----------------------------------
            // GET BUS NUMBER
            // ----------------------------------

            busNumber =
                userData.busNumber;


            if (!busNumber) {

                alert(
                    "Bus number is not assigned to this driver."
                );

                return;
            }


            // Show bus number
            driverBus.innerText =
                "Bus Number: " + busNumber;


            gpsStatus.innerText =
                "🔴 GPS is OFF";


        } catch (error) {

            console.error(
                "Driver Loading Error:",
                error
            );

            alert(
                "Unable to load driver data.\n\n" +
                error.message
            );

        }

    }
);


// ==========================================
// START TRIP
// ==========================================

if (startTrip) {

    startTrip.addEventListener(
        "click",
        function () {

            // ----------------------------------
            // CHECK BUS NUMBER
            // ----------------------------------

            if (!busNumber) {

                alert(
                    "Bus number is not loaded yet."
                );

                return;
            }


            // ----------------------------------
            // CHECK GPS SUPPORT
            // ----------------------------------

            if (!navigator.geolocation) {

                alert(
                    "GPS is not supported on this device/browser."
                );

                return;
            }


            // ----------------------------------
            // PREVENT MULTIPLE GPS WATCHES
            // ----------------------------------

            if (watchId !== null) {

                return;
            }


            gpsStatus.innerText =
                "🟡 Requesting GPS permission...";


            // ----------------------------------
            // START GPS TRACKING
            // ----------------------------------

            watchId =
                navigator.geolocation.watchPosition(

                    async function (position) {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        // GPS accuracy
                        const accuracy =
                            position.coords.accuracy;


                        gpsStatus.innerText =
                            "🟢 GPS Active";


                        console.log(
                            "Location:",
                            latitude,
                            longitude
                        );


                        try {

                            // ----------------------------------
                            // UPDATE FIRESTORE
                            // ----------------------------------

                            await updateDoc(
                                doc(
                                    db,
                                    "buses",
                                    busNumber
                                ),
                                {

                                    busNumber:
                                        busNumber,

                                    driverId:
                                        currentUser.uid,

                                    status:
                                        "on-trip",

                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude,

                                    accuracy:
                                        accuracy,

                                    lastUpdated:
                                        serverTimestamp()

                                }
                            );


                            console.log(
                                "Firebase location updated."
                            );


                        } catch (error) {

                            console.error(
                                "Firebase Update Error:",
                                error
                            );


                            gpsStatus.innerText =
                                "🔴 Firebase Error";

                        }

                    },


                    // ----------------------------------
                    // GPS ERROR
                    // ----------------------------------

                    function (error) {

                        console.error(
                            "GPS Error:",
                            error
                        );


                        gpsStatus.innerText =
                            "🔴 GPS Error";


                        let message =
                            "Unable to get your location.";


                        if (
                            error.code ===
                            error.PERMISSION_DENIED
                        ) {

                            message =
                                "Location permission denied. Please allow location access.";

                        } else if (
                            error.code ===
                            error.POSITION_UNAVAILABLE
                        ) {

                            message =
                                "GPS location is currently unavailable.";

                        } else if (
                            error.code ===
                            error.TIMEOUT
                        ) {

                            message =
                                "GPS request timed out. Please try again.";

                        }


                        alert(message);

                    },


                    // ----------------------------------
                    // GPS SETTINGS
                    // ----------------------------------

                    {
                        enableHighAccuracy: true,
                        maximumAge: 5000,
                        timeout: 10000
                    }

                );


            // ----------------------------------
            // CHANGE BUTTONS
            // ----------------------------------

            startTrip.style.display =
                "none";

            endTrip.style.display =
                "block";


            gpsStatus.innerText =
                "🟡 Starting GPS...";

        }
    );

}


// ==========================================
// END TRIP
// ==========================================

if (endTrip) {

    endTrip.addEventListener(
        "click",
        async function () {

            // ----------------------------------
            // STOP GPS
            // ----------------------------------

            if (watchId !== null) {

                navigator.geolocation.clearWatch(
                    watchId
                );

                watchId = null;

            }


            // ----------------------------------
            // CHECK BUS NUMBER
            // ----------------------------------

            if (!busNumber) {

                return;
            }


            try {

                // ----------------------------------
                // SET BUS OFFLINE
                // ----------------------------------

                await updateDoc(
                    doc(
                        db,
                        "buses",
                        busNumber
                    ),
                    {

                        status:
                            "offline",

                        latitude:
                            null,

                        longitude:
                            null,

                        lastUpdated:
                            serverTimestamp()

                    }
                );


                gpsStatus.innerText =
                    "🔴 Trip Ended";


                // ----------------------------------
                // CHANGE BUTTONS
                // ----------------------------------

                startTrip.style.display =
                    "block";

                endTrip.style.display =
                    "none";


            } catch (error) {

                console.error(
                    "End Trip Error:",
                    error
                );


                alert(
                    "Unable to end trip.\n\n" +
                    error.message
                );

            }

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                // ----------------------------------
                // STOP GPS
                // ----------------------------------

                if (watchId !== null) {

                    navigator.geolocation.clearWatch(
                        watchId
                    );

                    watchId = null;

                }


                // ----------------------------------
                // SET BUS OFFLINE
                // ----------------------------------

                if (busNumber) {

                    try {

                        await updateDoc(
                            doc(
                                db,
                                "buses",
                                busNumber
                            ),
                            {

                                status:
                                    "offline",

                                latitude:
                                    null,

                                longitude:
                                    null,

                                lastUpdated:
                                    serverTimestamp()

                            }
                        );

                    } catch (error) {

                        console.error(
                            "Bus Status Update Error:",
                            error
                        );

                    }

                }


                // ----------------------------------
                // FIREBASE LOGOUT
                // ----------------------------------

                await signOut(auth);


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout failed.\n\n" +
                    error.message
                );

            }

        }
    );

}