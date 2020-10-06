
/**
 * 
 * Save (or update) activities for an user account
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const saveUserActivities = (functions, admin) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("saveUserActivities start");

    const db = admin.firestore();

    const {user: {email}, datas} = request.body;
    functions.logger.info("saveUserActivities user = " + JSON.stringify(email));

    try {

        const userRef = db.collection('users');

        functions.logger.info("saveUserActivities activityToSave begin = " + datas.timeStartActivity.toString());
        const activityDoc = {...datas};
        delete activityDoc.activityGeoPoints;
        const activityRef = await userRef.doc(email).collection('activities');
        await activityRef.doc(datas.timeStartActivity.toString()).set({activityDoc},  { merge: true });

        const activityGeopoints = datas.activityGeoPoints;
        functions.logger.info("saveUserActivities geopoints = " + activityGeopoints.length);
        for (const geopoint of activityGeopoints) {

            await activityRef.doc(datas.timeStartActivity.toString()).collection('geopoint')
                                .doc(geopoint.order.toString()).set({geopoint},  { merge: true });
        }

        functions.logger.info("saveUserActivities activityToSave OK = " + datas.timeStartActivity.toString());

        return response.status(200).send({message: "OK"});
        
    } catch (error) {

        functions.logger.error("saveUserActivities error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
    }

});

/**
 * 
 * Check if an activity exists for user
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const activityExist = (functions, admin) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("activityExist start");

    const db = admin.firestore();

    const {user: {email}, activity: {time}} = request.body;

    functions.logger.info("saveUserActivities activityExist = " + JSON.stringify(email) + " -- time = " + JSON.stringify(time));

    try {

        const userRef = await db.collection('users');
        const activityRef = await userRef.doc(email).collection('activities').doc(time.toString());
        const activityDoc = await activityRef.get();

        if (activityDoc && activityDoc.exists) {
            functions.logger.info("activityExist OK");
            return response.status(200).send({message: "OK"});
        } else {
            functions.logger.info("activityExist NOK");
            return response.status(200).send({message: "NOK"});
        }

    } catch (error) {
        functions.logger.error("activityExist error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
    }
    
});

/**
 * 
 * Get all activities fro an user account (email)
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const getUserActivities = (functions, admin) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getUserActivities start");

    const db = admin.firestore();

    const {user: {email}} = request.body;
    functions.logger.info("getUserActivities email = " + email);

    try {

        const userRef = await db.collection('users');
        const snapshot = await userRef.doc(email).collection('activities').get();
        let activities = [];
        snapshot.forEach(async doc => {
            activities.push(doc.data());
        });

        for (activity of activities) {

            const snapshotGeo = await userRef.doc(email).collection('activities')
                                             .doc(activity.activityDoc.timeStartActivity.toString()).collection('geopoint').get();

            let geopoints = [];
            snapshotGeo.forEach(docGeo => {
                geopoints.push(docGeo.data());
            })

            activity.activityDoc.activityGeopoints = geopoints;

        }

        return response.status(200).send({message: "OK", datas: activities});
        
    } catch (error) {

        functions.logger.error("getUserActivities error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
    }

});

module.exports = {
    saveUserActivities,
    activityExist,
    getUserActivities
}