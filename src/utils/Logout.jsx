import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
export default function LogoutButton() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        toast.success("Logout successful");
        navigate("/");
    };
    return (
        <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-rose-800 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
        >
            Logout
        </button>
    );
}