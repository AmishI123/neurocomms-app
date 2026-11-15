# A complete visit journey on Android and iOS

Status: active. Build the shared mobile interface and verify each platform.

Someone can prepare questions, use them in an appointment, keep personal answers,
review what happened and continue their next steps after closing the app.

## Delivery requirements

1. A separate My Visit Notes Android and iOS project that packages the shared visit
   app. Preserve Phrase Studio's existing mobile product and application identity.
2. Clear phone navigation, readable text, reachable controls and forms that remain
   usable with the keyboard, large text, rotation and screen cutouts.
3. The complete prepare, conversation, after-review, follow-up and next-appointment
   journey, including correct saving of every supported outcome.
4. Saved visits reopen after a complete app restart without a network connection.
   A failed save keeps the words visible and reports failure.
5. Native backup and transfer export/import, deliberate sharing, clipboard and a
   supported printing path. Private notes only enter selected output by choice.
6. Android Back, interruption, background privacy, app updates and data recovery
   preserve the person's work. Permissions match the features actually used.
7. Android build and emulator journey evidence, iOS build and simulator evidence,
   physical-device checks when devices are available, installable artifacts and a
   plain acceptance report showing exactly what ran and what remains unverified.

## Initial evidence

The existing native projects package Phrase Studio, not My Visit Notes. This Linux
host has the Android SDK and JDK; no Android device is currently connected. Xcode
and CocoaPods are unavailable here. iOS build verification remains required.

The earlier after-review acceptance claim was too broad: saving Partly answered
failed because recovery validation used a shorter state list. The shared state
list has been corrected and the browser save/offline assertions restored. A new
model test exercises both that save and a later change to Answered with recovery
history present. Previous release hashes do not verify the corrected source.
