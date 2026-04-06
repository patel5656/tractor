import { createContext, useContext, useState, useEffect } from 'react';
import { serviceRates as initialRates, dummySettings as initialSettings } from '../data/dummyData';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const auth = useAuth() || {};
  const { role } = auth;
  
  const [generalInfo, setGeneralInfo] = useState({
    hubName: "TractorLink Admin HQ",
    hubLocation: "Ludhiana Central Command",
    supportEmail: "support@dummy.com",
    contactEmail: "ops@dummy.com",
    baseLatitude: 30.9009,
    baseLongitude: 75.8572
  });

  const [fuelMetrics, setFuelMetrics] = useState({
    dieselPrice: 0,
    avgMileage: 1,
    fuelCostPerKm: 0,
    lastUpdated: new Date().toISOString()
  });

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    serviceIntervalHours: 250,
    preAlertHours: 50
  });

  const [zones, setZones] = useState([]);
  const [serviceRates, setServiceRates] = useState(initialRates);
  const [systemServices, setSystemServices] = useState([]);

  const fetchGlobalSettings = async () => {
    try {
      // Role-based configuration fetching to avoid 403 Forbidden
      const configRes = role === 'admin' 
        ? await api.admin.getSystemConfig() 
        : await api.farmer.getSystemConfig();

      if (configRes.success) {
        const { hubName, hubLocation, supportEmail, contactEmail, dieselPrice, avgMileage, fuelCostPerKm, serviceIntervalHours, preAlertHours, updatedAt, baseLatitude, baseLongitude, perKmRate } = configRes.data;
        
        setGeneralInfo({ 
          hubName, hubLocation, supportEmail, contactEmail,
          baseLatitude: baseLatitude ?? 0,
          baseLongitude: baseLongitude ?? 0
        });
        setFuelMetrics({ dieselPrice, avgMileage, fuelCostPerKm, lastUpdated: updatedAt });
        setMaintenanceSettings({ serviceIntervalHours, preAlertHours });
      }
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    }

    try {
      const zoneRes = role === 'admin' ? await api.admin.listZones() : await api.farmer.listZones();
      if (zoneRes.success) setZones(zoneRes.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await api.farmer.listServices();
        if (result.success) {
          const rates = {};
          result.data.forEach(s => {
            const label = s.name.charAt(0).toUpperCase() + s.name.slice(1);
            rates[label] = s.baseRatePerHectare;
          });
          setServiceRates(rates);
          setSystemServices(result.data);
        }
      } catch (error) {
        if (!error.message.includes('permission')) {
          console.error('Failed to fetch services:', error);
        }
      }
    };

    if (role) {
      if (role === 'farmer') fetchServices();
      fetchGlobalSettings();
    }
  }, [role]);

  const updateGeneral = async (data) => {
    try {
      const res = await api.admin.updateSystemConfig(data);
      if (res.success) {
        setGeneralInfo(prev => ({ ...prev, ...data }));
      }
      return res;
    } catch (error) {
      throw error;
    }
  };
  
  const updateFuelPrice = async (dieselPrice, avgMileage) => {
    try {
      const res = await api.admin.updateSystemConfig({ dieselPrice: parseFloat(dieselPrice), avgMileage: parseFloat(avgMileage) });
      if (res.success) {
        const { dieselPrice, avgMileage, fuelCostPerKm, updatedAt } = res.data;
        setFuelMetrics({ dieselPrice, avgMileage, fuelCostPerKm, lastUpdated: updatedAt });
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  const refreshZones = async () => {
    try {
      const res = await api.admin.listZones();
      if (res.success) setZones(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const updateServiceRates = async (newRates) => {
    try {
      // API call to persist rates on the backend
      const res = await api.admin.updateServiceRates(newRates);
      if (res.success) {
        setServiceRates(prev => ({ ...prev, ...newRates }));
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  const updateMaintenance = async (data) => {
    try {
      const res = await api.admin.updateSystemConfig(data);
      if (res.success) {
        setMaintenanceSettings(prev => ({ ...prev, ...data }));
      }
      return res;
    } catch (error) {
       throw error;
    }
  };

  const value = {
    generalInfo,
    fuelMetrics,
    zones,
    serviceRates,
    systemServices,
    maintenanceSettings,
    updateGeneral,
    updateFuelPrice,
    refreshZones,
    updateServiceRates,
    updateMaintenance
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
