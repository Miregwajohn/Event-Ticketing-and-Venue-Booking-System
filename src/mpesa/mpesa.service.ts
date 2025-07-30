import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const {
  DARAJA_CONSUMER_KEY,
  DARAJA_CONSUMER_SECRET,
  DARAJA_SHORT_CODE,
  DARAJA_PASSKEY,
  DARAJA_CALLBACK_URL,
} = process.env;

if (
  !DARAJA_CONSUMER_KEY ||
  !DARAJA_CONSUMER_SECRET ||
  !DARAJA_SHORT_CODE ||
  !DARAJA_PASSKEY ||
  !DARAJA_CALLBACK_URL
) {
  throw new Error(" Missing required Daraja environment variables.");
}

// Format Timestamp → YYYYMMDDHHmmss
const generateTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
};

//  Format Phone to 254XXXXXXXXX
const formatPhoneNumber = (phone: string): string =>
  phone.startsWith("254") ? phone : phone.replace(/^0/, "254");

//  Step 1: Get Access Token from Safaricom
export const getAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${credentials}` },
      }
    );
    console.log(" Daraja Access Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error: any) {
    console.error(" Failed to get access token:", error.response?.data || error.message);
    throw new Error("Failed to generate M-Pesa access token.");
  }
};

// Step 2: Initiate STK Push
export const initiateSTKPush = async (
  phone: string,
  amount: number,
  accountReference?: string,
  transactionDesc?: string
): Promise<{
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}> => {
  const accessToken = await getAccessToken();
  const timestamp = generateTimestamp();

  const password = Buffer.from(`${DARAJA_SHORT_CODE}${DARAJA_PASSKEY}${timestamp}`).toString("base64");
  const formattedPhone = formatPhoneNumber(phone);

  // Auto-fallback logic for optional parameters
  const fallbackAccountRef = `booking-${Date.now()}`;
  const fallbackDesc = `Payment for ${formattedPhone}`;

  const payload = {
    BusinessShortCode: DARAJA_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: DARAJA_SHORT_CODE,
    PhoneNumber: formattedPhone,
    CallBackURL: DARAJA_CALLBACK_URL,
    AccountReference: accountReference || fallbackAccountRef,
    TransactionDesc: transactionDesc || fallbackDesc,
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    console.log(" STK Push Request Sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(" STK Push Failed:", error.response?.data || error.message);
    throw new Error("Failed to initiate M-Pesa STK Push.");
  }
};
