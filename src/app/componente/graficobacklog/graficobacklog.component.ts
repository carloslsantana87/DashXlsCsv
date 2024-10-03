import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import 'chartjs-adapter-date-fns';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, ChartDataLabels);

@Component({
  selector: 'app-graficobacklog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graficobacklog.component.html',
  styleUrls: ['./graficobacklog.component.css']
})
export class GraficobacklogComponent {
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
        rowObject[col] = row[index];
      });
      return rowObject;
    });

    console.log('Dados do Excel:', formattedData);


    this.createBarChart(formattedData);
  }


  createBarChart(data: any[]) {
    const filteredData = data.filter((row: any) => {
      return row['CL'] === "Caixa Econômica Federal - TELECOM - 4323/2023";
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
      count: 1
    }));

    const groupedData = processedData.reduce((acc, point) => {
      const key = `${point.group} - ${point.subGroup}`;
      if (!acc[key]) {
        acc[key] = { y: 0 };
      }
      acc[key].y += point.count;
      return acc;
    }, {} as Record<string, { y: number }>);

    const labels = Object.keys(groupedData).sort();
    const dataset = labels.map(label => ({
      x: label,
      y: groupedData[label].y
    }));

    const maxYValue = Math.max(...dataset.map(dataPoint => dataPoint.y));
    const ctx = document.getElementById('barChartbacklog') as HTMLCanvasElement | null;

    if (!ctx) {
      console.error('Elemento canvas não encontrado');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart<'bar', { x: string; y: number }[], unknown>(ctx, {
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
                size: 9
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
                const dataPoint = context.raw as { x: string; y: number };
                return `Grupo Solucionador - UF: ${dataPoint.x}, Contagem: ${dataPoint.y}`;
              }
            }
          }
        }
      }
    });
  }
}


