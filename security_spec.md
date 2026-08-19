# Security Specification for Al-Raza Pure Organic Oils

## 1. Data Invariants
1. **Orders**: Orders must contain valid contact phone, delivery address, city, non-negative total amount, valid payment status, and order status within allowed enumeration values.
2. **Reviews**: Customer reviews must have a valid rating (1-5), author name <= 80 chars, and comment <= 1000 chars.
3. **Custom Blends**: Blends must have valid blendName, targetConcern, ingredients summary, and non-negative totalPrice.
4. **Store Config**: Only store administrator (`tshirtsprintingworld@gmail.com`) can mutate global store configs. Reads are publicly accessible for shoppers.
5. **Batch Records**: Read-only for customers to verify pure oil batches; updates/creation restricted to store administrator.
6. **No Client Spoofing**: Document IDs must not exceed 128 characters and match standard alphanumeric/hyphen/underscore patterns.

## 2. The "Dirty Dozen" Threat Payloads
1. `Malicious_Order_Negative_Total`: `{ "totalAmount": -5000, "status": "delivered" }` -> Blocked by schema validation & type constraint.
2. `Admin_Escalation_Config`: Non-admin trying to overwrite store helpline and bank details -> Blocked by admin verification.
3. `XSS_Review_Payload`: `{ "comment": "<script>stealCookies()</script>...", "rating": 999 }` -> Blocked by rating range 1-5 and character limits.
4. `Batch_Falsification_Write`: Unauthorized user attempting to fabricate 100% pure lab test records -> Blocked by write permissions.
5. `Order_Status_Arbitrary_Fulfill`: Guest updating order status to 'delivered' without authorization -> Blocked.
6. `Oversized_Payload_Dos`: Order note with 2MB junk text -> Blocked by string length limits.
7. `Invalid_ID_Poisoning`: Path variable with special control chars `/orders/$$$%%$$` -> Blocked by `isValidId()`.
8. `Store_Config_Delete`: Unauthorized user attempting to delete store config -> Blocked.
9. `Custom_Blend_Injection`: Custom blend with missing required recipe ingredients -> Blocked by required fields check.
10. `Review_Id_Spoofing`: Overwriting someone else's verified review -> Blocked.
11. `Payment_Status_Bypass`: Updating paymentStatus without proper privileges -> Blocked.
12. `System_Field_Tampering`: Forging server creation timestamps -> Blocked.
