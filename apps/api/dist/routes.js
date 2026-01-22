"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const patient_routes_js_1 = require("./modules/patients/patient.routes.js");
const visit_routes_js_1 = require("./modules/visits/visit.routes.js");
const analytics_routes_js_1 = require("./modules/analytics/analytics.routes.js");
function registerRoutes(app) {
    app.use("/api/patients", patient_routes_js_1.patientRouter);
    app.use("/api/visits", visit_routes_js_1.visitRouter);
    app.use("/api/analytics", analytics_routes_js_1.analyticsRouter);
}
