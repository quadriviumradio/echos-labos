package com.example.projet_echo;

import android.os.Bundle;
import android.app.Activity;
import android.content.Context;
import android.graphics.Point;
import android.view.Display;
import android.view.Menu;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.DroidGap;
public class MainActivity extends DroidGap {
	protected float ORIG_APP_W = 640;
    protected float ORIG_APP_H = 960;
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		super.setIntegerProperty("loadUrlTimeoutValue", 300000);  
		super.loadUrl("file:///android_asset/www/index.html");
		WebSettings ws = super.appView.getSettings();
	     Display display = ((WindowManager) getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
	     int width = display.getWidth(); 
	     int height = display.getHeight(); 
	     double globalScale = Math.ceil( ( width / ORIG_APP_W ) * 100 );
	     this.appView.setInitialScale( (int)globalScale );
        ws.setSupportZoom(false);
        ws.setBuiltInZoomControls(false); 
//        ws.setDefaultZoom(ZoomDensity.);
        
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		
		
		return true;
	}

}
