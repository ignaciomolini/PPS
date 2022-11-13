import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.chat',
  appName: 'Chat',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false
    }
  }
};

export default config;
