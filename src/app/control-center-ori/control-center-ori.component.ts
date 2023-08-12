import { Component, ViewChild } from '@angular/core';
import { Injectable } from '@angular/core';
import { ChangeDetectorRef, OnInit } from '@angular/core';
import { ApiService } from '../services/service.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, Subscription, debounceTime, map, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ControlCenterService } from '../services/control-center.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-control-center-ori',
  templateUrl: './control-center-ori.component.html',
  styleUrls: ['./control-center-ori.component.css']
})
export class ControlCenterOriComponent {
  
  items: any[] = [];
  itemsCompletos: any[] = [];
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
  data: any;
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  // urlConsulta: string = 'https://4loim5jtph.execute-api.sa-east-1.amazonaws.com/getcc/';
  query: string = 'controlCenterDB';
  base: number = 3;
  ID: number = Date.now();
  comentario: string = "";
  exponent: number = 22;
  $even: any;
  $odd: any;
  dataSource: any;
  dialogRef: any;
  items$!: Observable<any[]>;
  itemsCompletos$!: Observable<any[]>;
  dadosCamera: any[] = []
  filtroData: string = ""; // Variável para armazenar a data do filtro
  count: number = 15;
  p: number = 1;
  startDateFilter!: Date;// Data de início do intervalo selecionado
  endDateFilter!: Date; // Data de término do intervalo selecionado
  timeStay: number = 0;
  endDate: Date = new Date();
  startDate: Date = new Date();
  endDateIni: Date = new Date();
  startDateIni: Date = new Date();
  loading: boolean = true;
  timeStayMax: number = 60;
  averageTime: number = 0;
  
  
  @ViewChild('dateInput') dateInput: any;
  @ViewChild('dateInput2') dateInput2: any;
  
  

  constructor(public dialog: MatDialog, private dynamodbService: ApiService, private serviceMeu: ControlCenterService, private http: HttpClient, private cdr: ChangeDetectorRef, private datePipe: DatePipe) {
  }
  

  ngOnInit() {
    // this.searchTextSubscription = this.searchTextSubject.pipe(debounceTime(300)).subscribe(() => {
    //   this.filterItems();
    // });
    this.getItemsFromDynamoDB();
  }
  
  async upDate() {
    this.applyFilter();
    // this.calcTimeStay();
  }
  
  clearFilter() {
    this.itemsFiltrados = this.items;
    this.dateInput.nativeElement.value = '';
    this.dateInput2.nativeElement.value = '';
    this.calcularMediaTimeStay();
  }
  
  applyFilter() {
    console.log(this.items)
    if (this.startDateFilter && this.endDateFilter) {
      this.startDate = new Date(this.startDateFilter); // Certifique-se de que this.startDate seja um valor válido no formato de data
      this.startDate.setHours(0, 0, 0, 0); // Define as horas, minutos, segundos e milissegundos para zero
      this.startDate.setDate(this.startDate.getDate() + 1); // Acrescenta um dia

      this.endDate = new Date(this.endDateFilter);
      this.endDate.setHours(0, 0, 0, 0);
      this.endDate.setDate(this.endDate.getDate() + 1); // Acrescenta um dia

      this.itemsFiltrados = this.items.filter(item => {
        const itemDate = new Date(item.entrada); // Altere a propriedade 'entrada' para o campo que contém a data nos seus dados
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= this.startDate && itemDate <= this.endDate;
      });
    } else {
      this.itemsFiltrados = this.items;
    }
    this.calcularMediaTimeStay();
  }
  
  calcularMediaTimeStay() {
    //calcular a media do time Stay
    const valores = this.itemsFiltrados.map(obj => obj.timeStay);
    const soma = valores.reduce((acc, curr) => acc + curr, 0);
    this.averageTime = soma / valores.length;
    // console.log(this.averageTime)
  }
  
  
  // calcTimeStay() {    
  //   this.itemsCompletos.forEach((d, index) => {
  //     const entryDate = new Date(d.entrada);
  //     // console.log(entryDate.getTime())
  //     console.log(entryDate)
  //     const departureDate = new Date(d.saida);
  //     console.log(departureDate)
  //     // console.log(departureDate.getTime())
  //     const timeDifference = departureDate.getTime() - entryDate.getTime();
  //     console.log(timeDifference)
  //     let minutos = (timeDifference / 60000) % 60;     // 60000   = 60 * 1000
  //     let horas = timeDifference / 3600000;      
  //     this.itemsFiltrados[index].timeStay = 

  //     this.itemsFiltrados[index].timeStay = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Diferença em dias
  //     // this.itemsFiltrados[index].timeStay = d.timeStay
  //     console.log(this.itemsFiltrados[index].timeStay)
  //   })
  // }

  // aplicarFiltro() {
  //   this.items = this.itemsCompletos;
  //   var dataFiltrada = new Date(this.filtroData); // Converter a string da data para um objeto Date
  //   if (isNaN(dataFiltrada.getTime())) {
  //     // Verificar se a data é válida
  //     return;
  //   }
  //   // Adicionar um dia à data filtrada
  //   dataFiltrada.setDate(dataFiltrada.getDate() + 1);
  //   console.log(dataFiltrada)
  //   // Filtrar os itens com base na data
  //   this.items = this.items.filter(item => {
  //     const entrada = new Date(item.entrada); // Converter a string da entrada para um objeto Date
  //     return entrada.toDateString() === dataFiltrada.toDateString();
  //   });
  // }
  
  sortByEntryDateDesc() {
    this.items.sort((a, b) => {
      const dateA = new Date(a.entrada);
      const dateB = new Date(b.entrada);
      // console.log("rodou sort")
      return dateB.getTime() - dateA.getTime();
    });
  }

 
  getItemsFromDynamoDB(): void {
    this.loading = true;
    const filtro = 'all';
    this.dynamodbService.getItems(this.query, this.urlConsulta, filtro).subscribe(
      async (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.items = items.map(item => ({ ...item, checked: false }));
              this.itemsCompletos = items.map(item => ({ ...item, checked: false }));

              this.sortByEntryDateDesc();
              this.cdr.detectChanges();
              this.applyFilter(); // Chama this.upDate() após a atribuição de items
              

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
    this.loading = false;
  }
  
  transformCamera() {

  }
  
  sortBy(column: string) {
    console.log(column)
    console.log(this.sortColumn)
    if (this.sortColumn === column) {
      // Reverse the sort direction
      this.sortDirection *= -1;
    } else {
      // Set the new sort column and reset the sort direction
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
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
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const valueA = parseFloat(a[this.sortColumn]);
      const valueB = parseFloat(b[this.sortColumn]);

      if (valueA < valueB) {
        return -1 * this.sortDirection;
      } else if (valueA > valueB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }
  sortByDate(column: string) {
    if (this.sortColumn === column) {
      // Inverte a direção da ordenação
      this.sortDirection *= -1;
    } else {
      // Define a nova coluna de ordenação e redefine a direção da ordenação
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    // Sort the data array based on the selected column and direction
    this.itemsFiltrados.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const dateA = this.parseDate(a[this.sortColumn]);
      const dateB = this.parseDate(b[this.sortColumn]);

      if (dateA < dateB) {
        return -1 * this.sortDirection;
      } else if (dateA > dateB) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }

  parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }


  // filterItems() {
  //   const searchText = this.searchText.toLowerCase();
  //   this.itemsFiltrados = this.items.filter(item => {

  //     // Implemente a lógica de filtragem com base no seu HTML
  //     // Por exemplo, se seus itens tiverem uma propriedade 'Process':
  //     return item.Process.toLowerCase().includes(searchText)
  //       || item.Invoice.toLowerCase().includes(searchText)
  //       || item.Container.toLowerCase().includes(searchText)
  //       || item.Step.toLowerCase().includes(searchText)
  //       || item.Liner.toLowerCase().includes(searchText)
  //       || item.Channel.toLowerCase().includes(searchText)
  //       || item.ATA.toLowerCase().includes(searchText)
  //       || item.Dias.toLowerCase().includes(searchText)
  //       || item.FreeTime.toLowerCase().includes(searchText)
  //       || item.TripCost.toLowerCase().includes(searchText)
  //       || item.Handling.toLowerCase().includes(searchText)
  //       || item.Demurrage.toLowerCase().includes(searchText);
  //   });
  // }

  onSearchTextChanged() {
    this.searchTextSubject.next(this.searchText);
  }
}

/*
import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-control-center-new',
  templateUrl: './control-center-new.component.html',
  styleUrls: ['./control-center-new.component.css']
})
export class ControlCenterNewComponent {
  itens: any[] = [];

  async buscaItens() {
    try {
      const response = await axios.get('https://4loim5jtph.execute-api.sa-east-1.amazonaws.com/getcc');

      this.itens = response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
*/

