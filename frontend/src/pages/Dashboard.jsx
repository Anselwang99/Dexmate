import { useState, useEffect } from "react";
import { robotAPI } from "../services/api";
import RobotList from "../components/RobotList";

export default function Dashboard() {
    const [robots, setRobots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRobots();
    }, []);

    const loadRobots = async () => {
        try {
            const res = await robotAPI.getRobots();
            setRobots(res.data);
        } catch (err) {
            setError("Failed to load robots");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Robots</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your personal and group robots
                </p>
            </div>

            <RobotList robots={robots} isLoading={loading} error={error} />
        </div>
    );
}
