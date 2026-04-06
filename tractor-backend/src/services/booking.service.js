import prisma from '../config/db.js';

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate booking price based on service rate, land size, and distance calculation.
 * 
 * Formula:
 *   airDistance    = haversine(baseLat, baseLng, farmerLat, farmerLng)
 *   roadDistance   = airDistance * 1.3
 *   Identify matching zone where minDistance <= roadDistance <= maxDistance
 *   distanceCharge = matchedZone.surchargePerHectare * landSize
 *   totalPrice     = serviceCost + distanceCharge
 */
export const calculateBookingPrice = async (serviceType, landSize, zoneId = null, farmerLat = null, farmerLng = null) => {
  // 1. Get service rate
  const service = await prisma.service.findUnique({
    where: { name: serviceType.toLowerCase() }
  });

  if (!service) {
    throw new Error(`Service type '${serviceType}' not found`);
  }

  const baseRate = service.baseRatePerHectare;
  const basePrice = baseRate * landSize;

  // 2. Get fuel config and Coordinates
  let dieselPrice = 0;
  let avgMileage = 1;
  let baseLatitude = null;
  let baseLongitude = null;
  let perKmRate = 500;

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (config) {
      dieselPrice = config.dieselPrice || 0;
      avgMileage = config.avgMileage > 0 ? config.avgMileage : 1;
      baseLatitude = config.baseLatitude;
      baseLongitude = config.baseLongitude;
      perKmRate = (config.perKmRate !== null && config.perKmRate !== undefined) ? config.perKmRate : 500;
    }
  } catch (e) {
    console.warn('[BookingService] Could not fetch SystemConfig, using defaults:', e.message);
  }

  const fuelCostPerKm = dieselPrice / avgMileage;

  // 3. Distance Calculations
  const airDistance = haversine(baseLatitude, baseLongitude, farmerLat, farmerLng);
  // Add 1.3 Terrain Factor Client Requirement
  const roadDistance = airDistance > 0 ? airDistance * 1.3 : 0;
  
  // 4. Track A - Zone Based Tiering Lookup
  let distanceCharge = 0;
  let distanceKm = roadDistance;
  let zoneName = "Within Hub Distance (Free)";
  
  if (roadDistance > 0) {
    // Lookup matching zone from database
    const allZones = await prisma.zone.findMany({
      orderBy: { minDistance: 'asc' }
    });
    
    // Find the tier that matches road_distance
    const matchedZone = allZones.find(z => roadDistance >= z.minDistance && roadDistance <= z.maxDistance);
    
    if (matchedZone) {
      zoneName = matchedZone.name;
      distanceCharge = parseFloat((matchedZone.surchargePerHectare * landSize).toFixed(2));
    } else if (allZones.length > 0) {
      // If beyond all zones, fallback to the highest zone for worst-case mapping or leave it
      const maxZone = allZones[allZones.length - 1];
      if (roadDistance > maxZone.maxDistance) {
        zoneName = `Long Distance (${maxZone.name} +)`;
        distanceCharge = parseFloat((maxZone.surchargePerHectare * landSize).toFixed(2));
      }
    }
  } else if (zoneId) {
     // Backward compatibility for old manual zone dropdown
     const oldZone = await prisma.zone.findUnique({ where: { id: parseInt(zoneId) } });
     if (oldZone) {
       distanceKm = oldZone.minDistance;
       distanceCharge = parseFloat((oldZone.surchargePerHectare * landSize).toFixed(2));
       zoneName = `Zone Fallback: ${oldZone.name}`;
     }
  }

  // 5. Calculate charges
  const fuelSurcharge = 0; // kept for schema compatibility (Phase 2)
  const totalPrice = parseFloat((basePrice + distanceCharge).toFixed(2));
  const finalPrice = totalPrice;

  return {
    serviceId: service.id,
    basePrice,
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    distanceCharge,
    fuelSurcharge,
    totalPrice,
    finalPrice,
    zoneName,
    airDistance: parseFloat(airDistance.toFixed(2)),
    roadDistance: parseFloat(roadDistance.toFixed(2))
  };
};

/**
 * Create a new booking for a farmer.
 */
export const createBookingRequest = async (farmerId, bookingData) => {
  const { serviceType, landSize, location, zoneId, farmerLatitude, farmerLongitude } = bookingData;

  const pricing = await calculateBookingPrice(serviceType, landSize, zoneId, farmerLatitude, farmerLongitude);

  const booking = await prisma.booking.create({
    data: {
      farmerId,
      serviceId: pricing.serviceId,
      landSize,
      location,
      basePrice: pricing.basePrice,
      distanceKm: pricing.distanceKm,
      distanceCharge: pricing.distanceCharge,
      fuelSurcharge: pricing.fuelSurcharge,
      totalPrice: pricing.totalPrice,
      finalPrice: pricing.finalPrice,
      zoneName: pricing.zoneName,
      farmerLatitude,
      farmerLongitude,
      airDistance: pricing.airDistance,
      roadDistance: pricing.roadDistance,
      status: 'scheduled'
    },
    include: {
      service: true
    }
  });

  return booking;
};

/**
 * Get all bookings for a specific farmer.
 */
export const getFarmerBookings = async (farmerId, query = {}) => {
  const { page = 1, limit = 6, status = 'all', search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = { farmerId };

  if (status !== 'all') {
    where.status = status.toLowerCase();
  }

  if (search) {
    const searchInt = parseInt(search);
    where.OR = [
      { service: { name: { contains: search } } }
    ];
    if (!isNaN(searchInt)) {
      where.OR.push({ id: searchInt });
    }
  }

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: true,
        payments: true
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count({ where })
  ]);

  return {
    bookings,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page),
      limit: take
    }
  };
};

/**
 * Get booking details by ID.
 */
export const getBookingById = async (bookingId, farmerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: {
      service: true
    }
  });

  if (!booking || booking.farmerId !== farmerId) {
    return null;
  }

  return booking;
};

