import { useState, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Trash2, CheckCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const { user, profile, updateProfileData } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile?.avatar);
  const [avatarFile, setAvatarFile] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(t('profile.uploadError'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAvatarFile(b64);
      setAvatarPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile('');
    setAvatarPreview(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updates: { name?: string; avatar?: string } = {};
      if (name !== (profile?.name || user?.displayName)) updates.name = name;
      if (avatarFile !== undefined) updates.avatar = avatarFile;
      if (Object.keys(updates).length > 0) {
        await updateProfileData(updates);
      }
      setAvatarFile(undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
    setSaving(false);
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{t('profile.edit')}</h1>
          <p className="text-slate-400">{t('profile.editDesc')}</p>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-indigo-500/30 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl shadow-xl">
                  {user?.displayName?.[0] || <User size={40} />}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg border-2 border-slate-900"
              >
                <Camera size={18} />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
              >
                {t('profile.changePhoto')}
              </button>
              {avatarPreview && (
                <button
                  onClick={removeAvatar}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all flex items-center gap-1"
                >
                  <Trash2 size={14} /> {t('profile.removePhoto')}
                </button>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-2">{t('profile.maxSize')}</p>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-slate-400 text-sm font-semibold mb-2">{t('profile.name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="block text-slate-400 text-sm font-semibold mb-2">{t('profile.email')}</label>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold">
              {user?.email}
            </div>
          </div>

          {/* Member Since */}
          <div className="mb-8">
            <label className="block text-slate-400 text-sm font-semibold mb-2">{t('profile.memberSince')}</label>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold">
              {memberSince}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle size={16} /> {t('profile.saved')}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {t('profile.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
