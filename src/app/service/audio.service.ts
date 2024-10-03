import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audio = new Audio();

  constructor() { }

  playAudio(filePath: string): void {
    this.audio.src = filePath;
    this.audio.load();
    this.audio.play().catch(error => {
      console.error('Erro ao reproduzir o áudio:', error);
    });
  }
}
