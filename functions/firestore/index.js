
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
        let userFirestore = await userRef.doc(email);
        await userFirestore.set({datas},  { merge: true });

        return response.status(200).send({message: "OK"});
        
    } catch (error) {

        functions.logger.error("saveUserActivities error : " + error.message);
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

        const userRef = db.collection('users');
        const userDatas = await userRef.doc(email).get();

        return response.status(200).send({message: "OK", datas: userDatas.data()});
        
    } catch (error) {

        functions.logger.error("getUserActivities error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
    }

});

module.exports = {
    saveUserActivities,
    getUserActivities
}