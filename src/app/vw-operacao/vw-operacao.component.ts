import { Component, OnInit } from '@angular/core';
import { format, isToday } from 'date-fns';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription, interval } from 'rxjs';
import { ApiService } from '../services/contratos/contratos.service';
import { AppModule } from '../app.module';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CarregaService } from '../services/carrega_file/carrega.service';

@Component({
  selector: 'app-vw-operacao',
  templateUrl: './vw-operacao.component.html',
  styleUrls: ['./vw-operacao.component.css']
})
export class VwOperacaoComponent implements OnInit {
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
  query: string = 'items_Operacao_VW';
  query2: string = 'Porta_Rastreando_VW';
  query3: string = 'Fornecedores_Karrara_Transport';
  query4: string = 'Carriers';
  query5: string = 'tipos_Veiculos_Karrara';
  data: any;
  editMode!: boolean[];
  informationMode!: boolean[];
  address!: string;
  DataAtual: Date = new Date();
  item: any = {
    ID: '',
    local: '',
    contato: '',
    endereco: '',
    latitude: '',
    longitude: ''
  };
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

  progManual: string[] = [
    'SESE - ProgManual',
    'JSL - ProgManual',

  ];
  selectedDescription!: string;
  Transportadoras!: string;
  listaTransportadoras!: any[];
  dataInvertida: string = '';
  fornecedores1!: any[];
  fornecedores2!: any[];
  fornecedores3!: any[];
  fornecedores4!: any[];
  fornecedoresDescarga1!: any[];
  fornecedoresDescarga2!: any[];
  fornecedoresDescarga3!: any[];
  fornecedoresDescarga4!: any[];
  tipoVeiculo!: any[];
  listaVeiculo1!: any[];
  datadescarga!: string | null;
  tipoVeiculos: any;


  constructor(private dynamoDBService: ApiService, public dialog: MatDialog, private http: HttpClient, private carregaService: CarregaService) {
    this.editMode = [];
    this.informationMode = [];

  }

  ngOnInit() {

    this.getItemsFromDynamoDB();
    this.getFornecedoresFromDynamoDB();
    this.getPosicaoFromDynamoDB();
    this.getCarriersFromDynamoDB();
    this.getTipoVeiculoFromDynamoDB();

    setTimeout(() => {
      this.armazenarLatitudeEmItems();
    }, 1500);

    // Aguardar 1 segundo antes de chamar this.filtra()
    setTimeout(() => {
      this.filtra();
    }, 1500);


    this.subscription = interval(3 * 60 * 1000).subscribe(() => {
      // Chame a função que deseja executar a cada 3 minutos aqui
      this.getItemsFromDynamoDB();
      this.getFornecedoresFromDynamoDB();
      this.getPosicaoFromDynamoDB();
      this.getCarriersFromDynamoDB();
      this.getTipoVeiculoFromDynamoDB();
      setTimeout(() => {
        this.armazenarLatitudeEmItems();
      }, 1500);

      // Aguardar 1 segundo antes de chamar this.filtra()
      setTimeout(() => {
        this.filtra();
      }, 1500);
    });
  }

  addViagem(item: any): void {
    if (Array.isArray(this.carriers)) {
      this.transportadora = this.carriers.map(carrier => carrier.name);
    }

    if (Array.isArray(this.places)) {
      this.locais = this.places.map(places => places.local);
    }

    this.janela1 = '';
    this.janela2 = '';
    this.janela3 = '';
    this.janela4 = '';
    this.janelaDestino1 = '';
    this.janelaDestino2 = '';
    this.janelaDestino3 = '';
    this.janelaDestino4 = '';

    if (item.ID === undefined || item.ID === '') {
      this.janela1 = '';
      this.janela2 = '';
      this.janela3 = '';
      this.janela4 = '';
      this.janelaDestino1 = '';
      this.janelaDestino2 = '';
      this.janelaDestino3 = '';
      this.janelaDestino4 = '';


    } else {
      const datePipe = new DatePipe('en-US');
      const horaMinuto1 = datePipe.transform(item['Janela 1'], 'HH:mm');
      const horaMinuto2 = datePipe.transform(item['Janela 2'], 'HH:mm');
      const horaMinuto3 = datePipe.transform(item['Janela 3'], 'HH:mm');
      const horaMinuto4 = datePipe.transform(item['Janela 4'], 'HH:mm');
      const horaMinutoDestino1 = datePipe.transform(item['JanelaDestino 1'], 'HH:mm');
      const horaMinutoDestino2 = datePipe.transform(item['JanelaDestino 2'], 'HH:mm');
      const horaMinutoDestino3 = datePipe.transform(item['JanelaDestino 3'], 'HH:mm');
      const horaMinutoDestino4 = datePipe.transform(item['JanelaDestino 4'], 'HH:mm');



      this.janela1 = horaMinuto1 ?? this.janela1;
      this.janela2 = horaMinuto2 ?? this.janela2;
      this.janela3 = horaMinuto3 ?? this.janela3;
      this.janela4 = horaMinuto4 ?? this.janela4;
      this.janelaDestino1 = horaMinutoDestino1 ?? this.janelaDestino1;
      this.janelaDestino2 = horaMinutoDestino2 ?? this.janelaDestino2;
      this.janelaDestino3 = horaMinutoDestino3 ?? this.janelaDestino3;
      this.janelaDestino4 = horaMinutoDestino4 ?? this.janelaDestino4;




    }

    this.item.ID = item.ID
    this.item.Transportadora = item.Transportadora;
    this.item.Plate = item.Plate;
    this.item['Transport Type'] = item['Transport Type'];
    this.item['Destino 1'] = item['Destino 1'];
    this.item['Destino 2'] = item['Destino 2'];
    this.item['Destino 3'] = item['Destino 3'];
    this.item['Destino 4'] = item['Destino 4'];
    this.item.datadescarga = this.datadescarga;
    this.item['Fornecedor 1'] = item['Fornecedor 1'];
    this.item['Fornecedor 2'] = item['Fornecedor 2'];
    this.item['Fornecedor 3'] = item['Fornecedor 3'];
    this.item['Fornecedor 4'] = item['Fornecedor 4'];


    if (item.description !== undefined && item.description !== '' && item.description !== null) {
      this.progManual.push(item.description);
    }

    this.item.description = item.description;
    this.dialogAddViagem = true;


    let dateObject = new Date(item.date);
    let day = dateObject.getUTCDate();
    let month = dateObject.getUTCMonth() + 1; // Os meses em JavaScript começam em 0, então é necessário adicionar 1
    let year = dateObject.getUTCFullYear();
    let formattedDate = `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    console.log('data coleta' + formattedDate); // Output: "30-06-2023"
    this.item.date = formattedDate;

    dateObject = new Date(item['JanelaDestino 1']);
    day = dateObject.getUTCDate();
    month = dateObject.getUTCMonth() + 1; // Os meses em JavaScript começam em 0, então é necessário adicionar 1
    year = dateObject.getUTCFullYear();
    formattedDate = `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    console.log('data entrega' + formattedDate); // Output: "30-06-2023"
    this.item.datadescarga = formattedDate;








    this.item['Total Distance'] = item['Total Distance'];
    this.item['Weight Loaded'] = item['Weight Loaded'];
    this.item.Cubage = item.Cubage;
    this.item.itemsLoaded = item.itemsLoaded;

    if (item.description && item.description.toLowerCase().includes('sul')) {
      item.Transportadora = 'TCM';
    }

    if (item.description && item.description.toLowerCase().includes('prog')) {
      item.Transportadora = 'JSL';
    }
    this.Transportadoras = item.Transportadora;
    this.listaTransportadoras = [this.Transportadoras, ...this.transportadora];

    this.fornecedores1 = this.fornecedores.map(fornecedor => fornecedor.local);
    this.fornecedores2 = this.fornecedores.map(fornecedor => fornecedor.local);
    this.fornecedores3 = this.fornecedores.map(fornecedor => fornecedor.local);
    this.fornecedores4 = this.fornecedores.map(fornecedor => fornecedor.local);

    this.listaVeiculo1 = this.tipoVeiculo.map(item => item.modelo);
    this.listaVeiculo1 = [item['Transport Type'], ...this.listaVeiculo1];




    this.item['Transport Type'] = item['Transport Type'];





    this.fornecedoresDescarga1 = this.fornecedores
      .filter(fornecedor => fornecedor.descarga === true)
      .map(fornecedor => fornecedor.local);
    this.fornecedoresDescarga2 = this.fornecedores
      .filter(fornecedor => fornecedor.descarga === true)
      .map(fornecedor => fornecedor.local);
    this.fornecedoresDescarga3 = this.fornecedores
      .filter(fornecedor => fornecedor.descarga === true)
      .map(fornecedor => fornecedor.local);
    this.fornecedoresDescarga4 = this.fornecedores
      .filter(fornecedor => fornecedor.descarga === true)
      .map(fornecedor => fornecedor.local);





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

  salvar2() {

    this.dataInvertida = this.item.date;

    if (this.dataInvertida === '') {
      this.dataInvertida = '2006-04-04';
    }


    const janela1 = this.carregaService.adicionarHora(this.janela1, new Date(this.dataInvertida));
    const janela2 = this.carregaService.adicionarHora(this.janela2, new Date(this.dataInvertida));
    const janela3 = this.carregaService.adicionarHora(this.janela3, new Date(this.dataInvertida));
    const janela4 = this.carregaService.adicionarHora(this.janela4, new Date(this.dataInvertida));
    const janelaDestino1 = this.carregaService.adicionarHora(this.janelaDestino1, new Date(this.dataInvertida));
    const janelaDestino2 = this.carregaService.adicionarHora(this.janelaDestino2, new Date(this.dataInvertida));
    const janelaDestino3 = this.carregaService.adicionarHora(this.janelaDestino3, new Date(this.dataInvertida));
    const janelaDestino4 = this.carregaService.adicionarHora(this.janelaDestino4, new Date(this.dataInvertida));


    if (this.item.ID === undefined) {
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
      console.log(formattedDate);

      this.item.ID = formattedDate.toString();
    }

    if (!isNaN(janela1.getTime())) {
      this.item['Janela 1'] = janela1;
    } else {
      delete this.item['Janela 1'];
    }

    if (!isNaN(janela2.getTime())) {
      this.item['Janela 2'] = janela2;
    } else {
      delete this.item['Janela 2'];
    }
    if (!isNaN(janela3.getTime())) {
      this.item['Janela 3'] = janela3;
    } else {
      delete this.item['Janela 3'];
    }
    if (!isNaN(janela4.getTime())) {
      this.item['Janela 4'] = janela4;
    } else {
      delete this.item['Janela 4'];
    }

    if (!isNaN(janelaDestino1.getTime())) {
      this.item['JanelaDestino 1'] = janelaDestino1;
    } else {
      delete this.item['JanelaDestino 1'];
    }

    if (!isNaN(janelaDestino2.getTime())) {
      this.item['JanelaDestino 2'] = janelaDestino2;
    } else {
      delete this.item['JanelaDestino 2'];
    }
    if (!isNaN(janelaDestino3.getTime())) {
      this.item['JanelaDestino 3'] = janelaDestino3;
    } else {
      delete this.item['JanelaDestino 3'];
    }
    if (!isNaN(janelaDestino4.getTime())) {
      this.item['JanelaDestino 4'] = janelaDestino4;
    } else {
      delete this.item['JanelaDestino 4'];
    }

    this.item.Passos = 0;

    if (this.item['Fornecedor 1'] !== '' && this.item['Fornecedor 1'] !== null && this.item['Fornecedor 1'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Fornecedor 2'] !== '' && this.item['Fornecedor 2'] !== null && this.item['Fornecedor 2'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Fornecedor 3'] !== '' && this.item['Fornecedor 3'] !== null && this.item['Fornecedor 3'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Fornecedor 4'] !== '' && this.item['Fornecedor 4'] !== null && this.item['Fornecedor 4'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }

    if (this.item['Destino 1'] !== '' && this.item['Destino 1'] !== null && this.item['Destino 1'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Destino 2'] !== '' && this.item['Destino 2'] !== null && this.item['Destino 2'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Destino 3'] !== '' && this.item['Destino 3'] !== null && this.item['Destino 3'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }
    if (this.item['Destino 4'] !== '' && this.item['Destino 4'] !== null && this.item['Destino 4'] !== undefined) {
      this.item.Passos = this.item.Passos + 1;
    }


    this.item.tableName = this.query


    // Remover as barras invertidas escapadas
    const itemsDataString = JSON.stringify(this.item); // Acessa a string desejada
    const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string


    // Converter a string JSON para um objeto JavaScript
    const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };

    // Converter o objeto JavaScript de volta para uma string JSON
    const modifiedJsonString = JSON.stringify(jsonObject);

    console.log(modifiedJsonString);

    // Converter a string JSON para um objeto JavaScript
    const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };

    // Criar um array contendo o objeto
    const jsonArray = [jsonObject2];

    this.dynamoDBService.salvar(jsonArray, this.query, this.urlSalva).subscribe(response => {

    }, error => {
      console.log(error);
    });
    this.dialogAddViagem = false;
    setTimeout(() => {
      this.ngOnInit();
    }, 1500);
  }


  salvarFornecedor() {

    if (this.item.ID === undefined || this.item.ID === '') {
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'ddMMyyyyHHmmss');
      console.log(formattedDate);

      this.item = {
        "ID": formattedDate.toString(),
        "contato": this.item.contato,
        "endereco": this.item.endereco,
        "local": this.item.local,
        "latitude": this.item.latitude,
        "longitude": this.item.longitude
      }


    }

    this.item.tableName = this.query3


    // Remover as barras invertidas escapadas
    const itemsDataString = JSON.stringify(this.item); // Acessa a string desejada
    const modifiedString = itemsDataString.replace(/\\"/g, '"'); // Realiza a substituição na string


    // Converter a string JSON para um objeto JavaScript
    const jsonObject = JSON.parse(modifiedString) as { [key: string]: string };

    // Converter o objeto JavaScript de volta para uma string JSON
    const modifiedJsonString = JSON.stringify(jsonObject);

    console.log(modifiedJsonString);

    // Converter a string JSON para um objeto JavaScript
    const jsonObject2 = JSON.parse(modifiedJsonString) as { tableName: string, ID: string, acao: string };

    // Criar um array contendo o objeto
    const jsonArray = [jsonObject2];

    this.dynamoDBService.salvar(jsonArray, this.query3, this.urlSalva).subscribe(response => {

    }, error => {
      console.log(error);
    });
    this.dialogOpen = false;
    setTimeout(() => {
      this.getItemsFromDynamoDB();
    }, 200);
  }

  cancel(): void {
    this.dialogOpen = false;
    this.dialogAddViagem = false;
  }

  editDialog(item: any): void {
    this.item.ID = ''
    this.item.local = item;
    this.item.contato = '';
    this.item.endereco = '';
    this.item.latitude = '';
    this.item.longitude = '';
    this.dialogOpen = true;
  }




  filtra() {
    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Fornecedor 1']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastrado1 = true;
      } else {
        item.cadastrado1 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Fornecedor 2']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastrado2 = true;
      } else {
        item.cadastrado2 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Fornecedor 3']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastrado3 = true;
      } else {
        item.cadastrado3 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Fornecedor 4']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastrado4 = true;
      } else {
        item.cadastrado4 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Destino 1']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastradoDestino1 = true;
      } else {
        item.cadastradoDestino1 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Destino 2']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastradoDestino2 = true;
      } else {
        item.cadastradoDestino2 = false;
      }
    }


    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Destino 3']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastradoDestino3 = true;
      } else {
        item.cadastradoDestino3 = false;
      }
    }

    for (const item of this.items) {
      // Verifica se 'fornecedor' está presente em this.fornecedores
      const fornecedorEncontrado = this.fornecedores.some(fornecedor => fornecedor['local'] === item['Destino 4']);
      // Se fornecedorEncontrado for verdadeiro, significa que 'fornecedor' está presente
      if (fornecedorEncontrado) {
        // Adiciona a chave 'cadastrado' com o valor true ao objeto item
        item.cadastradoDestino4 = true;
      } else {
        item.cadastradoDestino4 = false;
      }
    }



  }

  toggleEditMode(index: number): void {
    this.editMode[index] = !this.editMode[index];
  }
  toggleInformationMode(index: number): void {
    this.informationMode[index] = !this.informationMode[index];
  }


  getFornecedorKeyByIndex(item: any, index: number): string {
    const fornecedorKeys = this.getKeysByPrefix(item, 'Fornecedor');
    return fornecedorKeys[index - 1];
  }

  getDestinoKeyByIndex(item: any, index: number): string {
    const destinoKeys = this.getKeysByPrefix(item, 'Destino');
    return destinoKeys[index - 1];
  }

  getKeysByPrefix(obj: any, prefix: string): string[] {
    return Object.keys(obj).filter(key => key.startsWith(prefix));
  }
  ngOnDestroy() {
    this.searchTextSubscription.unsubscribe();
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
              this.items = items
                .filter(item => item.description && (item.description.toLowerCase().includes('sese') || item.description.toLowerCase().includes('jsl')))
                .filter(item => item.Finalizada !== true)
                .map(item => {
                  const date = new Date(item.date);
                  let janela1Date = null;

                  return {
                    ...item,
                    'Janela 1': item['Janela 1'],
                    'Janela 2': item['Janela 2'],
                    'Janela 3': item['Janela 3'],
                    'Janela 4': item['Janela 4'],
                    'JanelaDestino 1': item['JanelaDestino 1'],
                    'JanelaDestino 2': item['JanelaDestino 2'],
                    'JanelaDestino 3': item['JanelaDestino 3'],
                    'JanelaDestino 4': item['JanelaDestino 4'],
                    // Adicione as outras chaves aqui...
                    checked: false
                  };
                });
              // Restante do código...
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


  async getFornecedoresFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamoDBService.getItems(this.query3, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.fornecedores = items.map(item => ({ ...item, checked: false }));
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

  async getPosicaoFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamoDBService.getItems(this.query2, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicao = items.map(item => ({ ...item, checked: false }));
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

  async getCarriersFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamoDBService.getItems(this.query4, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.carriers = items.map(item => ({ ...item, checked: false }));
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


  async getTipoVeiculoFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamoDBService.getItems(this.query5, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.tipoVeiculo = items.map(item => ({ ...item, checked: false }));
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


  armazenarLatitudeEmItems() {

    for (let i = 0; i < this.items.length; i++) {
      const plate = this.items[i]['Plate'];
      const matchingPosicao = this.posicao.find(obj => obj['ID'] === plate);
      if (matchingPosicao) {
        this.items[i]['Latitude'] = matchingPosicao['Latitude'];
        this.items[i]['Longitude'] = matchingPosicao['Longitude'];
        this.items[i]['Endereco'] = matchingPosicao['Endereco'];
        this.items[i]['data_atualizacao'] = new Date(matchingPosicao['data_atualizacao']);
        this.items[i]['DataBordo'] = new Date(matchingPosicao['DataBordo']);

      }
      if (this.items[i]['DataBordo'] === undefined) {
        this.items[i]['Conexao'] = false;
      } else {
        this.DataAtual = new Date();
        var outraData = new Date(this.items[i]['DataBordo']);

        if (new Date(outraData.setHours(outraData.getHours() + 1)) > this.DataAtual) {
          this.items[i]['Conexao'] = true;
        } else {
          this.items[i]['Conexao'] = false;
        }
      }

    }
  }



  acaoDeClique(item: any, NomePasso: string, NomeBotao: string, NomeDestino: string) {
    if (item[NomeBotao] === false) {
      // Executa ação 1
      this.editDialog(item[NomeDestino]);
    } else {
      // Executa ação 2
      this.finalizaPasso(NomePasso, item);
    }
  }

  finalizaPasso(Passo: string, item: any) {
    this.salvar(Passo, item);


    setTimeout(() => {
      this.ngOnInit();
    }, 1500);


  }

  salvar(Passo: String, item: any): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let body = [];
    if (Passo == 'Placa') {
      body = [{
        ...item, // Mantém as chaves existentes
        "ID": item.ID,
        "Plate": item.Plate,

        // Adicione outros campos conforme necessário
      }];

    } else {
      let ValorPasso = 0;
      let ContadorPasso = 0;
      switch (Passo) {
        case 'Passo Fornecedor1':
          ContadorPasso = ContadorPasso + 1;
          if (item['Janela 1'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Fornecedor2':
          ContadorPasso = ContadorPasso + 1;
          if (item['Janela 2'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Fornecedor3':
          ContadorPasso = ContadorPasso + 1;
          if (item['Janela 3'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Fornecedor4':
          ContadorPasso = ContadorPasso + 1;
          if (item['Janela 4'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Destino1':
          ContadorPasso = ContadorPasso + 1;
          if (item['JanelaDestino 1'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Destino2':
          ContadorPasso = ContadorPasso + 1;
          if (item['JanelaDestino 2'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Destino3':
          ContadorPasso = ContadorPasso + 1;
          if (item['JanelaDestino 3'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;
        case 'Passo Destino4':
          ContadorPasso = ContadorPasso + 1;
          if (item['JanelaDestino 4'] > new Date()) {
            ValorPasso = 1;
          } else {
            ValorPasso = 2;
          }
          break;

      }


      if (item['Passo Fornecedor1'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Fornecedor2'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Fornecedor3'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Fornecedor4'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Destino1'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Destino2'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Destino3'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }
      if (item['Passo Destino4'] > 0) {
        ContadorPasso = ContadorPasso + 1;
      }


      if (parseInt(item['Passos'], 10) === ContadorPasso) {
        body = [{
          ...item, // Mantém as chaves existentes
          "ID": item.ID,
          "Finalizada": true,


          [Passo.toString()]: ValorPasso,

          // Adicione outros campos conforme necessário
        }];

      } else {
        body = [{
          ...item, // Mantém as chaves existentes
          "ID": item.ID,


          [Passo.toString()]: ValorPasso,

          // Adicione outros campos conforme necessário
        }];
      }


    }

    this.dynamoDBService.salvar(body, this.query2, this.urlSalva).subscribe(response => {
      // Atualiza o item no banco de dados com sucesso
    }, error => {
      console.log(error);
      // Lidar com o erro ao atualizar o item no banco de dados
    });
  }


  getItemAntigo(item: any): number {
    for (let i = 0; i < this.itemsAntigo.length; i++) {
      if (this.itemsAntigo[i].ID === item.ID) {
        return i;
      }
    }
    return -1; // Retorna -1 se não encontrar correspondência
  }
}
