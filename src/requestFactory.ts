import axiosCookieJarSupport from 'axios-cookiejar-support';
import tough from 'tough-cookie';
import axios, { AxiosRequestConfig } from 'axios';

function requestFactory(config: AxiosRequestConfig){
    axiosCookieJarSupport(axios);
    return axios.create({
        jar: new tough.CookieJar(),
        withCredentials: true,
        ...config
    });
}

export default requestFactory;