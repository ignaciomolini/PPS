import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';

import { NgChartsModule } from 'ng2-charts';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';

import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [HttpClientModule, BrowserModule, IonicModule.forRoot(), AppRoutingModule, provideFirebaseApp(() => initializeApp(environment.firebase)), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy } ,
    NgChartsModule ,
    WebView ,
    Camera ,
    NativeAudio ,
    Flashlight 
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
