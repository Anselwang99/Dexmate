import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
    useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RobotDetail from "./pages/RobotDetail";
import CreateRobot from "./pages/CreateRobot";
import Groups from "./pages/Groups";
import "./App.css";

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/dashboard") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                to="/dashboard"
                                className="text-2xl font-bold text-blue-600"
                            >
                                Dexmate
                            </Link>
                            <div className="ml-10 flex items-center space-x-4">
                                <Link
                                    to="/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive("/dashboard")
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/groups"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive("/groups")
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Groups
                                </Link>
                                <Link
                                    to="/robots/create"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive("/robots/create")
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                >
                                    Create Robot
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{user.name}</span>
                            <button
                                onClick={logout}
                                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/robots/create"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <CreateRobot />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/robots/:serialNumber"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <RobotDetail />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/groups"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Groups />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
