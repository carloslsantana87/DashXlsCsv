import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import 'chartjs-adapter-date-fns';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, ChartDataLabels);

@Component({
  selector: 'app-graficosabertos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graficosabertos.component.html',
  styleUrls: ['./graficosabertos.component.css']
})
export class GraficosabertosComponent {
  excelData: any[] = [];
  chart: Chart<'bar', { x: string; y: number }[], unknown> | undefined;
  noDataMessage: string | null = null;

  ngOnInit() {
    this.loadExcelFromGoogleDrive();
  }

  loadExcelFromGoogleDrive() {
    const url = 'https://docs.google.com/spreadsheets/d/1Uj4k_5--RQ-mK2y-BuGar-QnUbOM-n4ihLwR83MXCK4/edit?usp=drive_link';

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao carregar o arquivo: ' + response.statusText);
        }
        return response.arrayBuffer();
      })
      .then(data => {
        this.parseExcelData(data);
      })
      .catch(error => {
        console.error('Erro ao carregar o arquivo:', error);
      });
  }

  parseExcelData(data: ArrayBuffer) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
    const header: string[] = jsonData[0] as string[];
    const rows = jsonData.slice(1);

    const formattedData = rows.map(row => {
      const rowObject: any = {};
      header.forEach((col: string, index: number) => {
        if (col === 'E') {
          const excelDate = row[index];
          if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            rowObject[col] = date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          } else {
            rowObject[col] = excelDate;
          }
        } else {
          rowObject[col] = row[index];
        }
      });
      return rowObject;
    });

    console.log('Dados do Excel:', formattedData);

    formattedData.sort((a, b) => {
      if (a['CL'] < b['CL']) return -1;
      if (a['CL'] > b['CL']) return 1;
      return 0;
    });

    this.createBarChart(formattedData);
  }


  createBarChart(data: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora, minuto, segundo e milissegundo para comparação

    const filteredData = data.filter((row: any) => {
      if (typeof row['E'] !== 'string') return false;

      const rawDateString = row['E'].split(' ')[0];

      if (rawDateString.length !== 10) {
        return false;
      }

      const day = parseInt(rawDateString.substring(0, 2), 10);
      const month = parseInt(rawDateString.substring(3, 5), 10) - 1; // Mês começa em 0
      const year = parseInt(rawDateString.substring(6, 10), 10);

      const rowDate = new Date(year, month, day); // Cria o objeto Date a partir da string
      rowDate.setHours(0, 0, 0, 0); // Zera a hora para comparação

      // Supondo que rowObject[col] contém uma data no formato 'dd/MM/yyyy'
      const colDateString = row['E']; // Substitua 'col' pelo nome correto da coluna

      if (typeof colDateString !== 'string' || colDateString.length !== 10) return false;

      const colDateParts = colDateString.split('/'); // Assume formato dd/MM/yyyy

      if (colDateParts.length !== 3) return false;

      const colDay = parseInt(colDateParts[0], 10);
      const colMonth = parseInt(colDateParts[1], 10) - 1; // Mês começa em 0
      const colYear = parseInt(colDateParts[2], 10);

      const colDate = new Date(colYear, colMonth, colDay); // Cria o objeto Date para a coluna
      colDate.setHours(0, 0, 0, 0); // Zera a hora para comparação

      // Comparação das datas
      return row['CL'] === "Caixa Econômica Federal - TELECOM - 4323/2023" && rowDate.getTime() === today.getTime() && colDate.getTime() === today.getTime();
    });

    console.log(filteredData);

    if (filteredData.length === 0) {
      this.noDataMessage = 'NÃO HÁ CHAMADOS ABERTOS PARA ESTA DATA!';
      if (this.chart) {
        this.chart.destroy();
      }
      return;
    } else {
      this.noDataMessage = null;
    }

    const processedData = filteredData.map((row: any) => ({
      group: row['T'],
      subGroup: row['Q'],
      count: 1,
      additionalInfo: row['B']
    }));

    const groupedData = processedData.reduce((acc, point) => {
      const key = `${point.group} - ${point.subGroup}`;
      if (!acc[key]) {
        acc[key] = { y: 0, additionalInfo: [] };
      }
      acc[key].y += point.count;
      acc[key].additionalInfo.push(point.additionalInfo);
      return acc;
    }, {} as Record<string, { y: number; additionalInfo: string[] }>);

    const labels = Object.keys(groupedData).sort();
    const dataset = labels.map(label => ({
      x: label,
      y: groupedData[label].y,
      additionalInfo: groupedData[label].additionalInfo
    }));

    const maxYValue = Math.max(...dataset.map(dataPoint => dataPoint.y));
    const ctx = document.getElementById('barChartabertos') as HTMLCanvasElement | null;

    if (!ctx) {
      console.error('Elemento canvas não encontrado');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart<'bar', { x: string; y: number; additionalInfo: string[] }[], unknown>(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quantidade de Chamados',
          data: dataset,
          backgroundColor: 'rgba(255, 0, 0, 0.6)',
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            formatter: (value: { y: number }) => value.y,
            color: 'black',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
            },
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
              font: {
                size: 10
              }
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
            },
            min: 0,
            max: Math.ceil(maxYValue * 1.1),
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataPoint = context.raw as { x: string; y: number; additionalInfo: string[] };
                const additionalDataLines = dataPoint.additionalInfo.map(info => `• ${info}`);
                return [
                  `Grupo Solucionador - UF: ${dataPoint.x}`,
                  `Contagem: ${dataPoint.y}`,
                  `Chamados:`,
                  ...additionalDataLines // Exibe detalhes um abaixo do outro
                ];
              }
            }
          }
        }
      }
    });
  }
}
