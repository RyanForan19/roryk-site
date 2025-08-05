import { Link } from 'react-router-dom';

export default function PublicHome() {
  const features = [
    {
      title: 'Irish History Check',
      description: 'Get comprehensive vehicle history reports including previous owners, accidents, and service records.',
      icon: '📋',
      link: '/irish-history-check',
      color: '#007bff'
    },
    {
      title: 'Vehicle Valuation',
      description: 'Get accurate market valuations for your vehicle based on current market conditions.',
      icon: '💰',
      link: '/valuation',
      color: '#28a745'
    },
    {
      title: 'VIN Checker',
      description: 'Decode and verify Vehicle Identification Numbers to get detailed vehicle specifications.',
      icon: '🔍',
      link: '/vin-checker',
      color: '#17a2b8'
    }
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', // Account for navbar height
      backgroundColor: '#f8f9fa'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Don't Regret It, Check It with RoryKSite!
          </h1>
          <p style={{
            fontSize: '20px',
            marginBottom: '40px',
            opacity: 0.9
          }}>
            Get comprehensive vehicle history reports, accurate valuations, and VIN verification services for Irish vehicles.
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/irish-history-check"
              style={{
                backgroundColor: 'white',
                color: 'var(--primary-color)',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Start Vehicle Check
            </Link>
            <Link
              to="/login"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '13px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '18px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '36px',
          marginBottom: '20px',
          color: '#495057'
        }}>
          Our Services
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '18px',
          color: '#6c757d',
          marginBottom: '60px',
          maxWidth: '600px',
          margin: '0 auto 60px auto'
        }}>
          Comprehensive vehicle information services to help you make informed decisions when buying or selling a car.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-medium)',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '15px',
                color: feature.color
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                lineHeight: '1.6',
                marginBottom: '25px'
              }}>
                {feature.description}
              </p>
              <Link
                to={feature.link}
                style={{
                  backgroundColor: feature.color,
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  transition: 'opacity 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Try Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '80px 20px',
        borderTop: '1px solid #dee2e6'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '36px',
            marginBottom: '60px',
            color: '#495057'
          }}>
            Why Choose RoryKSite?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '32px'
              }}>
                ✓
              </div>
              <h4 style={{
                fontSize: '20px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Comprehensive Reports
              </h4>
              <p style={{
                color: '#6c757d',
                lineHeight: '1.6'
              }}>
                Get detailed vehicle history including accidents, previous owners, and service records.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '32px'
              }}>
                🇮🇪
              </div>
              <h4 style={{
                fontSize: '20px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Irish Focused
              </h4>
              <p style={{
                color: '#6c757d',
                lineHeight: '1.6'
              }}>
                Specialized in Irish vehicle data with access to local records and databases.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#17a2b8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '32px'
              }}>
                ⚡
              </div>
              <h4 style={{
                fontSize: '20px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Instant Results
              </h4>
              <p style={{
                color: '#6c757d',
                lineHeight: '1.6'
              }}>
                Get your vehicle reports instantly with our fast and reliable service.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#ffc107',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '32px'
              }}>
                🔒
              </div>
              <h4 style={{
                fontSize: '20px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Secure & Private
              </h4>
              <p style={{
                color: '#6c757d',
                lineHeight: '1.6'
              }}>
                Your data is protected with enterprise-grade security and privacy measures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#495057',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <p style={{
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            © 2024 RoryKSite. All rights reserved.
          </p>
          <p style={{
            fontSize: '14px',
            opacity: 0.8
          }}>
            Providing reliable vehicle information services across Ireland.
          </p>
        </div>
      </div>
    </div>
  );
}