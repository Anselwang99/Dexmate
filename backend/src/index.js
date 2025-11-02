import "dotenv/config";
import { createApp } from "./app.js";
import checkAndSeed from "./startup.js";

const app = createApp();
const PORT = process.env.PORT || 3001;

// Auto-seed database if empty on startup
checkAndSeed().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
