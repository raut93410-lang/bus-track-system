// ==========================================
// BUS TRACKING SYSTEM - CUSTOMER
// BUS SEARCH + LIVE LOCATION
// ==========================================

import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const searchButton =
    document.getElementById("searchButton");

const searchBus =
    document.getElementById("searchBus");

const busResult =
    document.getElementById("busResult");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// SEARCH BUS
// ==========================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        async function () {

            // Get bus number
            const busNumber =
                searchBus.value
                    .trim()
                    .toUpperCase();


            // ----------------------------------
            // CHECK EMPTY INPUT
            // ----------------------------------

            if (!busNumber) {

                alert(
                    "Please enter Bus Number."
                );

                searchBus.focus();

                return;
            }


            // Show searching message
            busResult.innerHTML = `
                <div style="margin-top:20px;">
                    <p>🔎 Searching for bus...</p>
                </div>
            `;


            try {

                // ----------------------------------
                // GET BUS FROM FIRESTORE
                // ----------------------------------

                const busDoc =
                    await getDoc(
                        doc(
                            db,
                            "buses",
                            busNumber
                        )
                    );


                // ----------------------------------
                // BUS NOT FOUND
                // ----------------------------------

                if (!busDoc.exists()) {

                    busResult.innerHTML = `
                        <div style="margin-top:20px;">
                            <h3>❌ Bus Not Found</h3>
                            <p>
                                No bus found with number
                                <strong>${busNumber}</strong>.
                            </p>
                        </div>
                    `;

                    return;
                }


                // Get bus data
                const bus =
                    busDoc.data();


                // ----------------------------------
                // CHECK LOCATION
                // ----------------------------------

                if (
                    bus.latitude === null ||
                    bus.longitude === null ||
                    bus.latitude === undefined ||
                    bus.longitude === undefined
                ) {

                    busResult.innerHTML = `
                        <div style="margin-top:20px;">
                            <h3>🚌 Bus ${bus.busNumber}</h3>

                            <p>
                                🔴 Bus is currently offline.
                            </p>

                            <p>
                                The driver has not started
                                the trip yet.
                            </p>
                        </div>
                    `;

                    return;
                }


                // ----------------------------------
                // BUS LOCATION AVAILABLE
                // ----------------------------------

                const latitude =
                    bus.latitude;

                const longitude =
                    bus.longitude;


                // Google Maps URL
                const mapURL =
                    `https://www.google.com/maps?q=${latitude},${longitude}`;


                // ----------------------------------
                // SHOW BUS RESULT
                // ----------------------------------

                busResult.innerHTML = `
                    <div
                        style="
                            margin-top:20px;
                            padding:20px;
                            border-radius:12px;
                            background:#f1f5f9;
                        "
                    >

                        <h3>
                            🚌 Bus ${bus.busNumber}
                        </h3>

                        <p>
                            Status:
                            <strong>
                                ${bus.status || "Unknown"}
                            </strong>
                        </p>

                        <p>
                            📍 Live location available
                        </p>

                        <p>
                            Latitude:
                            ${latitude}
                        </p>

                        <p>
                            Longitude:
                            ${longitude}
                        </p>


                        <a
                            href="${mapURL}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                display:block;
                                margin-top:15px;
                                padding:12px;
                                background:#2563eb;
                                color:white;
                                text-decoration:none;
                                border-radius:8px;
                                text-align:center;
                                font-weight:bold;
                            "
                        >
                            📍 Open Live Location
                        </a>

                    </div>
                `;

            } catch (error) {

                console.error(
                    "Bus Search Error:",
                    error
                );


                busResult.innerHTML = `
                    <div style="margin-top:20px;">
                        <p>
                            ❌ Unable to search bus.
                        </p>
                    </div>
                `;

                alert(
                    "Error searching bus.\n\n" +
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