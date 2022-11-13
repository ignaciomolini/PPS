import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

const IMAGE_DIR = 'fotos';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  image: LocalFile = {
    name: '',
    path: '',
    data: ''
  };

  constructor(private platform: Platform) { }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    if (image) {
      const base64Data = await this.readAsBase64(image);
      const fileName = new Date().getTime() + '.jpeg ';
      this.image = {
        name: fileName,
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data
      }
      return this.image;
    }
  }

  private async readAsBase64(photo: Photo) {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}


