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

// ─── Margin Calculator API ────────────────────────────────────────────────────


export interface ExpiryOption {
    value: string;
    label: string;
    strike_price: number;
}

export interface MarginLegPayload {
    exchange: string;
    segment: string;
    underlying: string;
    expiry: string;
    strike?: number;
    option_type?: string;
    quantity: number;
    action: string;
}

export interface MarginApiResponse {
    net_premium: number;
    span_margin: number;
    exposure_margin: number;
    total_margin: number;
    margin_benefit: number;
}

// export async function calculateMargin(legs: MarginLegPayload[]): Promise<MarginApiResponse> {
//     const res = await fetch(`${MARGIN_API_BASE}/api/margin/calculate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ legs }),
//     });
//     if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body.detail ?? `Margin API error (${res.status})`);
//     }
//     return res.json();
// }

// export async function fetchExpiries(exchange: string, underlying: string, segment: string): Promise<ExpiryOption[]> {
//     const params = new URLSearchParams({ exchange, underlying, segment });
//     const res = await fetch(`${MARGIN_API_BASE}/api/instruments/search?${params}`);
//     if (!res.ok) return [];
//     const data = await res.json();
//     if (segment === 'Options') {
//         const seen = new Set<string>();
//         const result: ExpiryOption[] = [];
//         for (const item of data as ExpiryOption[]) {
//             if (!seen.has(item.value)) {
//                 seen.add(item.value);
//                 result.push(item);
//             }
//         }
//         return result;
//     }
//     return data as ExpiryOption[];
// }

// export async function fetchStrikes(exchange: string, underlying: string, expiry: string): Promise<number[]> {
//     const params = new URLSearchParams({ exchange, underlying, segment: 'Options' });
//     const res = await fetch(`${MARGIN_API_BASE}/api/instruments/search?${params}`);
//     if (!res.ok) return [];
//     const data: ExpiryOption[] = await res.json();
//     return Array.from(new Set(
//         data.filter(item => item.value === expiry).map(item => item.strike_price)
//     )).sort((a, b) => a - b);
// }


// ─── VWAP Dashboard API ───────────────────────────────────────────────────────

export interface VWAPRequestPayload {
    dt_date: string;
    asset?: string;
    start_time?: string;
    end_time?: string;
    freq?: number;
    show_signals?: boolean;
    remove_duplicates?: boolean;
}

export interface VWAPDataRow {
    [key: string]: string | number | boolean | null;
}

export interface VWAPApiResponse {
    futures_data: VWAPDataRow[];
    merged_data: VWAPDataRow[];
}

export async function fetchVwapData(payload: VWAPRequestPayload): Promise<VWAPApiResponse> {
    const response = await apiClient.post(endpoint.vwapData, payload);
    return response.data;
}

// ─── Margin Calculator API ────────────────────────────────────────────────────

const MARGIN_API_BASE = import.meta.env?.VITE_MARGIN_API_BASE ?? 'http://localhost:8000';

export interface ExpiryOption {
    value: string;
    label: string;
    strike_price: number;
}

export interface MarginLegPayload {
    exchange: string;
    segment: string;
    underlying: string;
    expiry: string;
    strike?: number;
    option_type?: string;
    quantity: number;
    action: string;
}

export interface MarginApiResponse {
    net_premium: number;
    span_margin: number;
    exposure_margin: number;
    total_margin: number;
    margin_benefit: number;
}

export async function calculateMargin(legs: MarginLegPayload[]): Promise<MarginApiResponse> {
    const res = await fetch(`${MARGIN_API_BASE}/api/margin/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Margin API error (${res.status})`);
    }
    return res.json();
}

// ─── Instrument search (expiries + strikes) ───────────────────────────────────
//
// /api/instruments/search returns every (expiry, strike) row for a given
// exchange + underlying + segment in ONE response. fetchExpiries and
// fetchStrikes used to call it separately with identical params, so picking
// an underlying then opening the strike dropdown fired the same request
// twice. Both now read from a small in-memory cache keyed by
// "exchange|underlying|segment", populated on first fetch and reused for
// the rest of the session — same function signatures and return types as
// before, so nothing else in the codebase needs to change.

let instrumentCache: { key: string; data: ExpiryOption[] } | null = null;

async function getInstrumentRows(exchange: string, underlying: string, segment: string): Promise<ExpiryOption[]> {
    const key = `${exchange}|${underlying}|${segment}`;
    if (instrumentCache?.key === key) {
        return instrumentCache.data; // already fetched this combo — skip the network call
    }
    const params = new URLSearchParams({ exchange, underlying, segment });
    const res = await fetch(`${MARGIN_API_BASE}/api/instruments/search?${params}`);
    if (!res.ok) return [];
    const data: ExpiryOption[] = await res.json();
    instrumentCache = { key, data };
    return data;
}

export async function fetchExpiries(exchange: string, underlying: string, segment: string): Promise<ExpiryOption[]> {
    const data = await getInstrumentRows(exchange, underlying, segment);
    if (segment === 'Options') {
        const seen = new Set<string>();
        const result: ExpiryOption[] = [];
        for (const item of data) {
            if (!seen.has(item.value)) {
                seen.add(item.value);
                result.push(item);
            }
        }
        return result;
    }
    return data;
}

export async function fetchStrikes(exchange: string, underlying: string, expiry: string): Promise<number[]> {
    // Strikes only exist for Options, so we always read/populate the
    // Options-segment cache entry here — this is the same cache fetchExpiries
    // already filled when the user picked an underlying, so in practice this
    // call now resolves from memory with no network round trip.
    const data = await getInstrumentRows(exchange, underlying, 'Options');
    return Array.from(new Set(
        data.filter(item => item.value === expiry).map(item => item.strike_price)
    )).sort((a, b) => a - b);
}