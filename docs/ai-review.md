# AI Review / Corrections

The assessment requires meaningful AI mistakes or incorrect suggestions to be identified.

1. **Naive transition handling rejected:** a generic CRUD update can let a client change status arbitrarily. The implementation deliberately keeps status changes in a dedicated service method with an explicit transition map.
2. **Client-only validation rejected:** UI validation alone is insufficient. Jakarta Bean Validation is enforced at the REST boundary and returns structured errors.
3. **Generic exception leakage rejected:** raw framework errors are not exposed. `ApiExceptionHandler` maps known failures to stable error codes/messages.
4. **UI-only state filtering rejected:** the API accepts the status filter, so filtering is performed against persisted data rather than only the currently loaded browser list.
