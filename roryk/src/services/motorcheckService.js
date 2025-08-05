// Mock MotorCheck.ie API Service
// This service simulates the functionality of MotorCheck.ie API
// Can be easily replaced with real API calls when available

const mockVehicleData = {
  '12-D-12345': {
    registration: '12-D-12345',
    vin: 'WVWZZZ1JZ3W386752',
    make: 'Volkswagen',
    model: 'Golf',
    variant: '1.6 TDI Comfortline',
    year: 2012,
    engine: '1.6 TDI',
    engineSize: 1598,
    fuel: 'Diesel',
    transmission: 'Manual',
    color: 'Blue',
    doors: 5,
    seats: 5,
    co2Emissions: 109,
    taxClass: 'A',
    history: {
      previousOwners: 2,
      accidents: 0,
      serviceHistory: 'Full',
      mileageVerified: true,
      lastNCT: '2023-08-15',
      nctStatus: 'Pass',
      nctExpiry: '2025-08-15',
      taxExpiry: '2024-12-31',
      insuranceWriteOff: false,
      stolen: false,
      imported: false,
      commercialUse: false
    },
    finance: {
      outstandingFinance: false,
      financeCompany: null,
      writeOff: false,
      writeOffCategory: null,
      stolen: false
    },
    specifications: {
      bodyType: 'Hatchback',
      wheelbase: 2578,
      length: 4199,
      width: 1786,
      height: 1479,
      weight: 1320,
      maxSpeed: 190,
      acceleration: 10.5,
      fuelConsumption: {
        urban: 4.2,
        extraUrban: 3.4,
        combined: 3.7
      }
    }
  },
  '13-KE-5678': {
    registration: '13-KE-5678',
    vin: '1HGBH41JXMN109186',
    make: 'Honda',
    model: 'Civic',
    variant: '1.8 i-VTEC Sport',
    year: 2013,
    engine: '1.8 i-VTEC',
    engineSize: 1799,
    fuel: 'Petrol',
    transmission: 'Manual',
    color: 'Red',
    doors: 5,
    seats: 5,
    co2Emissions: 139,
    taxClass: 'B',
    history: {
      previousOwners: 1,
      accidents: 1,
      serviceHistory: 'Partial',
      mileageVerified: true,
      lastNCT: '2023-11-20',
      nctStatus: 'Pass',
      nctExpiry: '2025-11-20',
      taxExpiry: '2024-10-31',
      insuranceWriteOff: false,
      stolen: false,
      imported: false,
      commercialUse: false
    },
    finance: {
      outstandingFinance: true,
      financeCompany: 'Bank of Ireland Finance',
      writeOff: false,
      writeOffCategory: null,
      stolen: false
    },
    specifications: {
      bodyType: 'Hatchback',
      wheelbase: 2620,
      length: 4290,
      width: 1755,
      height: 1470,
      weight: 1320,
      maxSpeed: 200,
      acceleration: 8.6,
      fuelConsumption: {
        urban: 7.1,
        extraUrban: 4.8,
        combined: 5.7
      }
    }
  },
  '14-D-9999': {
    registration: '14-D-9999',
    vin: 'WBA3A5C50DF123456',
    make: 'BMW',
    model: '320d',
    variant: '320d SE',
    year: 2014,
    engine: '2.0 TDI',
    engineSize: 1995,
    fuel: 'Diesel',
    transmission: 'Automatic',
    color: 'Black',
    doors: 4,
    seats: 5,
    co2Emissions: 109,
    taxClass: 'A',
    history: {
      previousOwners: 3,
      accidents: 2,
      serviceHistory: 'Full',
      mileageVerified: false,
      lastNCT: '2023-05-10',
      nctStatus: 'Fail',
      nctExpiry: '2024-05-10',
      taxExpiry: '2024-09-30',
      insuranceWriteOff: true,
      stolen: false,
      imported: true,
      commercialUse: true
    },
    finance: {
      outstandingFinance: false,
      financeCompany: null,
      writeOff: true,
      writeOffCategory: 'Category C',
      stolen: false
    },
    specifications: {
      bodyType: 'Saloon',
      wheelbase: 2810,
      length: 4624,
      width: 1811,
      height: 1429,
      weight: 1505,
      maxSpeed: 230,
      acceleration: 7.2,
      fuelConsumption: {
        urban: 4.5,
        extraUrban: 3.9,
        combined: 4.1
      }
    }
  }
};

// Separate valuation data for valuation service only
const mockValuationData = {
  '12-D-12345': {
    trade: 8500,
    retail: 10200,
    private: 9300,
    currency: 'EUR',
    lastUpdated: '2024-01-15'
  },
  '13-KE-5678': {
    trade: 12500,
    retail: 14800,
    private: 13600,
    currency: 'EUR',
    lastUpdated: '2024-01-15'
  },
  '14-D-9999': {
    trade: 6500,
    retail: 8200,
    private: 7300,
    currency: 'EUR',
    lastUpdated: '2024-01-15'
  }
};

// VIN to Registration mapping for VIN-only lookups
const vinToRegistration = {
  'WVWZZZ1JZ3W386752': '12-D-12345',
  '1HGBH41JXMN109186': '13-KE-5678',
  'WBA3A5C50DF123456': '14-D-9999'
};

// Simulate API delay
const simulateDelay = (ms = 1500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Validate Irish registration format
const validateIrishRegistration = (registration) => {
  const irishRegex = /^\d{2,3}-[A-Z]{1,2}-\d{1,6}$/;
  return irishRegex.test(registration.toUpperCase());
};

// Validate VIN format
const validateVIN = (vin) => {
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin.toUpperCase());
};

// Generate random valuation based on vehicle age and make
const generateValuation = (vehicle) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - vehicle.year;
  const baseValue = {
    'BMW': 25000,
    'Mercedes': 28000,
    'Audi': 24000,
    'Volkswagen': 18000,
    'Honda': 16000,
    'Toyota': 17000,
    'Ford': 15000,
    'Opel': 12000
  };

  const base = baseValue[vehicle.make] || 15000;
  const depreciation = Math.pow(0.85, age); // 15% depreciation per year
  const trade = Math.round(base * depreciation * 0.7);
  const retail = Math.round(base * depreciation * 1.1);
  const privateSale = Math.round(base * depreciation * 0.9);

  return {
    trade,
    retail,
    private: privateSale,
    currency: 'EUR',
    lastUpdated: new Date().toISOString().split('T')[0]
  };
};

export const motorcheckService = {
  // Get vehicle history by registration
  async getVehicleHistory(registration) {
    await simulateDelay();
    
    if (!validateIrishRegistration(registration)) {
      throw new Error('Invalid Irish registration format. Please use format: 12-D-12345');
    }

    const normalizedReg = registration.toUpperCase();
    const vehicle = mockVehicleData[normalizedReg];
    
    if (!vehicle) {
      throw new Error('Vehicle not found in database. Please check the registration number.');
    }

    return {
      success: true,
      data: vehicle
    };
  },

  // Get vehicle valuation
  async getVehicleValuation(vehicleDetails) {
    await simulateDelay(1000);
    
    const { make, model, year, mileage, condition } = vehicleDetails;
    
    if (!make || !model || !year) {
      throw new Error('Make, model, and year are required for valuation.');
    }

    // Create mock vehicle for valuation
    const mockVehicle = {
      make: make,
      model: model,
      year: parseInt(year),
      mileage: parseInt(mileage) || 100000
    };

    let valuation = generateValuation(mockVehicle);
    
    // Adjust for condition
    const conditionMultiplier = {
      'excellent': 1.1,
      'good': 1.0,
      'fair': 0.85,
      'poor': 0.7
    };
    
    const multiplier = conditionMultiplier[condition] || 1.0;
    valuation.trade = Math.round(valuation.trade * multiplier);
    valuation.retail = Math.round(valuation.retail * multiplier);
    valuation.private = Math.round(valuation.private * multiplier);

    // Adjust for high mileage
    if (mileage > 150000) {
      valuation.trade = Math.round(valuation.trade * 0.9);
      valuation.retail = Math.round(valuation.retail * 0.9);
      valuation.private = Math.round(valuation.private * 0.9);
    }

    return {
      success: true,
      data: {
        vehicle: mockVehicle,
        valuation: valuation,
        factors: {
          condition: condition || 'good',
          mileage: mileage || 100000,
          marketTrend: 'stable'
        }
      }
    };
  },

  // Get vehicle valuation by registration
  async getVehicleValuationByReg(registration, additionalData = {}) {
    await simulateDelay(1000);
    
    if (!validateIrishRegistration(registration)) {
      throw new Error('Invalid Irish registration format. Please use format: 12-D-12345');
    }

    const normalizedReg = registration.toUpperCase();
    const vehicle = mockVehicleData[normalizedReg];
    const valuation = mockValuationData[normalizedReg];
    
    if (!vehicle || !valuation) {
      throw new Error('Vehicle not found in database. Please check the registration number.');
    }

    // Extract additional data
    const { odometer, odometerUnknown, validNCT } = additionalData;

    // Calculate base condition from vehicle history
    let baseCondition = vehicle.history.accidents > 0 ? 'fair' : 'good';
    
    // Adjust condition based on NCT status
    if (validNCT === false) {
      baseCondition = baseCondition === 'good' ? 'fair' : 'poor';
    }

    // Use provided odometer or simulate based on vehicle data
    let mileage;
    if (odometerUnknown) {
      mileage = 'Unknown';
    } else if (odometer) {
      mileage = parseInt(odometer);
    } else {
      // Simulate mileage based on vehicle age and previous owners
      mileage = vehicle.history.previousOwners * 50000 + Math.random() * 50000;
    }

    // Adjust valuation based on additional factors
    let adjustedValuation = { ...valuation };
    
    // Adjust for NCT status
    if (validNCT === false) {
      adjustedValuation.trade = Math.round(adjustedValuation.trade * 0.85);
      adjustedValuation.private = Math.round(adjustedValuation.private * 0.9);
      adjustedValuation.retail = Math.round(adjustedValuation.retail * 0.95);
    }

    // Adjust for high mileage (if known)
    if (typeof mileage === 'number' && mileage > 150000) {
      adjustedValuation.trade = Math.round(adjustedValuation.trade * 0.9);
      adjustedValuation.private = Math.round(adjustedValuation.private * 0.92);
      adjustedValuation.retail = Math.round(adjustedValuation.retail * 0.95);
    }

    // Use existing vehicle data and separate valuation data
    return {
      success: true,
      data: {
        vehicle: {
          registration: vehicle.registration,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          engine: vehicle.engine,
          fuel: vehicle.fuel
        },
        valuation: adjustedValuation,
        factors: {
          condition: baseCondition,
          mileage: mileage,
          marketTrend: 'stable',
          validNCT: validNCT,
          odometerUnknown: odometerUnknown
        }
      }
    };
  },

  // Check VIN
  async checkVIN(vin) {
    await simulateDelay(800);
    
    if (!validateVIN(vin)) {
      throw new Error('Invalid VIN format. VIN must be 17 characters long.');
    }

    const normalizedVIN = vin.toUpperCase();
    const registration = vinToRegistration[normalizedVIN];
    
    if (!registration) {
      // Generate basic VIN info even if not in our database
      return {
        success: true,
        data: {
          vin: normalizedVIN,
          valid: true,
          country: this.getCountryFromVIN(normalizedVIN),
          manufacturer: this.getManufacturerFromVIN(normalizedVIN),
          year: this.getYearFromVIN(normalizedVIN),
          found: false,
          message: 'VIN is valid but vehicle details not found in Irish database.'
        }
      };
    }

    const vehicle = mockVehicleData[registration];
    
    return {
      success: true,
      data: {
        vin: normalizedVIN,
        valid: true,
        found: true,
        vehicle: vehicle
      }
    };
  },

  // Helper methods for VIN decoding
  getCountryFromVIN(vin) {
    const countryCode = vin.charAt(0);
    const countryCodes = {
      '1': 'United States',
      '2': 'Canada',
      '3': 'Mexico',
      'J': 'Japan',
      'K': 'South Korea',
      'L': 'China',
      'S': 'United Kingdom',
      'V': 'France',
      'W': 'Germany',
      'Y': 'Sweden',
      'Z': 'Italy'
    };
    return countryCodes[countryCode] || 'Unknown';
  },

  getManufacturerFromVIN(vin) {
    const wmi = vin.substring(0, 3);
    const manufacturers = {
      'WVW': 'Volkswagen',
      '1HG': 'Honda',
      'WBA': 'BMW',
      'WDB': 'Mercedes-Benz',
      'WAU': 'Audi',
      'VF1': 'Renault',
      'VF7': 'Citroën',
      'WF0': 'Ford Europe'
    };
    return manufacturers[wmi] || 'Unknown';
  },

  getYearFromVIN(vin) {
    const yearCode = vin.charAt(9);
    const yearCodes = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024
    };
    return yearCodes[yearCode] || 'Unknown';
  }
};

export default motorcheckService;