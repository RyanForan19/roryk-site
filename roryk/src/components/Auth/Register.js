import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    role: "user" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Only superadmin can access registration
  if (!user || user.role !== 'superadmin') {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Access Denied</h2>
        <p>Only superadmin can register new users.</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const validateForm = () => {
    if (!form.username.trim()) {
      return "Username is required";
    }
    
    if (form.username.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!form.password) {
      return "Password is required";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(form.username.trim(), form.password, form.role);
      
      if (result.success) {
        setSuccess(`User "${result.user.username}" created successfully!`);
        setForm({ 
          username: "", 
          password: "", 
          confirmPassword: "",
          role: "user" 
        });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Register New User
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text"
            value={form.username} 
            onChange={e => handleInputChange('username', e.target.value)}
            placeholder="Username (min 3 characters)" 
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            value={form.password} 
            onChange={e => handleInputChange('password', e.target.value)}
            placeholder="Password (min 6 characters)" 
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            value={form.confirmPassword} 
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm Password" 
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <select
            value={form.role}
            onChange={e => handleInputChange('role', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={isLoading}
          >
            <option value="user">Regular User</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Creating User...' : 'Create User'}
        </button>

        {error && (
          <p style={{
            color: "red", 
            textAlign: 'center', 
            marginTop: '10px',
            fontSize: '14px'
          }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{
            color: "green", 
            textAlign: 'center', 
            marginTop: '10px',
            fontSize: '14px'
          }}>
            {success}
          </p>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={() => navigate('/admin')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Admin Panel
          </button>
        </div>
      </form>
    </div>
  );
}