
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
 * Récupère tous les timeStart des activités de l'utilisateur
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const getUserActivitiesTimeStart = (functions, admin) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getUserActivitiesTimeStart start");

    const db = admin.firestore();

    const {user: {email}} = request.body;
    functions.logger.info("getUserActivitiesTimeStart email = " + email);

    try {
        
        const userRef = await db.collection('users');
        const snapshot = await userRef.doc(email).collection('activities').get();
        let activities = [];
        snapshot.forEach(async doc => {
            functions.logger.info("getUserActivitiesTimeStart timeStartActivity = " + doc.data().activityDoc.timeStartActivity);
            activities.push(doc.data().activityDoc.timeStartActivity);
        });

        return response.status(200).send({message: "OK", datas: activities});

    } catch (error) {

        functions.logger.error("getUserActivitiesTimeStart error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});   
    }

});

/**
 * 
 * Récupère une activity par rapport à son timestamp et email
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const getActivityFromTimeStart = (functions, admin, cors) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getActivityFromTimeStart start");

    const db = admin.firestore();

    let result = request.body;
    let email = result.email;
    let timestart = result.timestart;

    if (!email) {
        result = JSON.parse(result);
        email = result.email;
        timestart = result.timestart;
    }
    //const {email, timestart} = JSON.parse(request.body);
    functions.logger.info("getActivityFromTimeStart timestart = " + timestart + " - email = " + email);
    
    cors(request, response, async () => {

        try {

            const userRef = await db.collection('users');
            const activityRef = await userRef.doc(email).collection('activities').doc(timestart.toString());
            const activityDoc = await activityRef.get();

            if (activityDoc && activityDoc.exists) {

                let activity = activityDoc.data().activityDoc;

                const snapshotGeo = await userRef.doc(email).collection('activities')
                                                .doc(activity.timeStartActivity.toString()).collection('geopoint').get();

                let geopoints = [];
                snapshotGeo.forEach(docGeo => {
                    geopoints.push(docGeo.data().geopoint);
                });

                // tri par order des points géo
                geopoints.sort((a, b) => {
                
                    let comparison = 0;
                    if (a.order > b.order) {
                    comparison = 1;
                    } else if (a.order < b.order) {
                    comparison = -1;
                    }
                    return comparison;
                })

                activity.activityGeopoints = geopoints;

                return response.status(200).send({message: "OK", datas: activity});


            } else {
                functions.logger.info("getActivityFromTimeStart NOK");
                return response.status(200).send({message: "NOK"});
            }
            
        } catch (error) {
            
            functions.logger.error("getActivityFromTimeStart error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        }

    });

});

/**
 * 
 * Get all activities from an user account (email)
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

            functions.logger.info("getUserActivities activity = " + activity.activityDoc.timeStartActivity);
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
/**
 * 
 * Get all activities from an user account (email) without geopoints
 * 
 * @param {*} functions 
 * @param {*} admin 
 * @param {*} cors 
 * 
 */
const getUserActivitiesWithoutGeo = (functions, admin, cors) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getUserActivitiesWithoutGeo start");

    const db = admin.firestore();

    const {user: {email}} = JSON.parse(request.body);
    functions.logger.info("getUserActivitiesWithoutGeo email = " + email);

    cors(request, response, async () => {

        try {

            const userRef = await db.collection('users');
            const snapshot = await userRef.doc(email).collection('activities').get();
            let activities = [];
            snapshot.forEach(async doc => {
                activities.push(doc.data());
            });

            return response.status(200).send({message: "OK", datas: activities});
            
        } catch (error) {

            functions.logger.error("getUserActivitiesWithoutGeo error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        }
    });

});

module.exports = {
    saveUserActivities,
    activityExist,
    getUserActivitiesTimeStart,
    getActivityFromTimeStart,
    getUserActivities,
    getUserActivitiesWithoutGeo
}