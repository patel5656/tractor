import prisma from '../config/db.js';

// ─── SYSTEM CONFIGURATION (Singleton) ────────────────────────────

/**
 * Get system configuration. Creates default if not exists.
 */
export const getSystemConfig = async () => {
  let config = await prisma.systemConfig.findUnique({ where: { id: 1 } });

  if (!config) {
    config = await prisma.systemConfig.create({
      data: { id: 1 }
    });
  }

  return {
    // General
    hubName: config.hubName,
    hubLocation: config.hubLocation,
    supportEmail: config.supportEmail,
    contactEmail: config.contactEmail,
    // Hub Coordinates
    baseLatitude: config.baseLatitude,
    baseLongitude: config.baseLongitude,
    // Fuel
    dieselPrice: config.dieselPrice,
    avgMileage: config.avgMileage,
    fuelCostPerKm: config.avgMileage > 0
      ? parseFloat((config.dieselPrice / config.avgMileage).toFixed(2))
      : 0,
    // Maintenance
    serviceIntervalHours: config.serviceIntervalHours,
    preAlertHours: config.preAlertHours,
    updatedAt: config.updatedAt
  };
};

/**
 * Update system configuration.
 */
export const updateSystemConfig = async (data) => {
  const updatePayload = {};
  if (data.hubName !== undefined) updatePayload.hubName = data.hubName;
  if (data.hubLocation !== undefined) updatePayload.hubLocation = data.hubLocation;
  if (data.supportEmail !== undefined) updatePayload.supportEmail = data.supportEmail;
  if (data.contactEmail !== undefined) updatePayload.contactEmail = data.contactEmail;
  if (data.dieselPrice !== undefined) updatePayload.dieselPrice = data.dieselPrice;
  if (data.avgMileage !== undefined) updatePayload.avgMileage = data.avgMileage;
  if (data.serviceIntervalHours !== undefined) updatePayload.serviceIntervalHours = data.serviceIntervalHours;
  if (data.preAlertHours !== undefined) updatePayload.preAlertHours = data.preAlertHours;
  if (data.baseLatitude !== undefined) updatePayload.baseLatitude = data.baseLatitude;
  if (data.baseLongitude !== undefined) updatePayload.baseLongitude = data.baseLongitude;
  if (data.perKmRate !== undefined) updatePayload.perKmRate = data.perKmRate;

  const config = await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: updatePayload,
    create: { id: 1, ...updatePayload }
  });

  return {
    ...config,
    fuelCostPerKm: config.avgMileage > 0 
      ? parseFloat((config.dieselPrice / config.avgMileage).toFixed(2))
      : 0
  };
};

// ─── DISTANCE ZONES ──────────────────────────────────────────────

/**
 * List all zones.
 */
export const listZones = async () => {
  return await prisma.zone.findMany({
    orderBy: { minDistance: 'asc' }
  });
};

/**
 * Get a single zone by ID.
 */
export const getZoneById = async (id) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');
  return zone;
};

/**
 * Create a new zone.
 */
export const createZone = async (name, minDistance, maxDistance, surchargePerHectare) => {
  if (!name || name.trim().length === 0) throw new Error('Zone name is required');
  
  const min = parseFloat(minDistance);
  const max = parseFloat(maxDistance);
  const surcharge = parseFloat(surchargePerHectare);

  if (isNaN(min) || min < 0) throw new Error('Minimum distance must be a valid non-negative number');
  if (isNaN(max) || max <= min) throw new Error('Maximum distance must be greater than minimum distance');
  if (isNaN(surcharge) || surcharge < 0) throw new Error('Surcharge must be zero or a positive number');

  const existingName = await prisma.zone.findUnique({ where: { name: name.trim() } });
  if (existingName) throw new Error('A zone with this name already exists');

  // Check for overlaps
  const allZones = await prisma.zone.findMany();
  for (const z of allZones) {
    if (Math.max(min, z.minDistance) < Math.min(max, z.maxDistance)) {
      throw new Error(`Distance range overlaps with existing zone: ${z.name} (${z.minDistance}-${z.maxDistance} km)`);
    }
  }

  return await prisma.zone.create({
    data: { 
      name: name.trim(), 
      minDistance: min,
      maxDistance: max, 
      surchargePerHectare: surcharge 
    }
  });
};

/**
 * Update an existing zone.
 */
export const updateZone = async (id, name, minDistance, maxDistance, surchargePerHectare) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');

  const data = {};
  if (name !== undefined) data.name = name.trim();
  
  let newMin = minDistance !== undefined ? parseFloat(minDistance) : zone.minDistance;
  let newMax = maxDistance !== undefined ? parseFloat(maxDistance) : zone.maxDistance;
  
  if (minDistance !== undefined || maxDistance !== undefined) {
    if (newMax <= newMin) throw new Error('Maximum distance must be greater than minimum distance');
    if (newMin < 0) throw new Error('Minimum distance cannot be negative');
    
    // Check for overlaps excluding the current zone
    const allZones = await prisma.zone.findMany({ where: { id: { not: parseInt(id) } } });
    for (const z of allZones) {
      if (Math.max(newMin, z.minDistance) < Math.min(newMax, z.maxDistance)) {
        throw new Error(`Distance range overlaps with existing zone: ${z.name} (${z.minDistance}-${z.maxDistance} km)`);
      }
    }
    
    if (minDistance !== undefined) data.minDistance = newMin;
    if (maxDistance !== undefined) data.maxDistance = newMax;
  }

  if (surchargePerHectare !== undefined) {
    const surcharge = parseFloat(surchargePerHectare);
    if (isNaN(surcharge) || surcharge < 0) throw new Error('Surcharge must be zero or a positive number');
    data.surchargePerHectare = surcharge;
  }

  return await prisma.zone.update({
    where: { id: parseInt(id) },
    data
  });
};

/**
 * Delete a zone.
 */
export const deleteZone = async (id) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(id) } });
  if (!zone) throw new Error('Zone not found');

  await prisma.zone.delete({ where: { id: parseInt(id) } });
  return { success: true };
};

// ─── SERVICES ────────────────────────────────────────────────────

/**
 * Update service rates in bulk.
 */
export const updateServiceRates = async (ratesMap) => {
  const updatedServices = [];
  for (const [name, rate] of Object.entries(ratesMap)) {
    const rawName = name.toLowerCase();
    const service = await prisma.service.findUnique({ where: { name: rawName } });
    if (service) {
      const updated = await prisma.service.update({
        where: { name: rawName },
        data: { baseRatePerHectare: parseFloat(rate) }
      });
      updatedServices.push(updated);
    }
  }
  return updatedServices;
};
