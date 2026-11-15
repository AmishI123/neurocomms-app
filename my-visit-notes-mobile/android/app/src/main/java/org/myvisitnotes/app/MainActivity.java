package org.myvisitnotes.app;

import com.getcapacitor.BridgeActivity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.view.Gravity;
import android.graphics.Color;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    private View privacyCover;
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VisitPrintPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override public void onPause() {
        if (privacyCover != null) {
            super.onPause();
            return;
        }
        TextView cover = new TextView(this);
        cover.setText(R.string.app_name);
        cover.setTextSize(24);
        cover.setTextColor(Color.rgb(24, 55, 47));
        cover.setBackgroundColor(Color.rgb(245, 245, 239));
        cover.setGravity(Gravity.CENTER);
        cover.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
        addContentView(cover, new ViewGroup.LayoutParams(-1, -1));
        privacyCover = cover;
        super.onPause();
    }

    @Override public void onResume() {
        super.onResume();
        if (privacyCover != null) {
            ((ViewGroup) privacyCover.getParent()).removeView(privacyCover);
            privacyCover = null;
        }
    }
}
