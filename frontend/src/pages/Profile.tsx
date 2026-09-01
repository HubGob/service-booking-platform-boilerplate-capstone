import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import './Profile.css';

const Profile = (): JSX.Element => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState<boolean>(false);

  const updateProfile = async (fields: Partial<User>): Promise<void> => {
    setLoading(true);
    try {
      setProfile(prev => prev ? { ...prev, ...fields } : prev);
      alert('Profile updated (local only — add PUT /api/users endpoint for server-side)');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Header />
      <h1>Profile</h1>
      <div className="profile-card">
        <img src={profile?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (profile?.name || 'U')} alt="Avatar" className="profile-avatar" />
        <div className="profile-fields">
          <div className="field"><label>Name</label><input value={profile?.name || ''} onChange={e => updateProfile({ name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input value={profile?.email || ''} disabled /></div>
          {profile?.role === 'provider' && (
            <>
              <div className="field"><label>Specialty</label><input value={profile?.specialty || ''} onChange={e => updateProfile({ specialty: e.target.value })} /></div>
              <div className="field"><label>Hourly Rate ($)</label><input type="number" value={profile?.hourlyRate || 0} onChange={e => updateProfile({ hourlyRate: Number(e.target.value) })} /></div>
            </>
          )}
          <div className="field"><label>Bio</label><textarea value={profile?.bio || ''} onChange={e => updateProfile({ bio: e.target.value })} rows={4} /></div>
          <button className="btn-save" onClick={() => updateProfile({})} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;