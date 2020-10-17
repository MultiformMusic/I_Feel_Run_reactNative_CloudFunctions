
/**
 * 
 * Création d'un utilisateur (email/password)
 * 
 * retour ok => 200: user email
 * retour nok => 400: err message
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const registerUser = (functions, admin) => functions.https.onRequest((request, response) => {

    functions.logger.info("registerUser start");
    
    const user = request.body.user;
    functions.logger.info("registerUser user = " + JSON.stringify(user));

  
    admin.auth().createUser({
      email: user.email,
      emailVerified: true,
      password: user.password,
      displayName: user.email,
      disabled: false,
    }).then(

        user => {
            functions.logger.info("registerUser user ok " + JSON.stringify(user));
            return response.status(200).send({message: "OK", uid: user.uid});
        } 
  
    ).catch(

        err =>  {
            functions.logger.error("registerUser user error " + JSON.stringify(err));
            return response.status(400).send({message: "NOK", reason: err.message});
        }
    )
  });


/**
 * 
 * Sign in user by email/password
 * 
 * retour ok => 200: uid
 * retour nok => 400: err message
 * 
 * @param {*} firebase 
 */
const singInUser = (functions, firebase) => functions.https.onRequest((requset, response) => {

    functions.logger.info("singInUser start");

    const {email, password} = requset.body.user;
    functions.logger.info("singInUser email/password : " + email + " / " + password);

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {

            const userDatas = user.user;
            const userResponse = {
                uid: userDatas.uid,
                displayName: userDatas.displayName,
                email: userDatas.email
            }
            functions.logger.info("singInUser ok userResponse : " + userResponse);
            return response.status(200).send(userResponse); 
        })
        .catch(error => {
            functions.logger.error("singInUser error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        });
});

/**
 * 
 * Delete user
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const deleteUser = (functions, admin) => functions.https.onRequest((requset, response) => {

    functions.logger.info("deleteUser start");

    const {uid} = requset.body.user;
    functions.logger.info("deleteUser uid : " + uid);

    admin.auth().deleteUser(uid)
              .then(res => {
                return response.status(200).send({message: "OK"}); 
              })
              .catch(error => {
                functions.logger.error("deleteUser error : " + error.message);
                return response.status(400).send({message: "NOK", reason: err.message});
            });              


});


/**
 * 
 * Reset du mot de passe : envoi un mail avec lien reset
 * 
 * @param {*} functions 
 * @param {*} firebase 
 */
const userPasswordReset = (functions, firebase) => functions.https.onRequest((requset, response) => {

    functions.logger.info("userPassworReset start");

    const {email} = requset.body.user;
    functions.logger.info("userPassworReset email : " + email);

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            return response.status(200).send({message: "OK"}); 
        })
        .catch(error => {
            functions.logger.error("userPasswordReset error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        });
});

/**
 * 
 * Mise à jour utilisateur
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const updateUser = (functions, admin) => functions.https.onRequest((requset, response) => {

    functions.logger.info("updateUser start");

    const {user} = requset.body;
    let userToUpdate = {...user};
    delete userToUpdate.uid;

    functions.logger.info("updateUser user : " + user);
    functions.logger.info("updateUser userToUpdate : " + userToUpdate);

    admin.auth().updateUser(user.uid, {...userToUpdate})
        .then(function(userRecord) {
            return response.status(200).send({message: "OK", user: userRecord}); 
        })
        .catch(function(error) {
            functions.logger.error("updateUser error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        });

});

/**
 * 
 * Creéation d'un token avec exp 30 jours pour uid
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const createCustomToken = (functions, admin, cors) => functions.https.onRequest(async (request, response) => {

    functions.logger.info("createCustomToken start");

    const {user} = JSON.parse(request.body);

    functions.logger.info("createCustomToken uid : " + user.uid);

    cors(request, response, async () => {

        try {

        const customToken = await admin.auth().createCustomToken(user.uid, {expiresAt: Date.now() + (1000 * 60 * 60 * 24 * 30)});
        return response.status(200).send({message: "OK", customToken}); 
            
        } catch (error) {
            functions.logger.error("createCustomToken error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
        }
    });
});


/**
 * 
 * Validation token user
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const validUserToken = (functions, admin) => functions.https.onRequest(async (requset, response) => {

    functions.logger.info("validUserToken start");

    const {token} = requset.body;

    functions.logger.info("validUserToken token : " + token);

    try {

        const decodedToken = await admin.auth().verifyIdToken(token);
        let uid = decodedToken.uid;

        return response.status(200).send({message: "OK", uid}); 

    } catch (error) {
        functions.logger.error("validUserToken error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
    }
});

module.exports = {
    registerUser,
    singInUser,
    deleteUser,
    userPasswordReset,
    updateUser,
    createCustomToken,
    validUserToken
}