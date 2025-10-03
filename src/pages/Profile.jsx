import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { 
    User, 
    MapPin, 
    Edit, 
    Save, 
    X, 
    Trash2, 
    Shield,
    AlertTriangle,
    CheckCircle,
    Mail,
    Calendar
} from "lucide-react";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        full_name: "",
        location: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, location, email, points, created_at, is_admin")
                .eq("id", user.id)
                .single();

            if (error) throw error;

            setProfile(data);
            setFormData({
                full_name: data.full_name || "",
                location: data.location || ""
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            setError("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!formData.full_name.trim()) {
            setError("Full name is required");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name.trim(),
                    location: formData.location.trim()
                })
                .eq("id", profile.id);

            if (error) throw error;

            setProfile(prev => ({
                ...prev,
                full_name: formData.full_name.trim(),
                location: formData.location.trim()
            }));
            setEditing(false);
            setSuccess("Profile updated successfully!");
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteAccount() {
        setSaving(true);
        setError("");

        try {
            // First, delete the user's profile
            const { error: profileError } = await supabase
                .from("profiles")
                .delete()
                .eq("id", profile.id);

            if (profileError) throw profileError;

            // Then, sign out and delete the auth user
            await supabase.auth.signOut();
            
            const { error: authError } = await supabase.auth.admin.deleteUser(
                profile.id
            );

            if (authError) {
                console.warn("Profile deleted but auth user deletion failed:", authError);
            }

            navigate("/");
        } catch (error) {
            console.error("Error deleting account:", error);
            setError("Failed to delete account. Please contact support.");
            setSaving(false);
            setShowDeleteConfirm(false);
        }
    }

    function handleCancelEdit() {
        setFormData({
            full_name: profile.full_name || "",
            location: profile.location || ""
        });
        setEditing(false);
        setError("");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="p-6 max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            {/* Main Content */}
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <span className="text-green-700 font-medium">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                    <User size={24} className="text-blue-600" />
                                    <span>Personal Information</span>
                                </h2>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Save size={16} />
                                            <span>{saving ? "Saving..." : "Save"}</span>
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Full Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your full name"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 text-gray-900 bg-gray-50 rounded-xl">
                                            {profile.full_name || "Not set"}
                                        </p>
                                    )}
                                </div>

                                {/* Location Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                                        <MapPin size={16} />
                                        <span>Address</span>
                                    </label>
                                    {editing ? (
                                        <textarea
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            placeholder="Enter your complete address for waste collection"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 text-gray-900 bg-gray-50 rounded-xl whitespace-pre-wrap">
                                            {profile.location || "Not set"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                                <Shield size={24} className="text-green-600" />
                                <span>Account Information</span>
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <Mail size={18} className="text-gray-400" />
                                        <span className="text-gray-600">Email Address</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">{profile.email}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <User size={18} className="text-gray-400" />
                                        <span className="text-gray-600">Account Type</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        profile.is_admin 
                                            ? "bg-purple-100 text-purple-800" 
                                            : "bg-blue-100 text-blue-800"
                                    }`}>
                                        {profile.is_admin ? "Administrator" : "Resident"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span className="text-gray-600">Member Since</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">
                                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">★</span>
                                        </div>
                                        <span className="text-gray-600">Current Points</span>
                                    </div>
                                    <span className="text-yellow-600 font-bold text-lg">
                                        {profile.points || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Points Summary Card */}
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">{profile.points || 0}</div>
                                <div className="text-yellow-100 text-sm">Total Points</div>
                                <div className="text-yellow-200 text-xs mt-2">
                                    Earn more points through proper waste segregation
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
                            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center space-x-2">
                                <AlertTriangle size={20} />
                                <span>Danger Zone</span>
                            </h3>
                            
                            <p className="text-red-600 text-sm mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={saving}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 size={16} />
                                <span>Delete Account</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                                <p className="text-red-600 text-sm">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your account? All your data, including points and collection history, will be permanently removed from our systems.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Trash2 size={16} />
                                <span>{saving ? "Deleting..." : "Delete Account"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}