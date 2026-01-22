"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
let isConnected = false;
async function connectToDatabase() {
    if (isConnected)
        return;
    try {
        await mongoose_1.default.connect(env_js_1.env.mongoUri);
        isConnected = true;
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}
