package org.myvisitnotes.app;

import android.content.Context;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.text.TextUtils;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VisitPrint")
public class VisitPrintPlugin extends Plugin {
    private WebView printView;

    @PluginMethod public void printText(PluginCall call) {
        String text = call.getString("text");
        if (text == null) { call.reject("No text to print."); return; }
        getActivity().runOnUiThread(() -> {
            if (printView != null) { call.reject("Finish the open print dialog first."); return; }
            printView = new WebView(getContext());
            printView.getSettings().setJavaScriptEnabled(false);
            printView.getSettings().setAllowFileAccess(false);
            printView.getSettings().setBlockNetworkLoads(true);
            printView.setWebViewClient(new WebViewClient() {
                private boolean opened;
                @Override public void onPageFinished(WebView view, String url) {
                    if (opened) return;
                    opened = true;
                    try {
                        PrintManager manager = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                        if (manager == null) throw new IllegalStateException("Printing is unavailable.");
                        PrintDocumentAdapter delegate = view.createPrintDocumentAdapter("My Visit Notes");
                        manager.print("My Visit Notes", new PrintDocumentAdapter() {
                            @Override public void onStart() { delegate.onStart(); }
                            @Override public void onLayout(PrintAttributes oldAttrs, PrintAttributes newAttrs, CancellationSignal signal, LayoutResultCallback callback, Bundle extras) {
                                delegate.onLayout(oldAttrs, newAttrs, signal, callback, extras);
                            }
                            @Override public void onWrite(PageRange[] pages, ParcelFileDescriptor file, CancellationSignal signal, WriteResultCallback callback) {
                                delegate.onWrite(pages, file, signal, callback);
                            }
                            @Override public void onFinish() {
                                delegate.onFinish();
                                view.destroy(); printView = null;
                            }
                        }, new PrintAttributes.Builder().build());
                        call.resolve();
                    } catch (Exception error) {
                        view.destroy(); printView = null;
                        call.reject("Could not open printing.", error);
                    }
                }
            });
            // A separate WebView receives only the reviewed text. The editor,
            // hidden notes and app navigation never enter the print document.
            printView.loadDataWithBaseURL(null, "<!doctype html><meta charset='utf-8'><style>pre{white-space:pre-wrap;overflow-wrap:anywhere;font:16px/1.5 sans-serif}</style><pre>" + TextUtils.htmlEncode(text) + "</pre>", "text/html", "UTF-8", null);
        });
    }
}
