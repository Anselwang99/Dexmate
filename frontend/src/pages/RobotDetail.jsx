import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function RobotDetail() {
    const { serialNumber } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [robot, setRobot] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [newPermission, setNewPermission] = useState({
        email: "",
        type: "USAGE",
    });

    useEffect(() => {
        fetchRobotData();
    }, [serialNumber]);

    const fetchRobotData = async () => {
        try {
            setLoading(true);
            setError("");
            console.log("Fetching robot data for:", serialNumber);

            const [robotRes, settingsRes] = await Promise.all([
                api.get(`/robots/${serialNumber}`),
                api.get(`/settings/${serialNumber}`).catch((err) => {
                    console.log("Settings fetch error (non-critical):", err);
                    return { data: { settings: {} } };
                }),
            ]);

            console.log("Robot data received:", robotRes.data);
            console.log("Settings data received:", settingsRes.data);

            setRobot(robotRes.data);
            setSettings(settingsRes.data.settings || {});
        } catch (err) {
            console.error("Error fetching robot data:", err);
            setError(err.response?.data?.error || "Failed to load robot data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setError("");
            await api.post(`/settings/${serialNumber}`, { settings });
            setSuccess("Settings saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleGrantPermission = async (e) => {
        e.preventDefault();
        try {
            setError("");
            await api.post(`/robots/${serialNumber}/permissions`, {
                email: newPermission.email,
                permissionType: newPermission.type,
            });

            setSuccess("Permission granted successfully!");
            setNewPermission({ email: "", type: "USAGE" });
            fetchRobotData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to grant permission");
        }
    };

    const handleRevokePermission = async (userId) => {
        if (!confirm("Are you sure you want to revoke this permission?"))
            return;

        try {
            setError("");
            await api.delete(`/robots/${serialNumber}/permissions/${userId}`);

            // If revoking own permission, redirect to dashboard
            if (userId === user?.id) {
                setSuccess("Permission revoked successfully! Redirecting...");
                setTimeout(() => navigate("/dashboard"), 2000);
            } else {
                setSuccess("Permission revoked successfully!");
                fetchRobotData();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            setError(
                err.response?.data?.error || "Failed to revoke permission"
            );
        }
    };

    const handleDeleteRobot = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this robot? This action cannot be undone and will remove the robot for all users."
            )
        )
            return;

        try {
            setError("");
            await api.delete(`/robots/${serialNumber}`);
            setSuccess("Robot deleted successfully! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete robot");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!robot) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Robot not found</div>
            </div>
        );
    }

    const isAdmin = robot.userPermission === "ADMIN";

    // Check if user is a group admin for group-owned robots
    const isGroupAdmin =
        robot.ownerType === "GROUP" &&
        robot.ownerInfo?.members?.some(
            (member) => member.userId === user?.id && member.role === "ADMIN"
        );

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    Robot Detail
                </h1>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold mb-4">{robot.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-gray-600">Serial Number</p>
                        <p className="font-semibold text-lg">
                            {robot.serialNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-600">Owner Type</p>
                        <p className="font-semibold">{robot.ownerType}</p>
                    </div>

                    <div>
                        <p className="text-gray-600">Owner</p>
                        <p className="font-semibold">
                            {robot.ownerType === "USER"
                                ? robot.ownerInfo?.name ||
                                  robot.ownerInfo?.email ||
                                  "Unknown"
                                : robot.ownerInfo?.name || "Unknown Group"}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-600">Your Permission</p>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                robot.userPermission === "ADMIN"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            {robot.userPermission || "OWNER"}
                        </span>
                    </div>
                </div>

                {/* Delete Button - Only for Owners */}
                {((robot.ownerType === "USER" && robot.ownerId === user?.id) ||
                    (robot.ownerType === "GROUP" && isGroupAdmin)) && (
                    <div className="border-t pt-4 mt-4">
                        <button
                            onClick={handleDeleteRobot}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            Delete Robot
                        </button>
                    </div>
                )}
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">
                    Your Personal Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">
                            Theme
                        </label>
                        <select
                            value={settings.theme || "light"}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    theme: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">
                            Language
                        </label>
                        <select
                            value={settings.language || "en"}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    language: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="zh">Chinese</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">
                            Speed
                        </label>
                        <select
                            value={settings.speed || "medium"}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    speed: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="slow">Slow</option>
                            <option value="medium">Medium</option>
                            <option value="fast">Fast</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notifications"
                            checked={settings.notifications || false}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    notifications: e.target.checked,
                                })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="notifications"
                            className="ml-2 text-gray-700"
                        >
                            Enable Notifications
                        </label>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Permission Management - Only for Admins */}
            {isAdmin && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Permission Management
                    </h2>

                    <form onSubmit={handleGrantPermission} className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <input
                                    type="email"
                                    placeholder="User email"
                                    value={newPermission.email}
                                    onChange={(e) =>
                                        setNewPermission({
                                            ...newPermission,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <select
                                    value={newPermission.type}
                                    onChange={(e) =>
                                        setNewPermission({
                                            ...newPermission,
                                            type: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="USAGE">Usage</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                            >
                                Grant Permission
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg mb-2">
                            Current Permissions
                        </h3>
                        {robot.permissions && robot.permissions.length > 0 ? (
                            robot.permissions.map((perm) => (
                                <div
                                    key={perm.userId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {perm.user.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {perm.user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                perm.permissionType === "ADMIN"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {perm.permissionType}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleRevokePermission(
                                                    perm.userId
                                                )
                                            }
                                            className="text-red-600 hover:text-red-800 font-semibold"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">
                                No permissions granted yet
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
