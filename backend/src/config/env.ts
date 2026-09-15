import dotenv from "dotenv";

// Load environment variables from .env (if present) before any other module
// reads process.env. Missing values fall back to in-code defaults.
dotenv.config();
