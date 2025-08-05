import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motorcheckService } from '../../services/motorcheckService';

export default function Valuation() {
  const { user, chargeCredits } = useAuth();
  const [registration, setRegistration] = useState('');
  const [odometer, setOdometer] = useState('');
  const [odometerUnknown, setOdometerUnknown] = useState(false);
  const [validNCT, setValidNCT] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const CREDIT_COST = 1; // €1 per valuation

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!registration.trim()) {
      setError('Please enter a registration number');
      return;
    }

    // Check if user has sufficient credits
    if (user.balance < CREDIT_COST) {
      setError(`Insufficient credits. You need €${CREDIT_COST} to perform this valuation. Current balance: €${user.balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Prepare additional data for API
      const additionalData = {
        odometer: odometerUnknown ? null : parseInt(odometer) || null,
        odometerUnknown,
        validNCT
      };

      // Call API first - only charge if successful
      const response = await motorcheckService.getVehicleValuationByReg(registration.trim(), additionalData);
      
      // API call successful, now charge credits and store result
      const chargeResult = await chargeCredits(
        user.id,
        CREDIT_COST,
        `Vehicle Valuation - ${registration.trim()}`,
        'valuation',
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#28a745';
      case 'good': return '#007bff';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
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
            Vehicle Valuation
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto 20px auto'
          }}>
            Get accurate market valuations for your vehicle based on current market conditions.
            Simply enter your vehicle's registration number.
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
              Cost per Valuation: €{CREDIT_COST}
            </div>
          </div>
        </div>

        {/* Valuation Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
            }}>
              {/* Registration Number */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Registration Number *
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
                  onFocus={(e) => e.target.style.borderColor = '#28a745'}
                  onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                  disabled={loading}
                  required
                />
              </div>

              {/* Odometer Reading */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Odometer Reading (Kms) *
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    placeholder="e.g., 125000"
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      opacity: odometerUnknown ? 0.5 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#28a745'}
                    onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                    disabled={loading || odometerUnknown}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOdometerUnknown(!odometerUnknown);
                      if (!odometerUnknown) setOdometer('');
                    }}
                    style={{
                      backgroundColor: odometerUnknown ? '#dc3545' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      whiteSpace: 'nowrap'
                    }}
                    disabled={loading}
                  >
                    {odometerUnknown ? 'Clear' : 'Unknown'}
                  </button>
                </div>
                {odometerUnknown && (
                  <div style={{
                    marginTop: '5px',
                    fontSize: '12px',
                    color: '#856404',
                    backgroundColor: '#fff3cd',
                    padding: '5px 8px',
                    borderRadius: '4px'
                  }}>
                    Odometer reading marked as unknown
                  </div>
                )}
              </div>

              {/* Valid NCT/CVRT */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Valid NCT/CVRT *
                </label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', paddingTop: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    <input
                      type="radio"
                      name="validNCT"
                      checked={validNCT === true}
                      onChange={() => setValidNCT(true)}
                      disabled={loading}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Yes</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    <input
                      type="radio"
                      name="validNCT"
                      checked={validNCT === false}
                      onChange={() => setValidNCT(false)}
                      disabled={loading}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>✗ No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button
                type="submit"
                disabled={loading || (!registration.trim()) || (!odometerUnknown && !odometer.trim())}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  minWidth: '200px'
                }}
              >
                {loading ? 'Getting Valuation...' : 'Get Valuation'}
              </button>
            </div>
          </form>

          {error && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
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
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              padding: '30px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '10px'
              }}>
                {result.vehicle.make} {result.vehicle.model}
              </h2>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: 0
              }}>
                {result.vehicle.year} • {result.vehicle.registration} • {result.factors.condition} condition
              </p>
            </div>

            {/* Valuation Results */}
            <div style={{ padding: '30px' }}>
              <h3 style={{
                fontSize: '24px',
                textAlign: 'center',
                marginBottom: '30px',
                color: '#495057'
              }}>
                Current Market Valuation
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {/* Trade Value */}
                <div style={{
                  textAlign: 'center',
                  padding: '25px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '12px',
                  border: '2px solid #007bff'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Trade-In Value
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#007bff',
                    marginBottom: '8px'
                  }}>
                    {formatCurrency(result.valuation.trade)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    What dealers typically pay
                  </div>
                </div>

                {/* Private Sale */}
                <div style={{
                  textAlign: 'center',
                  padding: '25px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '12px',
                  border: '2px solid #28a745'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Private Sale
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#28a745',
                    marginBottom: '8px'
                  }}>
                    {formatCurrency(result.valuation.private)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    Selling to another individual
                  </div>
                </div>

                {/* Retail Value */}
                <div style={{
                  textAlign: 'center',
                  padding: '25px',
                  backgroundColor: '#fff3e0',
                  borderRadius: '12px',
                  border: '2px solid #ff9800'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Retail Value
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#ff9800',
                    marginBottom: '8px'
                  }}>
                    {formatCurrency(result.valuation.retail)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    What dealers typically charge
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '25px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  marginBottom: '15px',
                  color: '#495057'
                }}>
                  Vehicle Details
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  <div><strong>Registration:</strong> {result.vehicle.registration}</div>
                  <div><strong>Make:</strong> {result.vehicle.make}</div>
                  <div><strong>Model:</strong> {result.vehicle.model}</div>
                  <div><strong>Year:</strong> {result.vehicle.year}</div>
                  <div><strong>Engine:</strong> {result.vehicle.engine}</div>
                  <div><strong>Fuel:</strong> {result.vehicle.fuel}</div>
                  <div><strong>Mileage:</strong> {
                    result.factors.odometerUnknown || result.factors.mileage === 'Unknown'
                      ? 'Unknown'
                      : `${result.factors.mileage.toLocaleString()} km`
                  }</div>
                  <div>
                    <strong>Condition:</strong>
                    <span style={{
                      color: getConditionColor(result.factors.condition),
                      marginLeft: '5px',
                      textTransform: 'capitalize'
                    }}>
                      {result.factors.condition}
                    </span>
                  </div>
                  <div>
                    <strong>NCT Status:</strong>
                    <span style={{
                      color: result.factors.validNCT ? '#28a745' : '#dc3545',
                      marginLeft: '5px',
                      fontWeight: 'bold'
                    }}>
                      {result.factors.validNCT ? '✓ Valid' : '✗ Invalid/Expired'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Factors Affecting Valuation */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '25px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  marginBottom: '15px',
                  color: '#495057'
                }}>
                  Factors Affecting This Valuation
                </h4>
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
                      backgroundColor: getConditionColor(result.factors.condition)
                    }}></div>
                    <span>Condition: <strong style={{ textTransform: 'capitalize' }}>{result.factors.condition}</strong></span>
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
                      backgroundColor: result.factors.odometerUnknown || result.factors.mileage === 'Unknown' || result.factors.mileage > 150000 ? '#dc3545' : '#28a745'
                    }}></div>
                    <span>Mileage: <strong>{
                      result.factors.odometerUnknown || result.factors.mileage === 'Unknown'
                        ? 'Unknown'
                        : `${result.factors.mileage.toLocaleString()} km`
                    }</strong></span>
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
                      backgroundColor: '#007bff'
                    }}></div>
                    <span>Market Trend: <strong style={{ textTransform: 'capitalize' }}>{result.factors.marketTrend}</strong></span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{
                padding: '20px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <h5 style={{
                  color: '#856404',
                  marginBottom: '10px',
                  fontSize: '16px'
                }}>
                  Important Notes
                </h5>
                <ul style={{
                  color: '#856404',
                  fontSize: '14px',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>Valuations are estimates based on current market conditions</li>
                  <li>Actual selling price may vary based on location, demand, and specific vehicle condition</li>
                  <li>Additional factors like service history, modifications, and market timing can affect value</li>
                  <li>For the most accurate valuation, consider getting a professional inspection</li>
                </ul>
              </div>

              <p style={{
                fontSize: '12px',
                color: '#6c757d',
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: 0
              }}>
                Valuation calculated on: {result.valuation.lastUpdated}
              </p>
            </div>
          </div>
        )}

        {/* How It Works */}
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
            How Our Valuation Works
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                fontSize: '24px'
              }}>
                📊
              </div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '10px',
                color: '#495057'
              }}>
                Market Data Analysis
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                We analyze current market trends, recent sales data, and pricing patterns for similar vehicles.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                fontSize: '24px'
              }}>
                🔧
              </div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '10px',
                color: '#495057'
              }}>
                Vehicle History Integration
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Vehicle condition, mileage, and maintenance history from our database are factored into the valuation.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#17a2b8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                fontSize: '24px'
              }}>
                💰
              </div>
              <h4 style={{
                fontSize: '18px',
                marginBottom: '10px',
                color: '#495057'
              }}>
                Multiple Valuations
              </h4>
              <p style={{
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Get trade-in, private sale, and retail values to understand your vehicle's worth in different scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}