import axios from "axios";
export const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api", withCredentials: true });
export const fmtINR = (n) => "₹" + (n || 0).toLocaleString();
export const TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "CROWN", "ACE", "CONQUEROR"];