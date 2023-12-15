import { CarregaService } from '../services/carrega_file/carrega.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { format, parse, differenceInDays, getWeek } from 'date-fns';
import { ApiService } from '../services/contratos/contratos.service';
import { map, take } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-files-update',
  templateUrl: './files-update.component.html',
  styleUrls: ['./files-update.component.css'],
  template: `
    <progressbar [value]="progressValue" [max]="100">{{ progressValue }}%</progressbar>
  `
})
export class FilesUpdateComponent {

  progressValue = 0; // Valor atual da barra de progresso
  maxValue = 0; // Valor máximo da barra de progresso
  showProgressBar = false;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  urlAtualiza: string = 'https://ktb8xjoqck.execute-api.sa-east-1.amazonaws.com/Dev2';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'ECOs_PfTool';
  items$: Observable<any> | undefined;
  dataLoaded = false;
  jsonData: any;
  sortColumn: string = '';
  sortDirection: number = 1;
  dias_terminal: Date = new Date();
  Freetime: number = 0;
  dados: any[] = [];
  contratos: string[] = [];
  freetime: string[] = [];
  tripcost: string[] = [];
  custoViagem: string = "";
  handling: string[] = [];
  manuseio: string = "";
  demurrage: string[] = [];
  estadia: string = "";
  valorFree: string = '';
  liner: string = "";
  vessel: string = "";
  custoestadia: number = 0;
  dataArray: any;
  progressCounter: any;
  jsonDataParametros!: any[];
  jsonDataPecas!: any[];
  jsonDataNeca!: any[];
  filteredData!: any[];
  jsonDataPipe!: any[];
  jsonDataBat!: any[];

  constructor(
    private carregaService: CarregaService,
    private http: HttpClient,
    private dynamodbService: ApiService,


  ) { }

  mergeData() {
    const mergedData: { [peca: string]: any } = {};

    // Função para atualizar ou criar um objeto 'Peca'
    const updateOrCreatePeca = (peca: string, newData: any) => {
      if (!mergedData[peca]) {
        mergedData[peca] = newData;
      }
    };

    // Atualizar ou criar um objeto 'Peca' para cada conjunto de dados
    (this.jsonData || []).forEach((data: { Peca: string; }) => updateOrCreatePeca(data.Peca, data));

    // Procurar por valores iguais na chave 'Peca' nas outras variáveis e atualizar os dados
    (this.jsonDataParametros || []).forEach(data => {
      if (mergedData[data.Peca]) {
        mergedData[data.Peca].MPCode = data.MPCode;
        mergedData[data.Peca].Country = data.Country;
        mergedData[data.Peca].Supplier = data.Supplier;
        // Adicione outras atualizações necessárias aqui
      }
    });

    (this.jsonDataPecas || []).forEach(data => {
      if (mergedData[data.Peca]) {
        mergedData[data.Peca].Descricao = data.Descricao;
        mergedData[data.Peca].Custo = data.Custo;
        mergedData[data.Peca].Embalagem = data.Embalagem;
        mergedData[data.Peca].Stock = data.Quantidade;
        mergedData[data.Peca].Terc = data.Terc;
        mergedData[data.Peca].Line = data.Line;
        // Adicione outras atualizações necessárias aqui
      }
    });

    (this.jsonDataNeca || []).forEach(data => {
      if (mergedData[data.Peca]) {
        mergedData[data.Peca].DB12 = data.DB12;

        // Adicione outras atualizações necessárias aqui
      }
    });

    (this.jsonDataPipe || []).forEach(data => {
      if (mergedData[data.Peca]) {
        mergedData[data.Peca].Pipeline = data.Pipeline;

        // Adicione outras atualizações necessárias aqui
      }
    });

    (this.jsonDataBat || []).forEach(data => {
      if (mergedData[data.Peca]) {
        mergedData[data.Peca].Call = data.Call;

        // Adicione outras atualizações necessárias aqui
      }
    });

    // Filtrar os itens onde a chave 'MPCode' começa com a letra 'r'
    this.filteredData = Object.values(mergedData).filter(item => item.MPCode && item.MPCode.startsWith('R'));

    // O objeto 'filteredData' contém os dados filtrados
    console.log('Dados filtrados:', this.filteredData);


  }

  calculateTotal(item: any): number {
    const pipeline = item.Pipeline !== undefined ? item.Pipeline : 0;
    const stock = item.Stock !== undefined ? item.Stock : 0;
    const call = item.Call !== undefined ? item.Call : 0;
    const db12 = item.DB12 !== undefined ? item.DB12 : 0;
    const custo = item.Custo !== undefined ? item.Custo : 0;

    return (pipeline + stock + call - db12) * custo;
  }


  async onFileTXTSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextFile(file);
      this.jsonDataParametros = jsonData;
      console.log('Dados carregados:', jsonData);
      // Resto do seu código para processar os dados carregados
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFilePECASSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextPECAS(file);
      this.jsonDataPecas = jsonData;
      console.log('Dados carregados:', jsonData);
      // Resto do seu código para processar os dados carregados
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFileNECASelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextNeca(file);
      this.jsonDataNeca = jsonData;
      console.log('Dados carregados:', jsonData);
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFilePipeSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextPipe(file);
      this.jsonDataPipe = jsonData;
      console.log('Dados carregados:', this.jsonDataPipe);
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFileBatSelected(event: any) {
    const file: File = event.target.files[0];

    try {
      const jsonData = await this.carregaService.loadTextBat(file);
      this.jsonDataBat = jsonData;
      console.log('Dados carregados:', jsonData);
      this.mergeData();
    } catch (error) {
      console.error('Erro ao carregar o arquivo:', error);
    }
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    const fileBlob = await fetch(fileUrl).then(response => response.blob());
    const rawData = await this.carregaService.loadFile(fileBlob);
    const inflatedData = this.inflateData(rawData); // Inflar os campos desejados
    this.jsonData = inflatedData;
    console.log('Dados carregados:', this.jsonData);
    this.dataLoaded = true;
    // Chama a função para salvar os dados no API Gateway
  }

  getProgressWidth(): string {
    const totalItems = this.filteredData.length;
    const processedItems = this.progressCounter;
    const progressPercentage = (processedItems / totalItems) * 100;
    return `${progressPercentage}%`;
  }


  async salvarNoBanco() {
    this.progressCounter = 0;
    this.showProgressBar = true;
    console.log('Itens a serem salvos:', this.filteredData);
    this.progressValue = 0;
    const batchSize = 25; // Tamanho máximo para cada lote

    const currentDate = new Date();
    const formattedDate = currentDate.getDate().toString().padStart(2, '0') +
      (currentDate.getMonth() + 1).toString().padStart(2, '0') +
      currentDate.getFullYear().toString();

      const semana = getWeek(currentDate);
      const year = currentDate.getFullYear().toString();


    const batches = this.chunkArray(this.filteredData, batchSize);

    const promises = batches.map(async (batch) => {
      batch.forEach(item => {
        item.lastupdate = formattedDate;
        let chave = 'Stock' + semana + year;
        item[chave]= item.Stock;
        chave = 'Pipeline' + semana + year;
        item[chave] = item.Pipeline;
        chave = 'Call' + semana + year;
        item[chave] = item.Call;
        chave = 'DB12' + semana + year;
        item[chave] = item.DB12;
        chave = 'Terc' + semana + year;
        item[chave] = item.Terc;
        chave = 'Line' + semana + year;
        item[chave] = item.Line;

      });

      try {
        const response = await this.dynamodbService.salvar(batch, this.query, this.urlAtualiza).toPromise();
        this.progressValue += batch.length;
        console.log('Resposta do salvamento:', response);
        this.progressCounter = this.progressCounter + 25;
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao salvar em lote:', error);
    }

    setTimeout(() => {
      this.showProgressBar = false;
    }, 7000); // Tempo adequado conforme necessário
  }



  chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async ngOnInit() {

  }



  testarArquivo(arquivo: File): void {
    this.carregaService.testarArquivoCSV(arquivo).then((estaCorreto) => {
      if (estaCorreto) {
        console.log('O arquivo CSV está correto.');
      } else {
        console.log('O arquivo CSV está incorreto.');
      }
    }).catch((erro) => {
      console.error('Erro ao testar o arquivo CSV:', erro);
    });
  }



  inflateData(rawData: any[]): any[] {
    let i = 0;


    return rawData.map((item: any) => {


      const universalDate = this.carregaService.convertExcelDate(item[0]);


      const inflatedItem: any = {
        'tableName': this.query,
        'ID': (item[19] + item[9]).toString(),
        'UpdateDate': universalDate,
        'EcoN': item[9],
        'Creation': item[14],
        'Status': item[16],
        'Peca': item[19],
        'Replaced': item[29],
        'Replaces': item[30],
        'Packaging': item[59],
        'ECOAfter': item[94],
        'ECOBefore': item[95],
        'GeneralTime': item[216],
        'SOP': item[219],
        'SOCOP': item[220],
        'SOPDev': item[223],
        'SOCOPDev': item[224],

        // Adicione mais campos conforme necessário
      };


      return inflatedItem;

    });

  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.filteredData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }

  sortBy2(column: string) {
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.filteredData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = column === 'TotalCost' ? this.calculateTotal(a) : a[column];
      const valueB = column === 'TotalCost' ? this.calculateTotal(b) : b[column];

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }




}

