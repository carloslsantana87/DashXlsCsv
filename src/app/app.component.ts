import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as Tone from 'tone'; 
import { GraficobacklogComponent } from './componente/graficobacklog/graficobacklog.component';
import { GraficosabertosComponent } from './componente/graficosabertos/graficosabertos.component';
import { GraficosfechadosComponent } from './componente/graficosfechados/graficosfechados.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, GraficobacklogComponent, GraficosabertosComponent, GraficosfechadosComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DashXlsCsv';
  selectedTab = 'telecom';
  tabs = ['telecom', 'TFL'];
  currentIndex = 0;
  isUpdating = false; 

  constructor() {}

  async ngOnInit() {
    this.updateGraphs();
    this.simularCliqueBotaoOculto();
  }

  changeTab(): void {
    this.currentIndex = (this.currentIndex + 1) % this.tabs.length;
    this.selectedTab = this.tabs[this.currentIndex];
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  updateGraphs(): void {
    this.isUpdating = true; 
    console.log('Atualizando gráficos...');

    // Toca o som sempre que os gráficos são atualizados
    this.playSound(); 

    setTimeout(() => {
      this.isUpdating = false; 
      console.log('Gráficos atualizados!');
    }, 1000); 
  }

  playSound(): void {
    const player = new Tone.Player('midias/som.mp3').toDestination(); 
    player.autostart = true; 
    console.log('Som reproduzido com sucesso!');
  }

  private simularCliqueBotaoOculto(): void {
    document.getElementById('botaoOculto')?.click();
  }
}
