require("dotenv").config();
const pool = require("./db");
const http = require("http");
const { Server } = require("socket.io");
const analyticsRoutes =
    require("./routes/analyticsRoutes");
const {
    initializeSocket
} = require("./services/socketService");
const express = require("express");
const experimentRoutes =
    require("./routes/experimentRoutes");
const cors = require("cors");
const dashboardRoutes =
    require("./routes/dashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const transactionRoutes =
    require("./routes/transactionRoutes");
    const strategyRoutes =
    require("./routes/strategyRoutes");
require("./events/recoveryListener");
const recoverAIRoutes =
    require("./routes/recoverAIRoutes");
const app = express();
const humanReviewRoutes =
    require("./routes/humanReviewRoutes");
    const reviewRoutes =
    require("./routes/reviewRoutes");
const httpServer =
    http.createServer(app);

const io = new Server(
    httpServer,
    {
        cors: {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174"
    ]
}
    }
);

io.on("connection", (socket) => {

    console.log(
        "Frontend connected:",
        socket.id
    );

    socket.on("disconnect", () => {

        console.log(
            "Frontend disconnected:",
            socket.id
        );

    });

});

initializeSocket(io);
app.use(cors());
app.get("/", (req, res) => {

    res.json({
        message:
            "RecoverAI API is running 🚀"
    });

});
app.use(express.json());
app.use(
    "/api/dashboard",
    dashboardRoutes
);
app.use(
    "/api/strategies",
    strategyRoutes
);
app.use(
    "/api/reviews",
    reviewRoutes
);
app.use(
    "/api/human-reviews",
    humanReviewRoutes
);
app.use(
    "/api/experiment",
    experimentRoutes
);
app.use(
    "/api/recover",
    recoverAIRoutes
);
app.use(
    "/api/analytics",
    analyticsRoutes
);
app.use(
    "/api/transactions",
    transactionRoutes
);
app.get("/", (req, res) => {

    res.json({
        message:
            "RecoverAI API is running 🚀"
    });

});


app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/analyze",
    analysisRoutes
);
app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({
            status: "ok",
            service: "RecoverAI",
            database: "connected",
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        res.status(503).json({
            status: "error",
            database: "disconnected"
        });

    }

});
app.use(
    "/api/recovery",
    recoveryRoutes
);


const PORT =
    process.env.PORT || 5000;


httpServer.listen(
    PORT,
    () => {

        console.log(
            `RecoverAI server running on port ${PORT}`
        );

    }
);