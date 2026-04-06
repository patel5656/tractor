import { z } from 'zod';

export const bookingCreateSchema = z.object({
  serviceType: z.enum(['ploughing', 'harrowing', 'ridging', 'planting', 'harvesting'], {
    errorMap: () => ({ message: "Service type must be one of: ploughing, harrowing, ridging, planting, harvesting" })
  }),
  landSize: z.number().positive("Land size must be a positive number"),
  location: z.string().min(3, "Location must be at least 3 characters long"),
  zoneId: z.number().int().positive().optional().nullable(),
  farmerLatitude: z.number().optional().nullable(),
  farmerLongitude: z.number().optional().nullable()
});

export const pricePreviewSchema = bookingCreateSchema;

