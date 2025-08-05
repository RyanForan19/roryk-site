import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PublicRegister() {
  const { registerUser } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        status: 'pending' // Requires admin approval
      });

      if (result.success) {
        setSuccess("Registration submitted successfully! Your account is pending admin approval. You will be notified via email once approved.");
        setForm({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          company: "",
          phone: ""
        });
      } else {
        setError(result.error || "Failed to register");
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
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '32px',
            color: '#495057',
            marginBottom: '10px'
          }}>
            Create Account
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6c757d'
          }}>
            Register for access to vehicle checking services. Your account will require admin approval.
          </p>
        </div>

        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '1px solid #c3e6cb'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ✓
            </div>
            <h3 style={{
              color: '#155724',
              marginBottom: '15px'
            }}>
              Registration Submitted!
            </h3>
            <p style={{
              color: '#155724',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              {success}
            </p>
            <Link
              to="/login"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Username *
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => handleInputChange('username', e.target.value)}
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  placeholder="Company name (optional)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number (optional)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {isLoading ? 'Submitting Registration...' : 'Register Account'}
            </button>

            {error && (
              <div style={{
                padding: '15px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '6px',
                border: '1px solid #f5c6cb',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}