import { apiClient } from "./apiClients";
import { endpoint } from "./endpoint";

export async function loginAPI(username: string, password: string) {
    try {
        if(username == "admin" && password == "admin") {
            return {status:200,data:true};
        }
        return {status:401,data:false};
        const response = await apiClient.post(endpoint.login, {username, password});
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

// export async function requestLoginOtpAPI(mobile: string) {
//     return await apiClient.post(endpoint.requestLoginOtp, {mobile});
// }

// export async function validateMobileOtpAPI(mobile: string, otp: string) {
//     return await apiClient.post(endpoint.validateMobileOtp, {mobile, otp});
// }