package org.helperjobs.app;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Connects the Helper Jobs pages to the tablet: the device voice for read aloud, the print screen,
 * the share sheet for saved files, keeping the screen on, and pinning the app so helpers stay in it.
 */
@CapacitorPlugin(name = "HelperJobsDevice")
public class HelperJobsDevicePlugin extends Plugin {
    private static final String[] LANGUAGES = {"en-US", "hi-IN", "es-ES", "es-US", "en-IN", "en-GB"};
    private TextToSpeech tts;
    private volatile int ttsState = 0; // 0 starting, 1 ready, -1 no voice engine
    private final List<Runnable> waiting = new ArrayList<>();
    private final Map<String, PluginCall> speaking = new ConcurrentHashMap<>();

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), status -> {
            synchronized (waiting) {
                ttsState = status == TextToSpeech.SUCCESS ? 1 : -1;
                for (Runnable run : waiting) run.run();
                waiting.clear();
            }
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}
            @Override public void onDone(String id) { finish(id, null); }
            @Override public void onError(String id) { finish(id, "The voice could not read this."); }
            @Override public void onStop(String id, boolean interrupted) { finish(id, null); }
        });
    }

    private void finish(String id, String error) {
        PluginCall call = speaking.remove(id);
        if (call == null) return;
        if (error == null) call.resolve(); else call.reject(error);
    }

    private void whenReady(Runnable run) {
        synchronized (waiting) {
            if (ttsState == 0) waiting.add(run); else run.run();
        }
    }

    @PluginMethod
    public void voices(PluginCall call) {
        whenReady(() -> {
            JSArray list = new JSArray();
            if (ttsState == 1) {
                for (String tag : LANGUAGES) {
                    int available = tts.isLanguageAvailable(Locale.forLanguageTag(tag));
                    if (available >= TextToSpeech.LANG_AVAILABLE) {
                        JSObject voice = new JSObject();
                        voice.put("lang", tag);
                        voice.put("name", Locale.forLanguageTag(tag).getDisplayName());
                        list.put(voice);
                    }
                }
            }
            JSObject result = new JSObject();
            result.put("voices", list);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        String lang = call.getString("lang", "en-US");
        float rate = call.getFloat("rate", 1f);
        whenReady(() -> {
            if (ttsState != 1) { call.reject("This tablet has no voice engine."); return; }
            for (String id : speaking.keySet()) finish(id, null);
            tts.setLanguage(Locale.forLanguageTag(lang));
            tts.setSpeechRate(Math.max(0.3f, Math.min(2f, rate)));
            String id = UUID.randomUUID().toString();
            speaking.put(id, call);
            if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id) != TextToSpeech.SUCCESS) finish(id, "The voice could not read this.");
        });
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        if (tts != null) tts.stop();
        for (String id : speaking.keySet()) finish(id, null);
        call.resolve();
    }

    @PluginMethod
    public void print(PluginCall call) {
        String name = call.getString("name", "Helper Jobs");
        getActivity().runOnUiThread(() -> {
            WebView webView = getBridge().getWebView();
            PrintManager printer = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
            if (printer == null) { call.reject("This tablet cannot print."); return; }
            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
            printer.print(name, adapter, new PrintAttributes.Builder().build());
            call.resolve();
        });
    }

    @PluginMethod
    public void keepAwake(PluginCall call) {
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            if (on) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    @PluginMethod
    public void pinApp(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try { getActivity().startLockTask(); call.resolve(); }
            catch (Exception error) { call.reject("This tablet could not pin the app."); }
        });
    }

    @PluginMethod
    public void unpinApp(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try { getActivity().stopLockTask(); call.resolve(); }
            catch (Exception error) { call.reject("This tablet could not unpin the app."); }
        });
    }

    @PluginMethod
    public void pinState(PluginCall call) {
        ActivityManager manager = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
        boolean pinned = false;
        if (manager != null) {
            pinned = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? manager.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE
                : manager.isInLockTaskMode();
        }
        JSObject result = new JSObject();
        result.put("supported", true);
        result.put("pinned", pinned);
        call.resolve(result);
    }

    @PluginMethod
    public void saveFile(PluginCall call) {
        String name = call.getString("name", "helper-jobs-file").replaceAll("[^A-Za-z0-9._-]", "-");
        String mime = call.getString("mime", "application/octet-stream");
        String data = call.getString("data", "");
        try {
            File folder = new File(getContext().getCacheDir(), "shared");
            if (!folder.exists() && !folder.mkdirs()) throw new IllegalStateException("No folder");
            File file = new File(folder, name);
            try (FileOutputStream out = new FileOutputStream(file)) { out.write(Base64.decode(data, Base64.DEFAULT)); }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(mime.split(";")[0]);
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, "Save or send " + name);
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(chooser);
            JSObject result = new JSObject();
            result.put("name", name);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Could not save the file.");
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) tts.shutdown();
    }
}
