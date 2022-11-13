import { Injectable } from '@angular/core';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { Haptics } from '@capacitor/haptics';
@Injectable({
  providedIn: 'root'
})
export class UtilidadesService {

  constructor(
    private nativeAudio: NativeAudio
    ) { 

  }

  async PreloadAudio()
  {
    try {
      this.nativeAudio.preloadComplex('uniqueId1', 'assets/sonidos/entrada.mp3', 1, 1, 0);
      this.nativeAudio.preloadComplex('uniqueId2', 'assets/sonidos/salida.mp3', 1, 1, 0);

      this.nativeAudio.preloadComplex('uniqueId3', 'assets/sonidos/confirmar.mp3', 1, 1, 0);
      this.nativeAudio.preloadComplex('uniqueId4', 'assets/sonidos/alta.mp3', 1, 1, 0);
      this.nativeAudio.preloadComplex('uniqueId5', 'assets/sonidos/rechazar.mp3', 1, 1, 0);
      this.nativeAudio.preloadComplex('uniqueId6', 'assets/sonidos/error.mp3', 1, 1, 0);
    } catch (error) {
      
    }
  }

  async VibrarError()
  {
    await Haptics.vibrate({ duration: 500});
  }

  async VibrarRechazar()
  {
    await Haptics.vibrate({ duration: 1000});
  }

  async SonidoConfirmar(){
    this.nativeAudio.play('uniqueId3');
  }

  async SonidoAlta(){
    this.nativeAudio.play('uniqueId4');
  }

  async SonidoRechazar(){
    this.nativeAudio.play('uniqueId5');
  }

  async SonidoError(){
    this.nativeAudio.play('uniqueId6');
  }

  async PlayLogin()
  {
      this.nativeAudio.play('uniqueId1');
  }

  async PlayLogout()
  {
      this.nativeAudio.play('uniqueId2');
  }
}