# PB124 browser offline acceptance
1. Open production HTTPS `/peaceboat`.
2. Login as Meri.
3. Enable Field Mode and GNSS.
4. Capture an observation and original photo.
5. Disable network before save.
6. Confirm `SAVED SAFELY ON THIS PHONE · WAITING FOR INTERNET`.
7. Close the tab/app completely.
8. Reopen while still offline; record must remain in IndexedDB.
9. Restore network; confirm `SYNCHRONIZED WITH OLEA`.
10. Confirm exactly one UUID server-side and original photo hash.
