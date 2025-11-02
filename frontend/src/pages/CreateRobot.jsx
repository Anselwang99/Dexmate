import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { robotAPI, groupAPI } from "../services/api";

export default function CreateRobot() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        serialNumber: "",
        name: "",
        ownerType: "USER",
        ownerId: "",
    });
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getGroups();
            setGroups(
                res.data.filter((g) =>
                    g.members.some((m) => m.role === "ADMIN")
                )
            );
        } catch (err) {
            console.error("Failed to load groups:", err);
            setError("Failed to load groups. Please try refreshing the page.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                serialNumber: formData.serialNumber.trim(),
                name: formData.name.trim(),
                ownerType: formData.ownerType,
            };

            if (formData.ownerType === "GROUP" && formData.ownerId) {
                payload.ownerId = formData.ownerId;
            }

            await robotAPI.createRobot(payload);
            navigate("/dashboard");
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to create robot";
            setError(errorMessage);
            console.error("Create robot error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-8">
                <div>
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
                        Create New Robot
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl bg-white rounded-lg shadow-md p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">
                            Serial Number *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g., SN-2024-001"
                                value={formData.serialNumber}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        serialNumber: e.target.value,
                                    })
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const uuid =
                                        `SN-${Date.now()}-${Math.random()
                                            .toString(36)
                                            .substr(2, 6)}`.toUpperCase();
                                    setFormData({
                                        ...formData,
                                        serialNumber: uuid,
                                    });
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Generate S/N
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-500">
                                Unique identifier for this robot
                            </p>
                            <p className="text-xs text-gray-400">
                                You can enter your own S/N or generate one
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">
                            Robot Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Warehouse Bot Alpha"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold">
                            Owner Type *
                        </label>
                        <select
                            value={formData.ownerType}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    ownerType: e.target.value,
                                    ownerId: "",
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="USER">Personal (owned by me)</option>
                            <option value="GROUP">
                                Group (owned by a group)
                            </option>
                        </select>
                    </div>

                    {formData.ownerType === "GROUP" && (
                        <div>
                            <label className="block text-gray-700 mb-2 font-semibold">
                                Select Group *
                            </label>
                            <select
                                value={formData.ownerId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ownerId: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Select a group --</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            {groups.length === 0 && (
                                <p className="text-sm text-amber-600 mt-1">
                                    You need to be an admin of a group to create
                                    group-owned robots
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                (formData.ownerType === "GROUP" &&
                                    !formData.ownerId)
                            }
                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-semibold"
                        >
                            {loading ? "Creating..." : "Create Robot"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
