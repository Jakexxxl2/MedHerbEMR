"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("express");
const db_js_1 = require("./config/db.js");
const routes_js_1 = require("./routes.js");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use((0, express_2.json)());
exports.app.get("/", (_req, res) => {
    res.json({
        message: "MedHerbEMR API is running",
        docs: ["/health", "/api/patients"]
    });
});
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
(0, routes_js_1.registerRoutes)(exports.app);
// Initialize DB connection on startup
void (0, db_js_1.connectToDatabase)();
