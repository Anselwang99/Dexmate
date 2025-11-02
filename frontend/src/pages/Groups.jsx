import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Groups() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("MEMBER");
    const [showAssignRobot, setShowAssignRobot] = useState(null);
    const [selectedRobot, setSelectedRobot] = useState("");
    const [selectedMember, setSelectedMember] = useState("");
    const [permissionType, setPermissionType] = useState("USAGE");

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await api.get("/groups");

            // Fetch permissions for each group's robots
            const groupsWithPermissions = await Promise.all(
                res.data.map(async (group) => {
                    if (group.robots && group.robots.length > 0) {
                        const robotsWithPerms = await Promise.all(
                            group.robots.map(async (robot) => {
                                try {
                                    const robotDetail = await api.get(
                                        `/robots/${robot.serialNumber}`
                                    );
                                    return {
                                        ...robot,
                                        permissions:
                                            robotDetail.data.permissions || [],
                                    };
                                } catch (err) {
                                    return { ...robot, permissions: [] };
                                }
                            })
                        );
                        return { ...group, robots: robotsWithPerms };
                    }
                    return group;
                })
            );

            setGroups(groupsWithPermissions);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            setError("");
            await api.post("/groups", { name: newGroupName });
            setSuccess("Group created successfully!");
            setNewGroupName("");
            setShowCreateGroup(false);
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create group");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;

        try {
            setError("");
            await api.post(`/groups/${selectedGroup.id}/members`, {
                email: newMemberEmail,
                role: newMemberRole,
            });
            setSuccess("Member added successfully!");
            setNewMemberEmail("");
            setNewMemberRole("MEMBER");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add member");
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            setError("");
            await api.delete(`/groups/${groupId}/members/${userId}`);
            setSuccess("Member removed successfully!");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to remove member");
        }
    };

    const handleUpdateRole = async (groupId, userId, newRole) => {
        try {
            setError("");
            await api.patch(`/groups/${groupId}/members/${userId}/role`, {
                role: newRole,
            });
            setSuccess("Role updated successfully!");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update role");
        }
    };

    const handleAssignRobot = async (
        robotSerialNumber,
        memberUserId,
        permType
    ) => {
        try {
            setError("");
            await api.post(`/robots/${robotSerialNumber}/permissions`, {
                userId: memberUserId,
                permissionType: permType,
            });
            setSuccess("Robot assigned to member successfully!");
            setShowAssignRobot(null);
            setSelectedRobot("");
            setSelectedMember("");
            setPermissionType("USAGE");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to assign robot");
        }
    };

    const handleRemoveAssignment = async (robotSerialNumber, userId) => {
        if (
            !confirm(
                "Are you sure you want to remove this robot assignment? The user will lose access to this robot."
            )
        )
            return;

        try {
            setError("");
            await api.delete(
                `/robots/${robotSerialNumber}/permissions/${userId}`
            );
            setSuccess("Robot assignment removed successfully!");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(
                err.response?.data?.error || "Failed to remove assignment"
            );
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (
            !confirm(
                "Are you sure you want to delete this group? This will also delete all group robots and cannot be undone."
            )
        )
            return;

        try {
            setError("");
            await api.delete(`/groups/${groupId}`);
            setSuccess("Group deleted successfully!");
            fetchGroups();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete group");
        }
    };

    const isGroupAdmin = (group) => {
        return group.members.some(
            (m) => m.userId === user?.id && m.role === "ADMIN"
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
                </div>
                <button
                    onClick={() => setShowCreateGroup(!showCreateGroup)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Create Group
                </button>
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

            {showCreateGroup && (
                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                    <form onSubmit={handleCreateGroup}>
                        <input
                            type="text"
                            placeholder="Group name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                            required
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateGroup(false)}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {group.name}
                                </h2>
                                <p className="text-gray-600">
                                    {group.members.length} member
                                    {group.members.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isGroupAdmin(group) && (
                                    <>
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                            Admin
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleDeleteGroup(group.id)
                                            }
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                                            title="Delete group"
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
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">
                                Members
                            </h3>
                            <div className="space-y-2">
                                {group.members.map((member) => (
                                    <div
                                        key={member.userId}
                                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">
                                                {member.user.name}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {member.user.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {isGroupAdmin(group) &&
                                            member.userId !== user?.id ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) =>
                                                        handleUpdateRole(
                                                            group.id,
                                                            member.userId,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-3 pr-8 py-1 border border-gray-300 rounded-lg text-sm"
                                                >
                                                    <option value="MEMBER">
                                                        Member
                                                    </option>
                                                    <option value="ADMIN">
                                                        Admin
                                                    </option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                                                        member.role === "ADMIN"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {member.role}
                                                </span>
                                            )}
                                            {isGroupAdmin(group) &&
                                                member.userId !== user?.id && (
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                group.id,
                                                                member.userId
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800 font-semibold text-sm whitespace-nowrap"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isGroupAdmin(group) && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">
                                    Add Member
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setSelectedGroup(group);
                                        handleAddMember(e);
                                    }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                                >
                                    <input
                                        type="email"
                                        placeholder="Member email"
                                        value={
                                            selectedGroup?.id === group.id
                                                ? newMemberEmail
                                                : ""
                                        }
                                        onChange={(e) => {
                                            setSelectedGroup(group);
                                            setNewMemberEmail(e.target.value);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <select
                                        value={
                                            selectedGroup?.id === group.id
                                                ? newMemberRole
                                                : "MEMBER"
                                        }
                                        onChange={(e) => {
                                            setSelectedGroup(group);
                                            setNewMemberRole(e.target.value);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                        )}

                        {group.robots && group.robots.length > 0 && (
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-2">
                                    Group Robots
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {group.robots.map((robot) => (
                                        <div
                                            key={robot.id}
                                            onClick={() =>
                                                navigate(
                                                    `/robots/${robot.serialNumber}`
                                                )
                                            }
                                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                                        >
                                            <p className="font-semibold">
                                                {robot.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {robot.serialNumber}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Assign Robot to Member Section */}
                        {isGroupAdmin(group) &&
                            group.robots &&
                            group.robots.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">
                                            Assign Robot to Member
                                        </h3>
                                        {showAssignRobot !== group.id && (
                                            <button
                                                onClick={() =>
                                                    setShowAssignRobot(group.id)
                                                }
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                + Assign Robot
                                            </button>
                                        )}
                                    </div>

                                    {showAssignRobot === group.id && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleAssignRobot(
                                                        selectedRobot,
                                                        selectedMember,
                                                        permissionType
                                                    );
                                                }}
                                                className="space-y-3"
                                            >
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Select Robot
                                                    </label>
                                                    <select
                                                        value={selectedRobot}
                                                        onChange={(e) =>
                                                            setSelectedRobot(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">
                                                            Choose a robot...
                                                        </option>
                                                        {group.robots.map(
                                                            (robot) => (
                                                                <option
                                                                    key={
                                                                        robot.id
                                                                    }
                                                                    value={
                                                                        robot.serialNumber
                                                                    }
                                                                >
                                                                    {robot.name}{" "}
                                                                    (
                                                                    {
                                                                        robot.serialNumber
                                                                    }
                                                                    )
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Select Member
                                                    </label>
                                                    <select
                                                        value={selectedMember}
                                                        onChange={(e) =>
                                                            setSelectedMember(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">
                                                            Choose a member...
                                                        </option>
                                                        {group.members
                                                            .filter(
                                                                (m) =>
                                                                    m.userId !==
                                                                    user?.id
                                                            )
                                                            .map((member) => (
                                                                <option
                                                                    key={
                                                                        member.userId
                                                                    }
                                                                    value={
                                                                        member.userId
                                                                    }
                                                                >
                                                                    {
                                                                        member
                                                                            .user
                                                                            .name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        member
                                                                            .user
                                                                            .email
                                                                    }
                                                                    )
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Permission Type
                                                    </label>
                                                    <select
                                                        value={permissionType}
                                                        onChange={(e) =>
                                                            setPermissionType(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="USAGE">
                                                            Usage Only
                                                        </option>
                                                        <option value="ADMIN">
                                                            Admin (Can manage
                                                            permissions)
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Assign Robot
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowAssignRobot(
                                                                null
                                                            );
                                                            setSelectedRobot(
                                                                ""
                                                            );
                                                            setSelectedMember(
                                                                ""
                                                            );
                                                            setPermissionType(
                                                                "USAGE"
                                                            );
                                                        }}
                                                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* Robot-Member Assignment Matrix (Admin Only) */}
                        {isGroupAdmin(group) &&
                            group.robots &&
                            group.robots.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Robot Assignments Overview
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Robot
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Assigned Members
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {group.robots.map((robot) => (
                                                    <tr key={robot.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div>
                                                                <p className="font-semibold text-sm">
                                                                    {robot.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        robot.serialNumber
                                                                    }
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {robot.permissions &&
                                                            robot.permissions
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {robot.permissions.map(
                                                                        (
                                                                            perm
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    perm.userId
                                                                                }
                                                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                    perm.permissionType ===
                                                                                    "ADMIN"
                                                                                        ? "bg-purple-100 text-purple-800"
                                                                                        : "bg-green-100 text-green-800"
                                                                                }`}
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        perm
                                                                                            .user
                                                                                            .name
                                                                                    }{" "}
                                                                                    (
                                                                                    {
                                                                                        perm.permissionType
                                                                                    }

                                                                                    )
                                                                                </span>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleRemoveAssignment(
                                                                                            robot.serialNumber,
                                                                                            perm.userId
                                                                                        )
                                                                                    }
                                                                                    className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                                                                    title="Remove assignment"
                                                                                >
                                                                                    <svg
                                                                                        className="w-3 h-3"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth="2"
                                                                                            d="M6 18L18 6M6 6l12 12"
                                                                                        />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 italic">
                                                                    Not assigned
                                                                    yet
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        {/* My Assigned Robots (Member View) */}
                        {!isGroupAdmin(group) &&
                            group.robots &&
                            group.robots.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold text-lg mb-3">
                                        My Assigned Robots
                                    </h3>
                                    {(() => {
                                        const myRobots = group.robots.filter(
                                            (robot) =>
                                                robot.permissions &&
                                                robot.permissions.some(
                                                    (p) => p.userId === user?.id
                                                )
                                        );
                                        return myRobots.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {myRobots.map((robot) => {
                                                    const myPermission =
                                                        robot.permissions.find(
                                                            (p) =>
                                                                p.userId ===
                                                                user?.id
                                                        );
                                                    return (
                                                        <div
                                                            key={robot.id}
                                                            onClick={() =>
                                                                navigate(
                                                                    `/robots/${robot.serialNumber}`
                                                                )
                                                            }
                                                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition border border-blue-200"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-semibold text-lg">
                                                                        {
                                                                            robot.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        S/N:{" "}
                                                                        {
                                                                            robot.serialNumber
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                        myPermission?.permissionType ===
                                                                        "ADMIN"
                                                                            ? "bg-purple-100 text-purple-800"
                                                                            : "bg-green-100 text-green-800"
                                                                    }`}
                                                                >
                                                                    {myPermission?.permissionType ||
                                                                        "USAGE"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    No robots assigned to you
                                                    yet
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Ask your group admin to
                                                    assign robots to you
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-xl">No groups yet</p>
                        <p className="mt-2">
                            Create your first group to get started!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
