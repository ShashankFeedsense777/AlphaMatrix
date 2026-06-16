import { apiClient } from "./apiClients";
import { endpoint } from "./endpoint";

export async function requestLoginOtpAPI(emailOrPhone: string, type: 'email' | 'phone') {
    try {
        const response = await apiClient.post(endpoint.requestOtp, { emailOrPhone, type });
        return response.data;
    } catch (error: any) {
        console.error(error);
        const message = error?.response?.data?.detail || 'Failed to send OTP.';
        return { status: error?.response?.status || 500, message };
    }
}

export async function validateLoginOtpAPI(emailOrPhone: string, otp: string, type: 'email' | 'phone') {
    try {
        const response = await apiClient.post(endpoint.validateOtp, { emailOrPhone, otp, type });
        return response.data;
    } catch (error: any) {
        console.error(error);
        const message = error?.response?.data?.detail || 'OTP validation failed.';
        return { status: error?.response?.status || 500, message };
    }
}
