package com.machinesearch.offline;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;
import android.os.Bundle;
import android.view.KeyEvent;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = getBridge().getWebView();
        
        // Back Button နှိပ်ရင် App မထွက်သွားအောင် ထိန်းမယ်
        webView.setOnKeyListener((v, keyCode, event) -> {
            if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
                webView.evaluateJavascript(
                    "(function() { if (window.history.length > 1) { window.history.back(); } else { if (typeof MS !== 'undefined' && MS.toast) { MS.toast('Press back again to exit'); } } })();",
                    null
                );
                return true; // App မထွက်သွားအောင် ပိတ်ထားမယ်
            }
            return false;
        });
    }
}
