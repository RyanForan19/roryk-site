import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motorcheckService } from '../../services/motorcheckService';

export default function IrishHistoryCheck() {
  const { user, chargeCredits } = useAuth();
  const [registration, setRegistration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const CREDIT_COST = 1; // €1 per check

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registration.trim()) {
      setError('Please enter a registration number');
      return;
    }

    // Check if user has sufficient credits
    if (user.balance < CREDIT_COST) {
      setError(`Insufficient credits. You need €${CREDIT_COST} to perform this check. Current balance: €${user.balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call API first - only charge if successful
      const response = await motorcheckService.getVehicleHistory(registration.trim());
      
      // API call successful, now charge credits and store result
      const chargeResult = await chargeCredits(
        user.id,
        CREDIT_COST,
        `Irish History Check - ${registration.trim()}`,
        'history',
        response.data,
        registration.trim()
      );
      
      if (!chargeResult.success) {
        throw new Error(chargeResult.error);
      }

      setResult(response.data);
    } catch (err) {
      // API failed or charging failed - show error without charging user
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pass': return '#28a745';
      case 'Fail': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRiskLevel = (vehicle) => {
    let riskScore = 0;
    if (vehicle.history.accidents > 0) riskScore += 2;
    if (vehicle.finance.outstandingFinance) riskScore += 3;
    if (vehicle.finance.writeOff) riskScore += 4;
    if (vehicle.history.previousOwners > 2) riskScore += 1;
    if (!vehicle.history.mileageVerified) riskScore += 2;
    if (vehicle.history.nctStatus === 'Fail') riskScore += 2;

    if (riskScore >= 6) return { level: 'High', color: '#dc3545' };
    if (riskScore >= 3) return { level: 'Medium', color: '#ffc107' };
    return { level: 'Low', color: '#28a745' };
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '36px',
            color: '#495057',
            marginBottom: '15px'
          }}>
            Irish History Check
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto 20px auto'
          }}>
            Get comprehensive vehicle history reports for Irish registered vehicles.
            Enter a registration number to check for accidents, finance, and more.
          </p>
          
          {/* Credit Balance Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              backgroundColor: user.balance >= CREDIT_COST ? '#d4edda' : '#f8d7da',
              color: user.balance >= CREDIT_COST ? '#155724' : '#721c24',
              padding: '10px 20px',
              borderRadius: '20px',
              border: `1px solid ${user.balance >= CREDIT_COST ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Your Balance: €{user.balance.toFixed(2)}
            </div>
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '10px 20px',
              borderRadius: '20px',
              border: '1px solid #ffeaa7',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Cost per Check: €{CREDIT_COST}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Registration Number
                </label>
                <input
                  type="text"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  placeholder="e.g., 12-D-12345"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  minWidth: '120px'
                }}
              >
                {loading ? 'Checking...' : 'Check Now'}
              </button>
            </div>
          </form>

          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Vehicle Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              padding: '30px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    marginBottom: '10px'
                  }}>
                    {result.make} {result.model}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {result.variant} • {result.year}
                  </p>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    marginBottom: '5px'
                  }}>
                    Risk Level
                  </div>
                  <div style={{
                    backgroundColor: getRiskLevel(result).color,
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {getRiskLevel(result).level} Risk
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div style={{ padding: '30px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px',
                marginBottom: '30px'
              }}>
                {/* Basic Info */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    marginBottom: '15px',
                    color: '#495057',
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '5px'
                  }}>
                    Vehicle Details
                  </h3>
                  <div style={{ lineHeight: '1.8' }}>
                    <div><strong>Registration:</strong> {result.registration}</div>
                    <div><strong>VIN:</strong> {result.vin}</div>
                    <div><strong>Engine:</strong> {result.engine}</div>
                    <div><strong>Fuel:</strong> {result.fuel}</div>
                    <div><strong>Transmission:</strong> {result.transmission}</div>
                    <div><strong>Color:</strong> {result.color}</div>
                    <div><strong>Doors:</strong> {result.doors}</div>
                  </div>
                </div>

                {/* History */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    marginBottom: '15px',
                    color: '#495057',
                    borderBottom: '2px solid #28a745',
                    paddingBottom: '5px'
                  }}>
                    History
                  </h3>
                  <div style={{ lineHeight: '1.8' }}>
                    <div><strong>Previous Owners:</strong> {result.history.previousOwners}</div>
                    <div><strong>Accidents:</strong> 
                      <span style={{ 
                        color: result.history.accidents > 0 ? '#dc3545' : '#28a745',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {result.history.accidents}
                      </span>
                    </div>
                    <div><strong>Service History:</strong> {result.history.serviceHistory}</div>
                    <div><strong>Mileage Verified:</strong> 
                      <span style={{ 
                        color: result.history.mileageVerified ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {result.history.mileageVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div><strong>NCT Status:</strong> 
                      <span style={{ 
                        color: getStatusColor(result.history.nctStatus),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {result.history.nctStatus}
                      </span>
                    </div>
                    <div><strong>NCT Expiry:</strong> {result.history.nctExpiry}</div>
                  </div>
                </div>
              </div>

              {/* Finance & Legal */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  marginBottom: '15px',
                  color: '#495057'
                }}>
                  Finance & Legal Status
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: result.finance.outstandingFinance ? '#dc3545' : '#28a745'
                    }}></div>
                    <span>Outstanding Finance: <strong>{result.finance.outstandingFinance ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: result.finance.writeOff ? '#dc3545' : '#28a745'
                    }}></div>
                    <span>Write Off: <strong>{result.finance.writeOff ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: result.finance.stolen ? '#dc3545' : '#28a745'
                    }}></div>
                    <span>Stolen: <strong>{result.finance.stolen ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>
                {result.finance.outstandingFinance && result.finance.financeCompany && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    border: '1px solid #ffeaa7'
                  }}>
                    <strong>Finance Company:</strong> {result.finance.financeCompany}
                  </div>
                )}
              </div>

              {/* Valuation */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '5px', textAlign: 'center' }}>
            Vehicle Valuation
          </h6>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #17a2b8',
            width: '100%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>💰</div>
            <h5 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '18px' }}>
              Get Current Market Value
            </h5>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px', lineHeight: '1.5' }}>
              Get an accurate, up-to-date valuation for this {result.make} {result.model} based on current market conditions.
            </p>
            <a
              href={`/valuation?reg=${encodeURIComponent(result.registration)}`}
              style={{
                display: 'inline-block',
                backgroundColor: '#17a2b8',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(23, 162, 184, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#138496';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#17a2b8';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.3)';
              }}
            >
              💰 Get Valuation - €1.00
            </a>
            <p style={{ fontSize: '11px', color: '#6c757d', margin: '10px 0 0 0' }}>
              Professional market valuation report
            </p>
          </div>
        </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}