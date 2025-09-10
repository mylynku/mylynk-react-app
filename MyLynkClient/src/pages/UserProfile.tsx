import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Camera, Settings, Heart, Clock, Star, MapPin, Phone, Mail } from 'lucide-react';
import { get, put } from '../services/api';

interface UserProfileData {
  _id: string;
  fullname: string;
  email: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  typeofuser: 'normal_user' | 'lynker';
  emailVerified: boolean;
  lastLoginAt?: string;
  status: 'active' | 'disabled' | 'deleted';
  createdAt: string;
  updatedAt: string;
  interests?: string[];
  totalBookings?: number;
  favoriteLynkers?: number;
  reviews?: number;
}

interface Booking {
  id: string;
  lynkerName: string;
  service: string;
  date: string;
  status: 'completed' | 'upcoming';
  rating?: number;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Omit<UserProfileData, '_id'>>({
    fullname: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    dateOfBirth: '',
    profilePicture: '',
    typeofuser: 'normal_user',
    emailVerified: false,
    lastLoginAt: '',
    status: 'active',
    createdAt: '',
    updatedAt: ''
  });

  const [recentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await get<UserProfileData>(`/users/${user?.id}`);
        setProfileData({
          fullname: response.data.fullname,
          email: response.data.email,
          mobile: response.data.mobile || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || '',
          postalCode: response.data.postalCode || '',
          dateOfBirth: response.data.dateOfBirth || '',
          profilePicture: response.data.profilePicture || '',
          typeofuser: response.data.typeofuser,
          emailVerified: response.data.emailVerified,
          lastLoginAt: response.data.lastLoginAt || '',
          status: response.data.status,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const handleSave = async () => {
    try {
      await put(`/users/${user?.id}`, profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-lynk-purple text-white rounded-lg hover:bg-lynk-dark transition-colors"
            >
              <Edit size={16} className="mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Profile Photo */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-lynk-purple to-lynk-dark flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt={profileData.fullname}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileData.fullname.charAt(0)
                  )}
                </div>
                {isEditing && (
                  <button
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border"
                    title="Update profile picture"
                  >
                    <Camera size={16} className="text-gray-600" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{profileData.fullname}</h2>
                <p className="text-gray-600 mb-4">
                  {profileData.typeofuser === 'lynker' ? 'Lynker' : 'User'}
                  {profileData.emailVerified && ' • Verified'}
                </p>
                
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                  <MapPin size={14} className="mr-1" />
                  {[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ')}
                </div>

                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  Member since {new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-lynk-purple">{profileData.totalBookings}</div>
                  <div className="text-xs text-gray-500">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lynk-purple">{profileData.favoriteLynkers}</div>
                  <div className="text-xs text-gray-500">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lynk-purple">{profileData.reviews}</div>
                  <div className="text-xs text-gray-500">Reviews</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail size={14} className="mr-3 text-gray-400" />
                  <span className="text-gray-600">{profileData.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone size={14} className="mr-3 text-gray-400" />
                  <span className="text-gray-600">{profileData.mobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            {isEditing && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullname}
                      onChange={(e) => setProfileData({...profileData, fullname: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your full name"
                      title="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your mobile number"
                      title="Mobile Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your address"
                      title="Address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="Your email address"
                      title="Email Address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your city"
                      title="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your state"
                      title="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your country"
                      title="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={profileData.postalCode}
                      onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      placeholder="Enter your postal code"
                      title="Postal Code"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lynk-purple focus:border-transparent"
                      title="Date of Birth"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-lynk-purple text-white rounded-lg hover:bg-lynk-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Bookings</h3>
                <button className="text-lynk-purple hover:text-lynk-dark text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-lynk-purple to-lynk-dark rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        {booking.lynkerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.lynkerName}</h4>
                        <p className="text-sm text-gray-600">{booking.service}</p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {booking.status === 'completed' && booking.rating && (
                        <div className="flex items-center mr-4">
                          <Star size={14} className="text-yellow-400 fill-current mr-1" />
                          <span className="text-sm text-gray-600">{booking.rating}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            {profileData.interests && profileData.interests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-lynk-light text-lynk-purple rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 