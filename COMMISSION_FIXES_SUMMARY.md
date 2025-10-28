# Commission System Admin CRUD Fixes - Summary

## Overview

Fixed the admin CRUD functionality to align with the new commission database schema defined in `20251027094734_commisions.sql`. The schema supports a hierarchical structure: Services → Styles → Pictures, with pictures able to be linked directly to services OR to specific styles.

## Key Schema Features

### Tables Structure

1. **services** - Main commission service offerings
2. **addons** - Additional options that can be linked to services
3. **service_addons** - Junction table linking addons to services with exclusivity enforcement
4. **styles** - Style variations within a service
5. **pictures** - Example images that can be linked to either:
   - A specific style (style_id provided)
   - Directly to a service (style_id is NULL)

### Important Constraints

- **Pictures table**: Requires `service_id` (NOT NULL) and optional `style_id` (nullable)
- **Addon exclusivity**: Enforced via a partial unique index and trigger
  - Exclusive addons can only be linked to ONE service
  - Non-exclusive addons can be shared across multiple services

## Changes Made

### 1. Actions File (`src/lib/actions/commissions.ts`)

#### Updated Functions:

- **`createPicture`**: Now requires `service_id` and accepts optional `style_id`

  ```typescript
  picture: {
    service_id: string;      // Required
    style_id?: string | null; // Optional
    image_url: string;
    caption?: string;
    is_primary_example?: boolean;
  }
  ```

- **`updatePicture`**: Updated type exclusions to prevent modifying `service_id`
  ```typescript
  updates: Partial<Omit<Picture, "picture_id" | "service_id" | "style_id" | "uploaded_at">>
  ```

#### New Functions:

- **`getPicturesForService`**: Fetches pictures directly linked to a service (where style_id IS NULL)

#### Enhanced Queries:

- **`getServiceById`**, **`getServiceBySlug`**, **`getActiveServices`**: All now include `pictures (*)` in their select queries to fetch both:
  - Pictures nested under styles
  - Pictures directly linked to the service

### 2. Picture Form (`src/components/admin/forms/PictureForm.tsx`)

#### Updated Props:

```typescript
type PictureFormProps = {
  serviceId: string;        // Required - the service this picture belongs to
  styleId?: string | null;  // Optional - if provided, picture is for this style
  picture?: Picture;
  onSubmit: (data: PictureFormData) => Promise<Picture | void>;
  onComplete: () => void;
  onCancel: () => void;
};
```

#### Key Changes:

- Form now accepts both `serviceId` (required) and `styleId` (optional)
- Upload path dynamically determined based on whether it's a style-specific or service-level picture
- Help text updates based on context

### 3. Services Client (`src/app/admin/services/ServicesClient.tsx`)

#### State Management:

- Added `pictureServiceId` state to track the service when managing pictures
- Maintains both `pictureServiceId` and `pictureStyleId` for proper context

#### New UI Section:

Added "Service Examples" section between Add-ons and Styles that:

- Displays pictures directly linked to the service (where `style_id` is null)
- Allows uploading pictures without selecting a style
- Shows explanatory text: "General examples for this service (not tied to a specific style)"
- Filters pictures to show only service-level ones: `.filter((p: any) => !p.style_id)`

#### Updated Handlers:

- Picture upload buttons now pass both `pictureServiceId` and `pictureStyleId` (can be null)
- Service-level pictures: `styleId` is explicitly set to `null`
- Style-specific pictures: both IDs are provided

### 4. Seed File (`supabase/seed.sql`)

#### Fixed Service Addons Insert:

Updated the `service_addons` insert to explicitly provide `addon_is_exclusive`:

```sql
INSERT INTO service_addons (service_id, addon_id, addon_is_exclusive)
SELECT
    s.service_id,
    a.addon_id,
    false -- This will be overwritten by the trigger
FROM ...
```

**Why?** The `addon_is_exclusive` column is NOT NULL, but the trigger `trg_set_addon_exclusive_flag` sets it automatically during BEFORE INSERT. Providing a dummy value ensures the insert doesn't fail.

## Admin Flow Summary

### For Services:

1. Create/Edit service with basic info (name, slug, price, etc.)
2. Link add-ons to the service (respecting exclusivity rules)
3. Upload service-level pictures (optional, for general examples)
4. Create style variations
5. Upload style-specific pictures

### For Pictures:

Two distinct flows:

**Service-Level Pictures** (No Style):

- Service → "Service Examples" section → Upload Picture
- `service_id` = current service
- `style_id` = NULL

**Style-Specific Pictures**:

- Service → Styles section → Style → Upload Picture
- `service_id` = current service
- `style_id` = specific style ID

### Database Trigger Behavior:

- When inserting into `service_addons`, the trigger automatically copies `is_exclusive` from the `addons` table
- The partial unique index ensures exclusive addons can only be linked once
- Both constraints work together to enforce the business logic

## Testing Recommendations

1. **Service CRUD**: Create, edit, and delete services
2. **Addon Linking**:
   - Link non-exclusive addons to multiple services ✓
   - Attempt to link exclusive addon to second service (should fail) ✓
3. **Style Management**: Create, edit, delete styles within services
4. **Picture Uploads**:
   - Upload pictures directly to service
   - Upload pictures to specific styles
   - Verify filtering works correctly
   - Test image upload and storage paths
5. **Delete Cascades**: Verify that deleting services/styles properly cascades to related records

## Files Modified

1. `src/lib/actions/commissions.ts` - Core CRUD operations
2. `src/components/admin/forms/PictureForm.tsx` - Picture upload form
3. `src/app/admin/services/ServicesClient.tsx` - Main admin UI
4. `supabase/seed.sql` - Test data seeding

## Migration Compatibility

All changes are fully compatible with migration `20251027094734_commisions.sql`:

- ✅ Pictures table structure (service_id NOT NULL, style_id nullable)
- ✅ Service_addons trigger and index behavior
- ✅ Cascade delete constraints
- ✅ RLS policies (public read, authenticated write)

## Next Steps

1. Test the complete flow in development environment
2. Verify image uploads work correctly for both service and style pictures
3. Confirm database constraints are enforced properly
4. Test edge cases (deleting services with pictures, exclusive addon violations)
5. Consider adding public-facing commission pages that utilize this data structure
