

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
            return response.status(400).send({message: "NOK", reason: err.message});
        });
});

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

  module.exports = {
      registerUser,
      singInUser,
      deleteUser
  }