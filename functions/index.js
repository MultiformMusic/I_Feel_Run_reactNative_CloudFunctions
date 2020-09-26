const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const firebaseConfig = require("./firebaseConfig.json");
var serviceAccount = require("./ifeelrunreactnative.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: serviceAccount.databaseURL
});

firebase.initializeApp(firebaseConfig);

// *** Cloud Fucntions : Gestion des Users ***//

const { registerUser, singInUser } = require('./auth/index');

exports.registerUser = registerUser(functions, admin);
exports.signInUser = singInUser(functions, firebase);
