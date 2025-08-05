import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ChecksHistory() {
  const { user, getUserServiceTransactions } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  const loadTransactions = useCallback(() => {
    try {
      const serviceTransactions = getUserServiceTransactions(user.id);
      setTransactions(serviceTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getUserServiceTransactions]);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, loadTransactions]);

  const getServiceType = (transaction) => {
    return transaction.serviceType || 'unknown';
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'history': return '📋';
      case 'valuation': return '💰';
      case 'vin': return '🔍';
      default: return '📄';
    }
  };

  const getServiceName = (type) => {
    switch (type) {
      case 'history': return 'Irish History Check';
      case 'valuation': return 'Vehicle Valuation';
      case 'vin': return 'VIN Check';
      default: return 'Service Check';
    }
  };

  const getServiceColor = (type) => {
    switch (type) {
      case 'history': return '#007bff';
      case 'valuation': return '#28a745';
      case 'vin': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const extractVehicleInfo = (transaction) => {
    return transaction.vehicleIdentifier || 'N/A';
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return getServiceType(transaction) === filter;
  });

  const toggleExpanded = (transactionId) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };

  const renderDetailedView = (transaction) => {
    if (!transaction.checkData) return null;

    const data = transaction.checkData;
    const serviceType = getServiceType(transaction);

    switch (serviceType) {
      case 'history':
        return renderHistoryDetails(data);
      case 'valuation':
        return renderValuationDetails(data);
      case 'vin':
        return renderVINDetails(data);
      default:
        return <div>No detailed data available</div>;
    }
  };

  const renderHistoryDetails = (data) => (
    <div style={{ marginTop: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#007bff', color: 'white', padding: '15px 20px' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>📋 Irish History Check Report</h4>
      </div>

      {/* Vehicle Summary */}
      <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'center' }}>
          <div>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#495057' }}>{data.make} {data.model}</h5>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>{data.year} • {data.registration}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: data.history.accidents > 0 || data.finance.outstandingFinance ? '#dc3545' : '#28a745',
              color: 'white'
            }}>
              {data.history.accidents > 0 || data.finance.outstandingFinance ? 'CAUTION' : 'CLEAR'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
        
        {/* Vehicle Details Panel */}
        <div style={{ padding: '20px', borderRight: '1px solid #dee2e6' }}>
          <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>
            Vehicle Details
          </h6>
          <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8' }}>
            <tbody>
              <tr><td style={{ width: '40%', color: '#6c757d' }}>Registration:</td><td style={{ fontWeight: '500' }}>{data.registration}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>VIN:</td><td style={{ fontWeight: '500', fontFamily: 'monospace', fontSize: '12px' }}>{data.vin}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Make:</td><td style={{ fontWeight: '500' }}>{data.make}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Model:</td><td style={{ fontWeight: '500' }}>{data.model}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Year:</td><td style={{ fontWeight: '500' }}>{data.year}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Engine:</td><td style={{ fontWeight: '500' }}>{data.engine}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Fuel:</td><td style={{ fontWeight: '500' }}>{data.fuel}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Color:</td><td style={{ fontWeight: '500' }}>{data.color}</td></tr>
            </tbody>
          </table>
        </div>

        {/* History & Status Panel */}
        <div style={{ padding: '20px', borderRight: '1px solid #dee2e6' }}>
          <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
            History & Status
          </h6>
          <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', color: '#6c757d' }}>Previous Owners:</td>
                <td style={{ fontWeight: '500' }}>{data.history.previousOwners}</td>
              </tr>
              <tr>
                <td style={{ color: '#6c757d' }}>Accidents:</td>
                <td>
                  <span style={{
                    fontWeight: 'bold',
                    color: data.history.accidents > 0 ? '#dc3545' : '#28a745',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: data.history.accidents > 0 ? '#f8d7da' : '#d4edda'
                  }}>
                    {data.history.accidents}
                  </span>
                </td>
              </tr>
              <tr><td style={{ color: '#6c757d' }}>Service History:</td><td style={{ fontWeight: '500' }}>{data.history.serviceHistory}</td></tr>
              <tr>
                <td style={{ color: '#6c757d' }}>NCT Status:</td>
                <td>
                  <span style={{
                    fontWeight: 'bold',
                    color: data.history.nctStatus === 'Pass' ? '#28a745' : '#dc3545',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: data.history.nctStatus === 'Pass' ? '#d4edda' : '#f8d7da'
                  }}>
                    {data.history.nctStatus}
                  </span>
                </td>
              </tr>
              <tr><td style={{ color: '#6c757d' }}>NCT Expiry:</td><td style={{ fontWeight: '500' }}>{data.history.nctExpiry}</td></tr>
              <tr>
                <td style={{ color: '#6c757d' }}>Outstanding Finance:</td>
                <td>
                  <span style={{
                    fontWeight: 'bold',
                    color: data.finance.outstandingFinance ? '#dc3545' : '#28a745',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: data.finance.outstandingFinance ? '#f8d7da' : '#d4edda'
                  }}>
                    {data.finance.outstandingFinance ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Get Valuation Panel */}
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
              Get an accurate, up-to-date valuation for this {data.make} {data.model} based on current market conditions.
            </p>
            <a
              href={`/valuation?reg=${encodeURIComponent(data.registration)}`}
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
  );

  const renderValuationDetails = (data) => (
    <div style={{ marginTop: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#28a745', color: 'white', padding: '15px 20px' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>💰 Vehicle Valuation Report</h4>
      </div>

      {/* Vehicle Summary */}
      <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'center' }}>
          <div>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#495057' }}>{data.vehicle.make} {data.vehicle.model}</h5>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>{data.vehicle.year} • {data.factors.condition} condition</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>MILEAGE</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#495057' }}>{data.factors.mileage.toLocaleString()} km</div>
          </div>
        </div>
      </div>

      {/* Valuation Grid */}
      <div style={{ padding: '20px' }}>
        <h6 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>
          Current Market Valuation
        </h6>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '12px', border: '2px solid #007bff' }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trade-In Value
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff', marginBottom: '8px' }}>
              €{data.valuation.trade.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              What dealers typically pay
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '12px', border: '2px solid #28a745' }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Private Sale
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745', marginBottom: '8px' }}>
              €{data.valuation.private.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              Selling to another individual
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '12px', border: '2px solid #ff9800' }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Retail Value
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
              €{data.valuation.retail.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#6c757d' }}>
              What dealers typically charge
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h6 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
            Vehicle Details
          </h6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '13px' }}>
            <div><span style={{ color: '#6c757d' }}>Vehicle:</span> <strong>{data.vehicle.make} {data.vehicle.model}</strong></div>
            <div><span style={{ color: '#6c757d' }}>Year:</span> <strong>{data.vehicle.year}</strong></div>
            <div><span style={{ color: '#6c757d' }}>Condition:</span> <strong style={{ textTransform: 'capitalize' }}>{data.factors.condition}</strong></div>
            <div><span style={{ color: '#6c757d' }}>Market Trend:</span> <strong style={{ textTransform: 'capitalize' }}>{data.factors.marketTrend}</strong></div>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: '#6c757d', textAlign: 'center', margin: '15px 0 0 0' }}>
          Valuations last updated: {data.valuation.lastUpdated}
        </p>
      </div>
    </div>
  );

  const renderVINDetails = (data) => (
    <div style={{ marginTop: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#17a2b8', color: 'white', padding: '15px 20px' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>🔍 VIN Check Report</h4>
      </div>

      {/* VIN Display */}
      <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <div style={{
          fontSize: '24px',
          fontFamily: 'monospace',
          letterSpacing: '3px',
          marginBottom: '15px',
          color: '#495057',
          fontWeight: 'bold',
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '2px solid #dee2e6'
        }}>
          {data.vin}
        </div>
        <div style={{
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: data.valid ? '#28a745' : '#dc3545',
          color: 'white'
        }}>
          {data.valid ? '✓ VALID VIN' : '✗ INVALID VIN'}
        </div>
      </div>

      {/* VIN Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0' }}>
        
        {/* Basic VIN Info */}
        <div style={{ padding: '20px', borderRight: '1px solid #dee2e6' }}>
          <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '5px' }}>
            VIN Decoded Information
          </h6>
          <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8' }}>
            <tbody>
              <tr><td style={{ width: '40%', color: '#6c757d' }}>Valid:</td><td><span style={{ fontWeight: 'bold', color: data.valid ? '#28a745' : '#dc3545' }}>{data.valid ? 'Yes' : 'No'}</span></td></tr>
              <tr><td style={{ color: '#6c757d' }}>Country:</td><td style={{ fontWeight: '500' }}>{data.country}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Manufacturer:</td><td style={{ fontWeight: '500' }}>{data.manufacturer}</td></tr>
              <tr><td style={{ color: '#6c757d' }}>Model Year:</td><td style={{ fontWeight: '500' }}>{data.year}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Database Match */}
        <div style={{ padding: '20px' }}>
          {data.found && data.vehicle ? (
            <>
              <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                ✓ Vehicle Found in Database
              </h6>
              <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8' }}>
                <tbody>
                  <tr><td style={{ width: '40%', color: '#6c757d' }}>Registration:</td><td style={{ fontWeight: '500' }}>{data.vehicle.registration}</td></tr>
                  <tr><td style={{ color: '#6c757d' }}>Make:</td><td style={{ fontWeight: '500' }}>{data.vehicle.make}</td></tr>
                  <tr><td style={{ color: '#6c757d' }}>Model:</td><td style={{ fontWeight: '500' }}>{data.vehicle.model}</td></tr>
                  <tr><td style={{ color: '#6c757d' }}>Year:</td><td style={{ fontWeight: '500' }}>{data.vehicle.year}</td></tr>
                  <tr><td style={{ color: '#6c757d' }}>Engine:</td><td style={{ fontWeight: '500' }}>{data.vehicle.engine}</td></tr>
                  <tr><td style={{ color: '#6c757d' }}>Fuel:</td><td style={{ fontWeight: '500' }}>{data.vehicle.fuel}</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h6 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#ffc107', borderBottom: '2px solid #ffc107', paddingBottom: '5px' }}>
                ⚠ Vehicle Not Found in Database
              </h6>
              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                fontSize: '14px',
                color: '#856404'
              }}>
                This VIN is valid but the vehicle details are not available in our Irish vehicle database.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px'
      }}>
        Loading your checks history...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1000px',
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
            Your Checks History
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            View all your previous vehicle checks. You can access these results anytime at no extra cost.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[
              { key: 'all', label: 'All Checks', icon: '📄' },
              { key: 'history', label: 'History Checks', icon: '📋' },
              { key: 'valuation', label: 'Valuations', icon: '💰' },
              { key: 'vin', label: 'VIN Checks', icon: '🔍' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  backgroundColor: filter === tab.key ? '#007bff' : 'transparent',
                  color: filter === tab.key ? 'white' : '#495057',
                  border: `2px solid ${filter === tab.key ? '#007bff' : '#dee2e6'}`,
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (filter !== tab.key) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== tab.key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '16px',
          color: '#6c757d'
        }}>
          {filteredTransactions.length === 0 ? (
            'No checks found'
          ) : (
            `Showing ${filteredTransactions.length} check${filteredTransactions.length !== 1 ? 's' : ''}`
          )}
        </div>

        {/* Checks List */}
        {filteredTransactions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '24px',
              color: '#495057',
              marginBottom: '15px'
            }}>
              No Checks Yet
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '30px'
            }}>
              You haven't performed any vehicle checks yet. Start by checking a vehicle's history, getting a valuation, or verifying a VIN.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/irish-history-check"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
              >
                📋 History Check
              </a>
              <a
                href="/valuation"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
              >
                💰 Get Valuation
              </a>
              <a
                href="/vin-checker"
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
              >
                🔍 Check VIN
              </a>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {filteredTransactions.map((transaction, index) => {
              const serviceType = getServiceType(transaction);
              const vehicleInfo = extractVehicleInfo(transaction);
              const isExpanded = expandedTransaction === transaction.id;
              
              return (
                <div
                  key={transaction.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: `3px solid ${getServiceColor(serviceType)}20`,
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Service Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: getServiceColor(serviceType),
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {getServiceIcon(serviceType)}
                    </div>

                    {/* Check Details */}
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        color: '#495057',
                        marginBottom: '8px'
                      }}>
                        {getServiceName(serviceType)}
                      </h3>
                      <div style={{
                        fontSize: '16px',
                        color: '#6c757d',
                        marginBottom: '5px'
                      }}>
                        <strong>Vehicle:</strong> {vehicleInfo}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6c757d'
                      }}>
                        {new Date(transaction.timestamp).toLocaleDateString('en-IE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* View Full Report Button */}
                    {transaction.checkData && (
                      <button
                        onClick={() => toggleExpanded(transaction.id)}
                        style={{
                          backgroundColor: getServiceColor(serviceType),
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        {isExpanded ? 'Hide Details' : 'View Full Report'}
                      </button>
                    )}

                    {/* Cost */}
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#dc3545'
                      }}>
                        -€{transaction.amount.toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        backgroundColor: '#f8f9fa',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        marginTop: '5px'
                      }}>
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Expandable Detailed View */}
                  {isExpanded && renderDetailedView(transaction)}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div style={{
            marginTop: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              textAlign: 'center',
              marginBottom: '25px',
              color: '#495057'
            }}>
              Your Checking Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#007bff',
                  marginBottom: '5px'
                }}>
                  {transactions.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  Total Checks
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#dc3545',
                  marginBottom: '5px'
                }}>
                  €{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  Total Spent
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginBottom: '5px'
                }}>
                  €{(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toFixed(2)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  Average Cost
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}