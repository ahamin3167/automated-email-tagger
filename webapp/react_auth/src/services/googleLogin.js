import axios from "axios";

/**
 * 
 * @param {*} accesstoken This is the accesstoken of the user obtained from Google
 */
const googleLogin = async (accesstoken) => {
    let res = null;
    try{
      res = await axios.post(
        "http://localhost:8000/rest-auth/google/",
        {
          access_token: accesstoken,
        }
      );
      console.log(res);
      return await res.status;
    } catch(error) {
      console.log(error.response);
    }
  };

export default googleLogin;