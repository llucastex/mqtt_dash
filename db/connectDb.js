const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update, onValue } = require('firebase/database');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAt1ifFrPSjjC2PS6EO69vWiLA2o2qZTc0",
    authDomain: "clp-teste.firebaseapp.com",
    projectId: "clp-teste",
    storageBucket: "clp-teste.appspot.com",
    messagingSenderId: "30384936745",
    appId: "1:30384936745:web:df8f75de48c304eb7b4938"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = database;