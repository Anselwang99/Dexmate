import { Link } from "react-router-dom";

const getPermissionBadge = (permission) => {
    if (permission === "ADMIN") {
        return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                Admin
            </span>
        );
    }
    return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Usage
        </span>
    );
};

const getOwnershipBadge = (robot) => {
    if (robot.ownerType === "USER") {
        return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Personal
            </span>
        );
    }
    return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
            Group: {robot.groupOwner?.name}
        </span>
    );
};

export default function RobotList({ robots, isLoading, error }) {
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (robots.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
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
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No robots
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new robot.
                </p>
                <div className="mt-6">
                    <Link
                        to="/robots/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Create Robot
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {robots.map((robot) => (
                    <li key={robot.id}>
                        <Link
                            to={`/robots/${robot.serialNumber}`}
                            className="block hover:bg-gray-50"
                        >
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-blue-600 truncate">
                                            {robot.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            S/N: {robot.serialNumber}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {getOwnershipBadge(robot)}
                                        {getPermissionBadge(
                                            robot.userPermission
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
