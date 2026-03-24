ALTER TABLE "public"."about_faqs"
ADD COLUMN IF NOT EXISTS "username_template" TEXT;

UPDATE "public"."about_faqs"
SET "username_template" = '{{left}}skeleton + {{right}} = {{result}}'
WHERE "faq_type" = 'username'
  AND ("username_template" IS NULL OR "username_template" = '');
