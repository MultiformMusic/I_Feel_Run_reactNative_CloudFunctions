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

const { registerUser, singInUser, deleteUser, userPasswordReset, updateUser } = require('./auth/index');
const { saveUserActivities, getUserActivities, activityExist, getUserActivitiesTimeStart, getActivityFromTimeStart } = require('./firestore/index');
const { getWeatherFromCoord} = require('./openweather/index');

exports.registerUser = registerUser(functions, admin);
exports.signInUser = singInUser(functions, firebase);
exports.deleteUser = deleteUser(functions, admin);
exports.userPasswordReset = userPasswordReset(functions, firebase);
exports.updateUser = updateUser(functions, admin);
exports.saveUserActivities = saveUserActivities(functions, admin);
exports.getUserActivities = getUserActivities(functions, admin);
exports.activityExist = activityExist(functions, admin);
exports.getUserActivitiesTimeStart = getUserActivitiesTimeStart(functions, admin);
exports.getActivityFromTimeStart = getActivityFromTimeStart(functions, admin);
exports.getWeatherFromCoord = getWeatherFromCoord(functions);
