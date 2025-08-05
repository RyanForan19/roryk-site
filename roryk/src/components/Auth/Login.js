import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!form.username.trim() || !form.password.trim()) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(form.username.trim(), form.password);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={form.username}
            onChange={e => handleInputChange('username', e.target.value)}
            placeholder="Username"
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
            placeholder="Password"
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

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
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

      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd'
      }}>
        <Link
          to="/forgot-password"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Forgot your password?
        </Link>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '10px'
      }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Sign up here
        </Link>
      </div>

    </form>
  </div>
  );
}
