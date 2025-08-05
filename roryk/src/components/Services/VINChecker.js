import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motorcheckService } from '../../services/motorcheckService';

export default function VINChecker() {
  const { user, chargeCredits } = useAuth();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const CREDIT_COST = 1; // €1 per VIN check

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vin.trim()) {
      setError('Please enter a VIN number');
      return;
    }

    if (vin.trim().length !== 17) {
      setError('VIN must be exactly 17 characters long');
      return;
    }

    // Check if user has sufficient credits
    if (user.balance < CREDIT_COST) {
      setError(`Insufficient credits. You need €${CREDIT_COST} to perform this VIN check. Current balance: €${user.balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call API first - only charge if successful
      const response = await motorcheckService.checkVIN(vin.trim());
      
      // API call successful, now charge credits and store result
      const chargeResult = await chargeCredits(
        user.id,
        CREDIT_COST,
        `VIN Check - ${vin.trim()}`,
        'vin',
        response.data,
        vin.trim()
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

  const formatVIN = (vinString) => {
    // Format VIN with spaces for better readability
    return vinString.replace(/(.{4})/g, '$1 ').trim();
  };


  const vinPositions = [
    { position: 1, description: 'World Manufacturer Identifier (WMI) - Country' },
    { position: 2, description: 'World Manufacturer Identifier (WMI) - Manufacturer' },
    { position: 3, description: 'World Manufacturer Identifier (WMI) - Vehicle Type' },
    { position: 4, description: 'Vehicle Descriptor Section (VDS) - Body Style' },
    { position: 5, description: 'Vehicle Descriptor Section (VDS) - Engine Type' },
    { position: 6, description: 'Vehicle Descriptor Section (VDS) - Model' },
    { position: 7, description: 'Vehicle Descriptor Section (VDS) - Restraint System' },
    { position: 8, description: 'Vehicle Descriptor Section (VDS) - Transmission' },
    { position: 9, description: 'Check Digit' },
    { position: 10, description: 'Model Year' },
    { position: 11, description: 'Assembly Plant' },
    { position: 12, description: 'Production Sequence Number' },
    { position: 13, description: 'Production Sequence Number' },
    { position: 14, description: 'Production Sequence Number' },
    { position: 15, description: 'Production Sequence Number' },
    { position: 16, description: 'Production Sequence Number' },
    { position: 17, description: 'Production Sequence Number' }
  ];

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
            VIN Checker
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto 20px auto'
          }}>
            Decode and verify Vehicle Identification Numbers (VIN) to get detailed vehicle
            specifications and manufacturing information.
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

        {/* VIN Input Form */}
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
              <div style={{ flex: 1, minWidth: '300px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Vehicle Identification Number (VIN)
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ''))}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#17a2b8'}
                  onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                  disabled={loading}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  marginTop: '5px'
                }}>
                  {vin.length}/17 characters
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || vin.length !== 17}
                style={{
                  backgroundColor: loading || vin.length !== 17 ? '#6c757d' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading || vin.length !== 17 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  minWidth: '120px'
                }}
              >
                {loading ? 'Checking...' : 'Check VIN'}
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
            {/* VIN Status Header */}
            <div style={{
              background: result.valid 
                ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'
                : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '15px'
              }}>
                {result.valid ? '✓' : '✗'}
              </div>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '10px'
              }}>
                VIN {result.valid ? 'Valid' : 'Invalid'}
              </h2>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: 0,
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {formatVIN(result.vin)}
              </p>
            </div>

            <div style={{ padding: '30px' }}>
              {result.valid && (
                <>
                  {/* Basic VIN Information */}
                  <div style={{
                    marginBottom: '30px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      marginBottom: '20px',
                      color: '#495057',
                      borderBottom: '2px solid #17a2b8',
                      paddingBottom: '5px'
                    }}>
                      VIN Decoded Information
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '20px'
                    }}>
                      <div>
                        <strong>Country of Origin:</strong>
                        <div style={{ color: '#6c757d', marginTop: '5px' }}>
                          {result.country}
                        </div>
                      </div>
                      <div>
                        <strong>Manufacturer:</strong>
                        <div style={{ color: '#6c757d', marginTop: '5px' }}>
                          {result.manufacturer}
                        </div>
                      </div>
                      <div>
                        <strong>Model Year:</strong>
                        <div style={{ color: '#6c757d', marginTop: '5px' }}>
                          {result.year}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Vehicle Details (if found in database) */}
                  {result.found && result.vehicle && (
                    <div style={{
                      backgroundColor: '#e8f5e8',
                      padding: '25px',
                      borderRadius: '8px',
                      marginBottom: '30px',
                      border: '1px solid #28a745'
                    }}>
                      <h3 style={{
                        fontSize: '20px',
                        marginBottom: '20px',
                        color: '#28a745'
                      }}>
                        ✓ Vehicle Found in Irish Database
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '16px',
                            marginBottom: '10px',
                            color: '#495057'
                          }}>
                            Vehicle Details
                          </h4>
                          <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                            <div><strong>Registration:</strong> {result.vehicle.registration}</div>
                            <div><strong>Make:</strong> {result.vehicle.make}</div>
                            <div><strong>Model:</strong> {result.vehicle.model}</div>
                            <div><strong>Variant:</strong> {result.vehicle.variant}</div>
                            <div><strong>Year:</strong> {result.vehicle.year}</div>
                            <div><strong>Engine:</strong> {result.vehicle.engine}</div>
                            <div><strong>Fuel:</strong> {result.vehicle.fuel}</div>
                            <div><strong>Color:</strong> {result.vehicle.color}</div>
                          </div>
                        </div>
                        <div>
                          <h4 style={{
                            fontSize: '16px',
                            marginBottom: '10px',
                            color: '#495057'
                          }}>
                            Status Information
                          </h4>
                          <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                            <div><strong>NCT Status:</strong> 
                              <span style={{ 
                                color: result.vehicle.history.nctStatus === 'Pass' ? '#28a745' : '#dc3545',
                                marginLeft: '5px'
                              }}>
                                {result.vehicle.history.nctStatus}
                              </span>
                            </div>
                            <div><strong>NCT Expiry:</strong> {result.vehicle.history.nctExpiry}</div>
                            <div><strong>Outstanding Finance:</strong> 
                              <span style={{ 
                                color: result.vehicle.finance.outstandingFinance ? '#dc3545' : '#28a745',
                                marginLeft: '5px'
                              }}>
                                {result.vehicle.finance.outstandingFinance ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div><strong>Write Off:</strong> 
                              <span style={{ 
                                color: result.vehicle.finance.writeOff ? '#dc3545' : '#28a745',
                                marginLeft: '5px'
                              }}>
                                {result.vehicle.finance.writeOff ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIN Structure Breakdown */}
                  <div style={{
                    marginBottom: '30px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      marginBottom: '20px',
                      color: '#495057',
                      borderBottom: '2px solid #6c757d',
                      paddingBottom: '5px'
                    }}>
                      VIN Structure Breakdown
                    </h3>
                    
                    {/* Visual VIN breakdown */}
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontFamily: 'monospace',
                        letterSpacing: '3px',
                        marginBottom: '15px',
                        color: '#495057'
                      }}>
                        {result.vin.split('').map((char, index) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: index < 3 ? '#e3f2fd' : 
                                             index < 8 ? '#e8f5e8' : 
                                             index === 8 ? '#fff3e0' :
                                             index === 9 ? '#f3e5f5' :
                                             index === 10 ? '#fce4ec' : '#f1f8e9',
                              padding: '5px 8px',
                              margin: '0 2px',
                              borderRadius: '4px',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        flexWrap: 'wrap',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#e3f2fd', border: '1px solid #dee2e6' }}></div>
                          <span>WMI (1-3)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#e8f5e8', border: '1px solid #dee2e6' }}></div>
                          <span>VDS (4-8)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#fff3e0', border: '1px solid #dee2e6' }}></div>
                          <span>Check (9)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#f3e5f5', border: '1px solid #dee2e6' }}></div>
                          <span>Year (10)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#fce4ec', border: '1px solid #dee2e6' }}></div>
                          <span>Plant (11)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '15px', height: '15px', backgroundColor: '#f1f8e9', border: '1px solid #dee2e6' }}></div>
                          <span>Serial (12-17)</span>
                        </div>
                      </div>
                    </div>

                    {/* Position details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px'
                    }}>
                      {vinPositions.map((pos, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                          }}
                        >
                          <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            flexShrink: 0
                          }}>
                            {pos.position}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '16px',
                              fontFamily: 'monospace'
                            }}>
                              {result.vin.charAt(pos.position - 1)}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6c757d'
                            }}>
                              {pos.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!result.found && (
                    <div style={{
                      backgroundColor: '#fff3cd',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #ffeaa7',
                      textAlign: 'center'
                    }}>
                      <h4 style={{
                        color: '#856404',
                        marginBottom: '10px'
                      }}>
                        Vehicle Not Found in Irish Database
                      </h4>
                      <p style={{
                        color: '#856404',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {result.message || 'This VIN is valid but the vehicle details are not available in our Irish vehicle database.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}


        {/* About VIN */}
        <div style={{
          marginTop: '40px',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '24px',
            textAlign: 'center',
            marginBottom: '30px',
            color: '#495057'
          }}>
            About Vehicle Identification Numbers
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            <div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                What is a VIN?
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                A Vehicle Identification Number (VIN) is a unique 17-character code that identifies every motor vehicle. 
                It contains information about the vehicle's manufacturer, model, year, and place of production.
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Where to Find VIN
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                The VIN can be found on the dashboard (visible through windshield), driver's side door frame, 
                engine block, or vehicle registration documents.
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '15px',
                color: '#495057'
              }}>
                Why Check VIN?
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                VIN checking helps verify vehicle authenticity, decode specifications, check for recalls, 
                and ensure the vehicle hasn't been stolen or has outstanding finance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}