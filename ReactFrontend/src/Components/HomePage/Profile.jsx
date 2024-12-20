import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { checkForUser } from '../CheckForUser/CheckForUser';
import user_profile from '../Assests/user-profile.png';
import './Profile.css';
import axios from 'axios';

const Profile = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userProducts, setUserProducts] = useState([]);
    const [favoritedProducts, setFavoritedProducts] = useState([]);
    const [editForm, setEditForm] = useState({
        userID: user?.userID || '',
        email: user?.email || '',
        profilePicture: null
    });
    const [error, setError] = useState('');

    checkForUser(user);

    useEffect(() => {
        if (user) {
            fetchUserProducts();
            fetchFavoritedProducts();
        }
    }, [user]);

    const fetchUserProducts = async () => {
        try {
            const response = await axios.get(`/user-products/${user.userID}/`);
            if (response.status === 200) {
                const data = response.data;
                setUserProducts(data);
            }
        } catch (error) {
            console.error('Error fetching user products:', error);
        }
    };

    const removeProduct = async (productID) => {
        if (!window.confirm("Are you sure you want to remove this product?")) {
            return;
        }
    
        try {
            const response = await axios.delete(`/${user.userID}/products/${productID}/`);
            if (response.status === 200) {
                setUserProducts((prevProducts) =>
                    prevProducts.filter((product) => product.productID !== productID)
                );
                console.log('Product removed successfully');
            } else {
                console.error('Failed to remove product');
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    const removeFavorite = async (productID) => {
        if (!window.confirm("Are you sure you want to remove this favorite?")) {
            return;
        }
    
        try {
            const response = await axios.delete(`/delete-favorite/${user.userID}/${productID}/`);
            if (response.status === 200) {
                setFavoritedProducts((prevFavorites) =>
                    prevFavorites.filter((product) => product.productID !== productID)
                );
                console.log('Favorite removed successfully');
            } else {
                console.error('Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const fetchFavoritedProducts = async () => {
        try {
            const response = await axios.get(`/user-favorites/${user.userID}/`);
            if (response.status === 200) {
                setFavoritedProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching favorited products:', error);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await axios.post(`/logout/${user.userID}/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setUser(null);
            sessionStorage.removeItem('user');
            setIsDropdownOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            alert("Unexpected error during logout");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setEditForm(prev => ({
            ...prev,
            profilePicture: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('newUserID', editForm.userID);
            formData.append('newEmail', editForm.email);
            if (editForm.profilePicture) {
                formData.append('profilePicture', editForm.profilePicture);
            }

            const response = await axios.put(`/update-profile/${user.userID}/`, formData);

            if (response.status === 200) {
                const updatedUser = response.data;
                setUser(updatedUser);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`/users/${user.userID}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    setUser(null);
                    sessionStorage.removeItem('user');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className='profile-page'>
            <header className='header'>
                <Link to="/home/home/all" className="header-title">
                    <h1>E-Z COLLEGE</h1>
                </Link>
                <div className="header-right">
                    <span className="welcome-text">WELCOME, {user?.userID}</span>
                    <div className="profile-container" onClick={toggleDropdown}>
                        <img 
                            src={user.profilePicture || user_profile} 
                            alt="Profile" 
                            className='profile_icon'
                        />
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">Profile</Link>
                                <Link to="/product-upload" className="dropdown-item">Add Item</Link>
                                <Link to="/messages" className="dropdown-item">Messages</Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="dropdown-item"
                                    id="logout"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="profile-content">
                <div className="profile-header">
                    <img 
                        src={/*user.profilePicture ||*/ user_profile} 
                        alt="Profile" 
                        className="large-profile-image" 
                    />
                    {!isEditing ? (
                        <div className="profile-info">
                            <h2>{user?.userID}</h2>
                            <p>{user?.email}</p>
                            <button onClick={() => setIsEditing(true)} className="edit-button">
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="edit-form">
                            {error && <p className="error-message">{error}</p>}
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="userID"
                                    value={editForm.userID}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Profile Picture:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="submit" className="save-button">Save</button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)} 
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="user-items-section">
                    <div className="items-for-sale">
                        <h3 id='sale'>Items For Sale</h3>
                        <div className="products-grid">
                            {userProducts.length > 0 ? (
                                userProducts.map((product) => (
                                <div key={product.productID} className="product-card">
                                    <img src={product.image} alt={product.name} />
                                    <h4>{product.name}</h4>
                                    <p>{product.description}</p>
                                    <p>Price: ${product.price.toFixed(2)}</p>
                                    <button 
                                        onClick={() => removeProduct(product.productID)} 
                                        className="remove-product-button"
                                    >
                                        Remove Product
                                    </button>
                                </div>
                                ))
                            ) : (
                                <p>No items listed.</p>
                            )}
                        </div>
                    </div>

                    <div className="favorited-products">
                        <h3 id='favorite'>Favorited Products</h3>
                        <div className='favs'>
                            {favoritedProducts.length > 0 ? (
                                favoritedProducts.map((product) => (
                                    <div key={product.productID} className="product-card">
                                        <img src={product.product.image} alt={product.product.name} />
                                        <h4>{product.product.name}</h4>
                                        <p>{product.product.description}</p>
                                        <p>Price: ${product.product.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => removeFavorite(product.productID)}
                                            className="remove-favorite-button"
                                        >Remove Favorite</button>
                                    </div>
                                ))
                            ) : (
                                <p>No favorited products yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="deactivate">
                    <h3>Deactivate</h3>
                    <button 
                        onClick={handleDeleteAccount}
                        className="delete-account-button"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;