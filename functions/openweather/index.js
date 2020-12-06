
const constants = require('../constants');
const axios = require('axios');

/**
 * 
 * Save (or update) activities for an user account
 * 
 * @param {*} functions 
 * @param {*} admin 
 */
const getWeatherFromCoord = (functions, cors) => functions.https.onRequest( async (request, response) => {

    functions.logger.info("getWeatherFromCoord start");

    const {lang, lat, lon} = request.body;

    cors(request, response, async () => {
        
        try {
            
            let url = constants.constants.openweather_url + constants.constants.openweather_key
            url += "&lat=" + lat + "&lon=" + lon;
            if (lang) {
                url += "&lang=" + lang;
                url += "&units=" + 'metric';
            }
            let weather = await axios.get(url);


            /*const config = functions.config();
            for (const key in config.envs){
                console.log(process.env[key.toUpperCase()]);
              }*/
    
            return response.status(200).send({
                message: "OK", 
                datas: {
                    ...weather.data.weather[0], 
                    temp: weather.data.main.temp,
                    humidity: weather.data.main.humidity,
                    windSpeed: weather.data.wind.speed,
                    windDeg: weather.data.wind.deg,
                    windGust: weather.data.wind.gust
                }
            });
    
    
        } catch (error) {
    
    
            functions.logger.error("getWeatherFromCoord error : " + error.message);
            return response.status(400).send({message: "NOK", reason: error.message});
            
        }
    });

});

module.exports = {
    getWeatherFromCoord
}