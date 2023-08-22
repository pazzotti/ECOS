import { Component, OnInit, ViewChild } from '@angular/core';
import { format, isToday } from 'date-fns';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription, interval } from 'rxjs';
import { ApiService } from '../services/contratos/contratos.service';
import { AppModule } from '../app.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { CarregaService } from '../services/carrega_file/carrega.service';
import { DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';







@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})

export class FollowComponent implements OnInit {


  filteredData!: any[];
  subscription: Subscription | undefined;
  items: any[] = [];
  itemsAntigo: any[] = [];
  fornecedores: any[] = [];
  posicao: any[] = [];
  sortColumn: string = '';
  sortNumber: number = 0;
  sortDirection: number = 1;
  dataLoaded = true;
  filtroDataInicio: Date = new Date();
  filtroDataTermino: Date = new Date();
  itemsFiltrados: any[] = [];
  searchText: string = '';
  items2: any[] = [ /* Seus itens aqui */];
  private searchTextSubject = new Subject<string>();
  private searchTextSubscription!: Subscription;
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  urlSalva: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  query: string = 'ECOs_PfTool';
  data: any;
  editMode!: boolean[];
  informationMode!: boolean[];
  address!: string;
  DataAtual: Date = new Date();
  dialogOpen!: boolean;
  dialogAddViagem!: boolean;
  janela1!: string;
  janela2!: string;
  janela3!: string;
  janela4!: string;
  janelaDestino1!: string;
  janelaDestino2!: string;
  janelaDestino3!: string;
  janelaDestino4!: string;
  carriers!: any[];
  places!: any[];
  transportadora!: string[];
  locais!: string[];
  datePipe: any;
  selectedDescription!: string;
  Transportadoras!: string;
  listaTransportadoras!: any[];
  dataInvertida: string = '';
  tipoVeiculo!: any[];
  listaVeiculo1!: any[];
  datadescarga!: string | null;
  tipoVeiculos: any;
  ecos!: any[];
  itensFiltrados!: any[];
  maiorDataSOP: Date = new Date(0); // Inicializa com uma data muito antiga
  maiorDataSOCOP: Date = new Date(0);
  maiorDataSOPDev: Date = new Date(0);
  maiorDataSOCOPDev: Date = new Date(0);
  selectedItem: any;
  selectedStatus!: string;
  statusOptions: string[] = ['Analyzing', 'Denied', 'Accepted']; // Substitua pelas opções reais
  showTooltip: boolean = false;
  itemToShowTooltipFor: any = null;
  tooltipPosition: { x: number, y: number } = { x: 300, y: 0 };





  constructor(private dynamoDBService: ApiService, public dialog: MatDialog, private http: HttpClient, private carregaService: CarregaService,) {
    this.editMode = [];
    this.informationMode = [];

  }


  async ngOnInit() {
    await this.getItemsFromDynamoDB();
    await this.filtrarItens(); // Espera pela filtragem assíncrona

  }

  InsereComent(item: any, fieldName: string) {

    const newValue = prompt(`Insert a value for ${fieldName}:`);
    if (newValue !== null) {
      item[fieldName] = newValue;
      this.salvarField(item); // Call salvar function after editing the field
    }

}

  toggleStatusDropdown(item: any) {
    item.visible = true;
    this.selectedStatus = item.Status;
    // Criar um array contendo o objeto
    const jsonArray = [item];

  }

  updateTooltipPosition(event: MouseEvent) {
    this.tooltipPosition = { x: event.clientX, y: event.clientY + 10 }; // Adicione um valor positivo para deslocar o tooltip para baixo
  }


  showTooltipForItem(item: any) {
    if (item.Coment !== '' && item.Coment !== undefined) {
      this.showTooltip = true;
      this.itemToShowTooltipFor = item;
    }
  }

  hideTooltip() {
    this.showTooltip = false;
    this.itemToShowTooltipFor = null;
  }

  async saveStatus(item: any) {
    item.StatusWork = this.selectedStatus;
    item.visible = false;

    // Criar um array contendo o objeto
    const jsonArray = [item];

    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      // Successfully saved to the database
    }, error => {
      console.log(error);
    });

    this.dialogOpen = false;

    await this.resetStatusDropdown(item);


    await this.salvarField(item); // Call salvar function after editing the field
    await this.ngOnInit();
    await this.filtrarItens();
  }

  async cancelStatus(item: any) {
    await this.resetStatusDropdown(item);

    await this.ngOnInit();
    await this.filtrarItens(); // Espera pela filtragem assíncrona

  }


  async resetStatusDropdown(item: any) {
    console.log('Before resetting visible:', item.visible);
    item.visible = false;
    console.log('After resetting visible:', item.visible);

    const jsonArray = [item];
    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.log('Error:', error);
    });

    this.selectedStatus = '';

  }


  salvarField(item: any) {

    // Criar um array contendo o objeto
    const jsonArray = [item];

    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {
      // Successfully saved to the database
    }, error => {
      console.log(error);
    });

    this.dialogOpen = false;
    setTimeout(() => {
      this.getItemsFromDynamoDB();
    }, 200);
  }




  deleteItem(ID: string): void {
    this.dynamoDBService.deleteItem(ID, this.urlSalva, this.query).subscribe(
      response => {
        setTimeout(() => {
          this.ngOnInit();

        }, 400); // Ajuste o tempo de atraso conforme necessário
      },
      error => {
        // Lógica para lidar com erros durante a deleção do item
      }
    );

  }

  cancel(): void {
    this.dialogOpen = false;
    this.dialogAddViagem = false;
  }
  converterData(stringData: string): string {
    const partes = stringData.split('/');
    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];

    return `${ano}-${mes}-${dia}`;
  }

  aplicarFiltroPorData(): void {
    if (this.filtroDataInicio && this.filtroDataTermino) {
      const filtroInicio = new Date(this.filtroDataInicio);
      const filtroTermino = new Date(this.filtroDataTermino);

      this.itemsFiltrados = this.items.filter(item => {
        const dataFormatada = this.converterData(item.ATA);
        const dataItem = new Date(dataFormatada);

        return dataItem >= filtroInicio && dataItem <= filtroTermino;
      });
    } else {
      this.itemsFiltrados = this.items;
    }
  }



  async getItemsFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamoDBService.getItems(this.query, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.ecos = items.map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
            } else {
              console.error('Invalid items data:', items);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  calculateTotal(item: any): number {
    const pipeline = item.Pipeline !== undefined ? item.Pipeline : 0;
    const stock = item.Stock !== undefined ? item.Stock : 0;
    const call = item.Call !== undefined ? item.Call : 0;
    const db12 = item.DB12 !== undefined ? item.DB12 : 0;
    const custo = item.Custo !== undefined ? item.Custo : 0;

    return (stock + call - db12) * custo;
  }

  async filtrarItens() {
    this.itensFiltrados = this.ecos.filter(item => this.calculateTotal(item) > 0);

    for (const item of this.itensFiltrados) {
      if (item.SOP) {
        item.convertedDateSOP = this.convertPartPeriodToDate(item.SOP);
      }
      if (item.SOCOP) {
        item.convertedDateSOCOP = this.convertPartPeriodToDate(item.SOCOP);
      }
      if (item.SOPDev) {
        item.convertedDateSOPDev = this.convertPartPeriodToDate(item.SOPDev);
      }
      if (item.SOCOPDev) {
        item.convertedDateSOCOPDev = this.convertPartPeriodToDate(item.SOCOPDev);
      }
    }
  }

  isDateBeforeToday(date: Date): boolean {
    const today = new Date();
    return date < today;
  }


  filtrarItensAll() {
    this.itensFiltrados = this.ecos.filter(item => this.calculateTotal(item) !== null);

    for (const item of this.itensFiltrados) {
      if (item.SOP) {
        item.convertedDateSOP = this.convertPartPeriodToDate(item.SOP);
      }
      if (item.SOCOP) {
        item.convertedDateSOCOP = this.convertPartPeriodToDate(item.SOCOP);
      }
      if (item.SOPDev) {
        item.convertedDateSOPDev = this.convertPartPeriodToDate(item.SOPDev);
      }
      if (item.SOCOPDev) {
        item.convertedDateSOCOPDev = this.convertPartPeriodToDate(item.SOCOPDev);
      }
    }
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
    this.itensFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = column === 'TotalCost' ? this.calculateTotal(a) : a[column];
      const valueB = column === 'TotalCost' ? this.calculateTotal(b) : b[column];

      // Handling undefined values
      if (valueA === undefined) {
        return 1 * this.sortDirection;
      }
      if (valueB === undefined) {
        return -1 * this.sortDirection;
      }

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }


  convertPartPeriodToDate(partPeriod: string): Date {
    const year = parseInt(partPeriod.substring(0, 4));
    const month = parseInt(partPeriod.substring(4, 6));
    const period = parseInt(partPeriod.substring(6));

    // Calcula o último dia do mês baseado no mês e no ano
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    // Calcula o dia baseado no período (1 ou 2) e no último dia do mês
    const day = period === 1 ? 15 : lastDayOfMonth;

    const calculatedDate = new Date(year, month - 1, day); // Mês - 1 porque os meses em JavaScript são baseados em 0
    return calculatedDate;
  }




}









