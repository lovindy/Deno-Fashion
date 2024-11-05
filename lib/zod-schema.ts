import { z } from 'zod';

// Enums with clear error messages
export const UserRoleEnum = z.enum(['ADMIN', 'CUSTOMER'], {
  errorMap: () => ({ message: 'User role must be either ADMIN or CUSTOMER' }),
});

export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER'], {
  errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
});

export const AddressTypeEnum = z.enum(['SHIPPING', 'BILLING', 'BOTH'], {
  errorMap: () => ({
    message: 'Address type must be SHIPPING, BILLING, or BOTH',
  }),
});

export const OrderStatusEnum = z.enum(
  [
    'PENDING',
    'PROCESSING',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ],
  {
    errorMap: () => ({ message: 'Invalid order status provided' }),
  }
);

export const PaymentStatusEnum = z.enum(
  ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', ' REFUNDED', 'VOIDED'],
  {
    errorMap: () => ({ message: 'Invalid payment status provided' }),
  }
);

export const PaymentMethodEnum = z.enum(
  ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTO'],
  {
    errorMap: () => ({ message: 'Invalid payment method provided' }),
  }
);

// User Measurements Schema
export const userMeasurementSchema = z.object({
  chest: z
    .number()
    .positive('Chest measurement must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  waist: z
    .number()
    .positive('Waist measurement must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  hip: z
    .number()
    .positive('Hip measurement must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  inseam: z
    .number()
    .positive('Inseam measurement must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  shoulder: z
    .number()
    .positive('Shoulder measurement must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  height: z
    .number()
    .positive('Height must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
  weight: z
    .number()
    .positive('Weight must be a positive number')
    .optional()
    .transform((val) => val?.toFixed(2)),
});

// Marketing Preferences Schema
export const marketingPreferencesSchema = z.object({
  email: z
    .boolean({
      required_error: 'Email preference is required',
      invalid_type_error: 'Email preference must be a boolean',
    })
    .default(true),
  sms: z
    .boolean({
      required_error: 'SMS preference is required',
      invalid_type_error: 'SMS preference must be a boolean',
    })
    .default(false),
  push: z
    .boolean({
      required_error: 'Push notification preference is required',
      invalid_type_error: 'Push notification preference must be a boolean',
    })
    .default(false),
});

// User Schema
export const userSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format'),
  role: UserRoleEnum.default('CUSTOMER'),
  firstName: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters'),
  phone: z
    .string({
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  dateOfBirth: z
    .date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Invalid date format for date of birth',
    })
    .optional()
    .refine((date) => {
      if (date) {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 13;
      }
      return true;
    }, 'User must be at least 13 years old'),
  gender: GenderEnum.optional(),
  imageUrl: z
    .string({
      invalid_type_error: 'Image URL must be a string',
    })
    .url('Invalid image URL format')
    .optional(),
  newsletterSubscription: z
    .boolean({
      invalid_type_error: 'Newsletter subscription must be a boolean',
    })
    .default(false),
  marketingPreferences: marketingPreferencesSchema.optional(),
  sizeMeasurements: userMeasurementSchema.optional(),
});

// Address Schema
export const addressSchema = z.object({
  type: AddressTypeEnum,
  isDefault: z
    .boolean({
      invalid_type_error: 'Default status must be a boolean',
    })
    .default(false),
  firstName: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters'),
  company: z
    .string({
      invalid_type_error: 'Company name must be a string',
    })
    .max(100, 'Company name cannot exceed 100 characters')
    .optional(),
  address1: z
    .string({
      required_error: 'Address line 1 is required',
      invalid_type_error: 'Address line 1 must be a string',
    })
    .min(1, 'Address line 1 cannot be empty')
    .max(100, 'Address line 1 cannot exceed 100 characters'),
  address2: z
    .string({
      invalid_type_error: 'Address line 2 must be a string',
    })
    .max(100, 'Address line 2 cannot exceed 100 characters')
    .optional(),
  city: z
    .string({
      required_error: 'City is required',
      invalid_type_error: 'City must be a string',
    })
    .min(1, 'City cannot be empty')
    .max(50, 'City cannot exceed 50 characters'),
  state: z
    .string({
      required_error: 'State is required',
      invalid_type_error: 'State must be a string',
    })
    .min(1, 'State cannot be empty')
    .max(50, 'State cannot exceed 50 characters'),
  postalCode: z
    .string({
      required_error: 'Postal code is required',
      invalid_type_error: 'Postal code must be a string',
    })
    .min(1, 'Postal code cannot be empty')
    .max(20, 'Postal code cannot exceed 20 characters'),
  country: z
    .string({
      required_error: 'Country is required',
      invalid_type_error: 'Country must be a string',
    })
    .min(1, 'Country cannot be empty')
    .max(50, 'Country cannot exceed 50 characters'),
  phone: z
    .string({
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

// Product Variant Schema (from your existing code, enhanced with clear messages)
export const variantSchema = z.object({
  sku: z
    .string({
      required_error: 'SKU is required',
      invalid_type_error: 'SKU must be a string',
    })
    .min(1, 'SKU cannot be empty')
    .max(50, 'SKU cannot exceed 50 characters'),
  colorId: z
    .string({
      required_error: 'Color ID is required',
      invalid_type_error: 'Color ID must be a string',
    })
    .min(1, 'Color ID cannot be empty'),
  sizeId: z
    .string({
      required_error: 'Size ID is required',
      invalid_type_error: 'Size ID must be a string',
    })
    .min(1, 'Size ID cannot be empty'),
  stock: z
    .number({
      required_error: 'Stock quantity is required',
      invalid_type_error: 'Stock must be a number',
    })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  price: z
    .number({
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than zero')
    .transform((val) => parseFloat(val.toFixed(2)))
    .optional(),
});

// Product Image Schema (from your existing code, enhanced with clear messages)
export const imageSchema = z.object({
  url: z
    .string({
      required_error: 'Image URL is required',
      invalid_type_error: 'Image URL must be a string',
    })
    .url('Invalid image URL format'),
  alt: z
    .string({
      invalid_type_error: 'Alt text must be a string',
    })
    .min(1, 'Alt text cannot be empty')
    .max(100, 'Alt text cannot exceed 100 characters')
    .optional(),
  isDefault: z
    .boolean({
      invalid_type_error: 'Default status must be a boolean',
    })
    .default(false),
});

// Product Schema (from your existing code, enhanced with clear messages)
export const productSchema = z
  .object({
    name: z
      .string({
        required_error: 'Product name is required',
        invalid_type_error: 'Product name must be a string',
      })
      .min(1, 'Product name cannot be empty')
      .max(100, 'Product name cannot exceed 100 characters'),
    description: z
      .string({
        required_error: 'Product description is required',
        invalid_type_error: 'Product description must be a string',
      })
      .min(1, 'Product description cannot be empty')
      .max(2000, 'Product description cannot exceed 2000 characters'),
    price: z
      .number({
        required_error: 'Price is required',
        invalid_type_error: 'Price must be a number',
      })
      .positive('Price must be greater than zero')
      .transform((val) => parseFloat(val.toFixed(2))),
    comparePrice: z
      .number({
        invalid_type_error: 'Compare price must be a number',
      })
      .positive('Compare price must be greater than zero')
      .transform((val) => parseFloat(val.toFixed(2)))
      .optional(),
    cost: z
      .number({
        required_error: 'Cost is required',
        invalid_type_error: 'Cost must be a number',
      })
      .positive('Cost must be greater than zero')
      .transform((val) => parseFloat(val.toFixed(2))),
    brandId: z
      .string({
        required_error: 'Brand ID is required',
        invalid_type_error: 'Brand ID must be a string',
      })
      .min(1, 'Brand ID cannot be empty'),
    sku: z
      .string({
        required_error: 'SKU is required',
        invalid_type_error: 'SKU must be a string',
      })
      .min(1, 'SKU cannot be empty')
      .max(50, 'SKU cannot exceed 50 characters'),
    slug: z
      .string({
        required_error: 'Slug is required',
        invalid_type_error: 'Slug must be a string',
      })
      .min(1, 'Slug cannot be empty')
      .max(100, 'Slug cannot exceed 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    variants: z.array(variantSchema).optional().default([]),
    images: z.array(imageSchema).optional().default([]),
  })
  .refine((data) => !data.comparePrice || data.comparePrice >= data.cost, {
    message: 'Compare price must be greater than or equal to cost',
    path: ['comparePrice'],
  });

// Cart Schema (from your existing code, enhanced with clear messages)
export const cartSchema = z.object({
  productId: z
    .string({
      required_error: 'Product ID is required',
      invalid_type_error: 'Product ID must be a string',
    })
    .uuid('Invalid Product ID format'),
  variantId: z
    .string({
      required_error: 'Variant ID is required',
      invalid_type_error: 'Variant ID must be a string',
    })
    .uuid('Invalid Variant ID format'),
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than zero'),
});
