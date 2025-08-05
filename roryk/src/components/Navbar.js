import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      padding: '0 20px',
      boxShadow: 'var(--shadow-medium)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo/Brand */}
        <Link 
          to="/" 
          onClick={closeMobileMenu}
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '28px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '32px' }}>🚗</span>
          RoryKSite
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          style={{
            display: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px'
          }}
          className="desktop-nav"
        >
          {/* Public Services */}
          <Link 
            to="/irish-history-check" 
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              padding: '8px 12px',
              borderRadius: 'var(--border-radius)',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            📋 History Check
          </Link>
          
          <Link 
            to="/valuation" 
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              padding: '8px 12px',
              borderRadius: 'var(--border-radius)',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            💰 Valuation
          </Link>
          
          <Link 
            to="/vin-checker" 
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              padding: '8px 12px',
              borderRadius: 'var(--border-radius)',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            🔍 VIN Checker
          </Link>

          {/* User-specific links */}
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <Link
                to="/dashboard"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                🏠 Dashboard
              </Link>
              
              <Link
                to="/checks-history"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                📋 My Checks
              </Link>

              <Link
                to="/profile"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                👤 Profile
              </Link>

              <Link
                to="/top-up"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--secondary-color)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--secondary-color)'}
              >
                💳 Top Up
              </Link>

              {user.role === 'superadmin' && (
                <Link
                  to="/admin"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '16px',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: 'var(--danger-color)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--danger-color)'}
                >
                  ⚙️ Admin
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  €{user.balance.toFixed(2)}
                </div>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '2px solid white',
                    padding: '6px 12px',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = 'var(--primary-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'white';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Link
                to="/register"
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid white',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                }}
              >
                Register
              </Link>
              <Link
                to="/login"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--primary-color)',
            boxShadow: 'var(--shadow-medium)',
            padding: '20px',
            display: 'none'
          }}
          className="mobile-nav"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Public Services */}
              <Link 
                to="/irish-history-check" 
                onClick={closeMobileMenu}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}
              >
                📋 History Check
              </Link>
              
              <Link 
                to="/valuation" 
                onClick={closeMobileMenu}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}
              >
                💰 Valuation
              </Link>
              
              <Link 
                to="/vin-checker" 
                onClick={closeMobileMenu}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}
              >
                🔍 VIN Checker
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '16px',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}
                  >
                    🏠 Dashboard
                  </Link>
                  
                  <Link
                    to="/checks-history"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '16px',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}
                  >
                    📋 My Checks
                  </Link>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '16px',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}
                  >
                    👤 Profile
                  </Link>

                  <Link
                    to="/top-up"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '16px',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'var(--secondary-color)',
                      textAlign: 'center'
                    }}
                  >
                    💳 Top Up
                  </Link>

                  {user.role === 'superadmin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '16px',
                        padding: '12px',
                        borderRadius: 'var(--border-radius)',
                        backgroundColor: 'var(--danger-color)',
                        textAlign: 'center'
                      }}
                    >
                      ⚙️ Admin
                    </Link>
                  )}

                  <div style={{
                    color: 'white',
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 'var(--border-radius)'
                  }}>
                    Balance: €{user.balance.toFixed(2)} | {user.username}
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      border: '2px solid white',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      padding: '12px',
                      borderRadius: 'var(--border-radius)',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-nav {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}