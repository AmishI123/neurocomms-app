#!/usr/bin/env bash
# Starts a dedicated Android emulator for the Helper Jobs journey and waits for it, writing its log to $OUT.
# Usage: scripts/emulator.sh <api-level> <out-dir>
set -uo pipefail
API="${1:-33}"; OUT="${2:-journey}"; mkdir -p "$OUT"
SDK="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
TOOLS="$SDK/cmdline-tools/latest/bin"
IMAGE="system-images;android-${API};google_apis;x86_64"
echo "::group::Install emulator and $IMAGE"
yes | "$TOOLS/sdkmanager" --licenses > /dev/null 2>&1 || true
echo "::notice::Free disk before install: $(df -h "$SDK" | tail -1 | awk '{print $4}')"
"$TOOLS/sdkmanager" --install emulator platform-tools "$IMAGE" > "$OUT/sdkmanager.log" 2>&1 || { tr '\r' '\n' < "$OUT/sdkmanager.log" | grep -i -E "error|warn|fail|space|exception" | tail -8 | sed 's/^/::error::/'; df -h | head -5 | sed 's/^/::error::/'; exit 1; }
echo "::endgroup::"
# Keep the AVD where the emulator looks for it (newer tools default elsewhere).
export ANDROID_AVD_HOME="$HOME/.android/avd"; mkdir -p "$ANDROID_AVD_HOME"
echo no | "$TOOLS/avdmanager" create avd --force -n helperjobs -k "$IMAGE" -d pixel_c -p "$ANDROID_AVD_HOME/helperjobs.avd" > "$OUT/avdmanager.log" 2>&1 || { tail -5 "$OUT/avdmanager.log" | sed 's/^/::error::/'; exit 1; }
CONFIG="$ANDROID_AVD_HOME/helperjobs.avd/config.ini"
{ echo "hw.ramSize=3072"; echo "hw.cpu.ncore=2"; echo "hw.keyboard=yes"; echo "disk.dataPartition.size=4G"; } >> "$CONFIG"
"$SDK/emulator/emulator" -accel-check > "$OUT/accel.txt" 2>&1; echo "::notice::$(tr '\n' ' ' < "$OUT/accel.txt" | cut -c1-250)"
nohup "$SDK/emulator/emulator" -avd helperjobs -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect -camera-back none -camera-front none > "$OUT/emulator.log" 2>&1 &
echo $! > "$OUT/emulator.pid"
if ! timeout 300 "$SDK/platform-tools/adb" wait-for-device; then
  echo "::error::The emulator did not appear within 5 minutes"
  tail -25 "$OUT/emulator.log" | sed 's/^/::error::/'; exit 1
fi
START=$(date +%s)
until [ "$("$SDK/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  if [ $(( $(date +%s) - START )) -gt 900 ]; then
    echo "::error::The emulator did not finish starting in 15 minutes"; tail -15 "$OUT/emulator.log" | sed 's/^/::error::/'; exit 1
  fi
  if ! kill -0 "$(cat "$OUT/emulator.pid")" 2>/dev/null; then echo "::error::The emulator stopped"; tail -15 "$OUT/emulator.log" | sed 's/^/::error::/'; exit 1; fi
  sleep 10
done
echo "::notice::Android ${API} emulator started in $(( $(date +%s) - START )) s"
ADB="$SDK/platform-tools/adb"
for s in window_animation_scale transition_animation_scale animator_duration_scale; do "$ADB" shell settings put global $s 0; done
"$ADB" shell input keyevent 82 || true
