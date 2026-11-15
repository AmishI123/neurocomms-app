package org.helperjobs.app;

import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HelperJobsDevicePlugin.class);
        super.onCreate(savedInstanceState);
        // The back button moves back inside Helper Jobs; it never closes the app in the middle of an outing.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript("window.HelperJobsNative && window.HelperJobsNative.onBack()", null);
                }
            }
        });
    }
}
