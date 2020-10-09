/**
 * 
 * Save (or update) activities for an user account
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const getWeatherFromCoord = functions => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getWeatherFromCoord start");

    try {
        
        const config = functions.config();
        for (const key in config.envs){
            console.log(process.env[key.toUpperCase()]);
          }

        return response.status(200).send({message: "OK"});


    } catch (error) {


        functions.logger.error("getWeatherFromCoord error : " + error.message);
        return response.status(400).send({message: "NOK", reason: error.message});
        
    }

});

module.exports = {
    getWeatherFromCoord
}