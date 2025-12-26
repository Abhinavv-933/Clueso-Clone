import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        const PORT = env.PORT || 8000;

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
