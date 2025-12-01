import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Save, Trash2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../lib/api';

export default function Settings() {
    const { user, login, updateUser } = useAuth(); // We'll use login to update user state
    const navigate = useNavigate();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name || '');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    // Sync preview image when user data updates (e.g. after successful upload)
    useEffect(() => {
        if (user?.avatar_url) {
            setPreviewImage(user.avatar_url);
        } else if (!avatarFile) {
            // Only reset if no file is currently selected (to avoid clearing preview while editing)
            setPreviewImage(null);
        }
    }, [user?.avatar_url]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setRemoveAvatar(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setPreviewImage(null);
        setRemoveAvatar(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            if (removeAvatar) {
                formData.append('remove_avatar', '1');
            }

            const response = await api.post('/profile/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local user state via context
            updateUser(response.data.user);

            showToast('Profil berhasil diperbarui', 'success');

        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gagal memperbarui profil', 'error');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Konfirmasi password tidak sesuai', 'error');
            return;
        }

        setIsLoadingPassword(true);

        try {
            await api.post('/profile/password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            showToast('Password berhasil diubah', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error.response?.data?.errors?.current_password?.[0] ||
                error.response?.data?.message ||
                'Gagal mengubah password';
            showToast(message, 'error');
        } finally {
            setIsLoadingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <h1 className="ml-2 text-lg font-bold text-gray-900">Pengaturan Akun</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        Profil Saya
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            <User className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            {previewImage && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Hapus Foto
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nama Lengkap"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoadingProfile}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 transition-all"
                            >
                                {isLoadingProfile ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Profil
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-blue-600" />
                        Ganti Password
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password Lama
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Masukkan password lama"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Minimal 8 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoadingPassword}
                                className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 transition-all"
                            >
                                {isLoadingPassword ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
