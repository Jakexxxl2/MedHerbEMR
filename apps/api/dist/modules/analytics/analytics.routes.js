"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_js_1 = require("./analytics.controller.js");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.get("/", analytics_controller_js_1.handleGetAnalytics);
