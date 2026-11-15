#!/usr/bin/env bash
set -euo pipefail

# Dedicated hosted runner only. Never create/replace an AVD on the user's host.
if [[ "${GITHUB_ACTIONS:-}" != true || -z "${RUNNER_TEMP:-}" ]]; then
  echo 'This wrapper requires a dedicated GitHub Actions runner.' >&2
  exit 64
fi
visit_sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$visit_sdk" || ! -x "$visit_sdk/platform-tools/adb" ]]; then
  echo 'Android SDK is unavailable.' >&2
  exit 65
fi
visit_adb="$visit_sdk/platform-tools/adb"
visit_emulator="$visit_sdk/emulator/emulator"
visit_serial=emulator-5556
visit_avd=my-visit-notes-ci
if [[ ! -r /dev/kvm || ! -w /dev/kvm ]]; then
  echo 'This hosted runner must provide hardware acceleration; no software fallback.' >&2
  exit 66
fi
visit_existing=$("$visit_adb" devices | awk 'NR>1 && NF {print $1}')
if [[ -n "$visit_existing" ]]; then
  echo 'Refusing to run with another Android target attached.' >&2
  exit 67
fi

# No --force: an existing AVD with this name is a failure, not an overwrite.
echo no | avdmanager create avd --name "$visit_avd" --package 'system-images;android-34;google_apis;x86_64'
"$visit_emulator" -avd "$visit_avd" -port 5556 -accel on -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect > "$RUNNER_TEMP/visit-emulator.log" 2>&1 &
visit_emulator_pid=$!
trap '"$visit_adb" -s "$visit_serial" emu kill >/dev/null 2>&1 || true' EXIT
visit_booted=false
for ((visit_attempt=0; visit_attempt<60; visit_attempt++)); do
  if ! kill -0 "$visit_emulator_pid" 2>/dev/null; then
    echo 'The dedicated emulator exited before boot.' >&2
    exit 68
  fi
  if [[ "$(timeout 5 "$visit_adb" -s "$visit_serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r\n' || true)" == 1 ]]; then
    visit_booted=true
    break
  fi
  sleep 2
done
if [[ "$visit_booted" != true ]]; then
  echo 'Android did not complete boot; no app installation attempted.' >&2
  exit 69
fi
ADB_PATH="$visit_adb" node scripts/android-journey.mjs --serial="$visit_serial" --dedicated-test-target |& tee "$RUNNER_TEMP/visit-android-journey.log"
