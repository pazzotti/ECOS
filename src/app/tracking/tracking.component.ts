import { AfterViewInit, Component } from '@angular/core';
import maplibregl, { Popup } from 'maplibre-gl';
import { ApiService } from '../services/contratos/contratos.service';
import { AppModule } from '../app.module';
import { Subject, interval } from 'rxjs';
import { Observable, fromEvent } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import supercluster, { PointFeature } from 'supercluster';






@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent {
  apiKey = "v1.public.eyJqdGkiOiJiZjA5NjY4MS1lNjBlLTQ3NjEtODE1NS04MTA3N2VlMWNiNTEifTeO-jM5cgo2q0aCF5-5CtyFzHJCmiVFTtMvb63TqPuCgRHzgAp4fToOmh0qi5GP6zsNF3cyXkeoOiwBfyDC4zsU6QO-xzjHHzG3tZ19VBwVDnE49556GGEsA-nkfhLgM64WzpJNt_v2C8sZfbl_Pr4EabQDnz8--1r6pe4qcbN4wwpZetb6RxwGfjIkSxSLshpqGCvUSISrzS3jrxhOkp_mbOBx-L8jumjc8YT3NTsmvPS0sdEGmDk5516PX4wRBwHR_Ry2wlbbfq-gH5AMkNZb28KhyVVGezJ3HNhV32FlOPfrbmEovAa-s2DOUZBR00MkZW8wIPgpter9ihwFs5c.ZTA0NDFlODYtNGY5Mi00NWU4LTk1MDgtMmY4YmViYWFhYjUz";
  mapName = "Tracking_Karrara_Claro";
  region = "sa-east-1";
  markerImagePath: string = 'assets/truck.png';
  posicao!: any[];
  urlAtualiza: string = 'https://uj88w4ga9i.execute-api.sa-east-1.amazonaws.com/dev12';
  urlConsulta: string = 'https://4i6nb2mb07.execute-api.sa-east-1.amazonaws.com/dev13';
  query: string = 'Operacao_Interplantas_Karrara';
  query2: string = 'veiculos_lab_Karrara';
  query3: string = 'Itens_Jetta';
  query4: string = 'Porta_Rastreando_JSL';
  query5: string = 'items_Excel_Karrara';
  placaFiltrada!: string;
  posicaoSul!: any[];
  posicaoSulRastreio!: any[];
  filtro: boolean = false;
  subscription: any;
  private placaFiltradaSubject = new Subject<string>();
  posicaoLOTS!: any[];
  posicaoArg!: any[];
  posicaoArgRastreio!: any[];
  constructor(
    private dynamodbService: ApiService,


  ) {
    this.placaFiltrada = '';

  }


  markerCoordinates: [number, number][] = [

  ];

  async ngOnInit(): Promise<void> {

    await this.getPosicaoFromDynamoDB();
    await this.getPosicaoMilkSulFromDynamoDB();
    await this.getPosicaoMilkRastreioFromDynamoDB();
    await this.getPosicaoLOTSFromDynamoDB();
    await this.getPosicaoMilkArgFromDynamoDB();




    setTimeout(() => {

      this.compareAndMergePlates();
      this.compareAndMergePlatesArg();
      this.compareAndMergePlatesLOTS();
      if (this.posicao !== undefined) {
        this.markerCoordinates = this.posicao
          .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
          .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
          .concat(
            this.posicaoSul
              .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
              .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
        )
          .concat(
            this.posicaoArg
              .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
              .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
        );
        console.log("makecoor")
        console.log(this.markerCoordinates)
      }

      this.inicia();
    }, 1500);



    this.subscription = interval(3 * 60 * 1000).subscribe(() => {
      this.getPosicaoFromDynamoDB();
      this.getPosicaoMilkSulFromDynamoDB();
      this.getPosicaoMilkRastreioFromDynamoDB();
      this.getPosicaoLOTSFromDynamoDB();
      this.getPosicaoMilkArgFromDynamoDB();


      setTimeout(() => {
        this.compareAndMergePlatesLOTS();
        this.compareAndMergePlates();
        this.compareAndMergePlatesArg();
        if (this.posicao !== undefined) {
          this.markerCoordinates = this.posicao
            .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
            .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
            .concat(
              this.posicaoSul
                .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
                .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
          )
            .concat(
              this.posicaoArg
                .filter((item: any) => item.Longitude !== undefined && item.Latitude !== undefined && item.Latitude !== null && item.Latitude !== 'None' && item.Latitude !== "")
                .map((item: any) => [item.Longitude, item.Latitude] as [number, number])
            );
        }
        console.log(this.posicao);

      }, 1500);
    });




  }



  inicia(): void {

    const markers: maplibregl.Marker[] = [];
    const map = new maplibregl.Map({
      container: "map",
      style: `https://maps.geo.${this.region}.amazonaws.com/maps/v0/maps/${this.mapName}/style-descriptor?key=${this.apiKey}`,
      center: [-46.56665783189564, -23.712571371830165],
      zoom: 12,
      transformRequest: (url, resourceType) => {
        if (url.startsWith("https://api.mapbox.com")) {
          // Adicione a chave de acesso como parâmetro na URL da requisição
          url += "&access_token=" + this.apiKey;
        }
        return { url };
      }
    });

    const cluster = new supercluster({
      radius: 40, // O raio de agrupamento (em pixels)
      maxZoom: 10, // O zoom máximo em que os agrupamentos serão ativados
    });

    const adicionarMarcadoresImportantes = (locais: any[]) => {
      locais.forEach(local => {
        const { latitude, longitude, popupContent } = local;

        // Crie o marcador
        const marker = new maplibregl.Marker()
          .setLngLat([longitude, latitude]) // Use as coordenadas corretamente como uma tupla [longitude, latitude]
          .addTo(map);

        // Adicione um popup associado ao marcador (opcional)
        if (popupContent) {
          const popup = new maplibregl.Popup({ closeOnClick: false }).setText(popupContent);
          marker.setPopup(popup);
        }
      });
    };

    // Array com informações dos locais importantes
    const locaisImportantes = [
      {
        latitude: -23.712620487057045,
        longitude: -46.56663637422363,
        popupContent: 'Scania Latin América',
      },
      {
        latitude: -23.738863633108867,
        longitude: -46.564072374683434,
        popupContent: 'LCB Scania',
      },
    ];

    // Chame a função para adicionar os marcadores dos locais importantes
    adicionarMarcadoresImportantes(locaisImportantes);

    const atualizarMarcadores = () => {
      // Remover marcadores existentes
      markers.forEach(marker => {
        marker.remove();
      });

      // Limpar a lista de marcadores
      markers.length = 0;

      // Restante do código para adicionar novos marcadores e popups
      this.markerCoordinates.forEach(coordinates => {
        const placa = this.getPosicaoPlaca(coordinates); // Obtenha a placa com base nas coordenadas

        if (this.placaFiltrada !== '' && this.placaFiltrada !== null && this.placaFiltrada !== undefined) {
          if (!placa.toLowerCase().includes(this.placaFiltrada.toLowerCase())) {
            return; // Pula para a próxima iteração do loop
          }
        }

        const marker = new maplibregl.Marker({ element: this.createMarkerElement(this.markerImagePath) })
          .setLngLat(coordinates)
          .addTo(map);

        const endereco = this.getPosicaoEndereco(coordinates); // Obtenha o endereço com base nas coordenadas
        const fornecedor = this.getPosicaoFornecedores(coordinates); // Obtenha o fornecedor com base nas coordenadas

        const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(coordinates)
          .setHTML(`<span style="font-weight: bold; font-size: 1.1em">Placa: ${placa}</span><br>Fornecedores: ${fornecedor}<br>Endereço Atual: ${endereco}`);

        marker.getElement().addEventListener('mouseover', () => {
          popup.addTo(map);
        });

        marker.getElement().addEventListener('mouseout', () => {
          popup.remove();
        });

        markers.push(marker);


      });

      const pointFeatures: PointFeature<any>[] = markers.map(marker => {
        const [longitude, latitude] = marker.getLngLat().toArray();
        return {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        };
      });

      cluster.load(pointFeatures);
      // console.log(pointFeatures);
    };

    const ocultarMarcadores = () => {
      markers.forEach(marker => {
        const placa = this.getPosicaoPlaca(marker.getLngLat().toArray()); // Obtenha a placa do marcador

        if (this.placaFiltrada !== '' && this.placaFiltrada !== null && this.placaFiltrada !== undefined) {
          if (placa !== this.placaFiltrada) {
            marker.getElement().style.display = 'none'; // Oculta o marcador
          } else {
            marker.getElement().style.display = ''; // Exibe o marcador
          }
        }
      });
    };


    // Chamar a função atualizarMarcadores() inicialmente
    atualizarMarcadores();


    // Chamar a função atualizarMarcadores() a cada 3 minutos (180000 milissegundos)
    setInterval(atualizarMarcadores, 18000);


    // Inscrever-se no Observable e chamar a função atualizarMarcadores()
    this.placaFiltradaSubject.subscribe(() => {
      atualizarMarcadores();
    });


    // Chamar a função ocultarMarcadores() sempre que o filtro for alterado
    const inputFiltro = document.getElementById('input-filtro');
    if (inputFiltro) {
      inputFiltro.addEventListener('input', ocultarMarcadores);
    }
  }

  atualizarPlacaFiltrada(event: Event) {
    const target = event.target as HTMLInputElement;
    this.placaFiltrada = target.value;
    this.placaFiltradaSubject.next(this.placaFiltrada);
    // Outras ações que você deseja realizar com base no valor atualizado da placaFiltrada
  }





  private getPosicaoEndereco(coordinates: [number, number]): string {
    const posicao = this.posicao.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoSul = this.posicaoSul.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoArg = this.posicaoArg.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);

    let plate = "";

    if (posicao && posicao.Endereco) {
      plate += posicao.Endereco;
    }

    if (posicaoSul && posicaoSul.Endereco) {
      plate += posicaoSul.Endereco;
    }
    
    if (posicaoArg && posicaoArg.Endereco) {
      plate += posicaoArg.Endereco;
    }

    return plate;
  }


  private getPosicaoPlaca(coordinates: [number, number]): string {
    const posicao = this.posicao.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoSul = this.posicaoSul.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoArg = this.posicaoArg.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);

    let plate = "";

    if (posicao && posicao.Plate) {
      plate += posicao.Plate;
    }

    if (posicaoSul && posicaoSul.Plate) {
      plate += posicaoSul.Plate;
    }
    
    if (posicaoArg && posicaoArg.Plate) {
      plate += posicaoArg.Plate;
    }

    return plate;
  }

  private getPosicaoFornecedores(coordinates: [number, number]): string {
    const posicao = this.posicao.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoSul = this.posicaoSul.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);
    const posicaoArg = this.posicaoArg.find(item => item.Longitude === coordinates[0] && item.Latitude === coordinates[1]);

    let fornecedor = "";

    if (posicao && posicao['Fornecedor 1']) {
      fornecedor += (" - " + posicao['Fornecedor 1']);
    }

    if (posicao && posicao['Fornecedor 2']) {
      fornecedor += (" - " + posicao['Fornecedor 2']);
    }
    if (posicao && posicao['Fornecedor 3']) {
      fornecedor += (" - " + posicao['Fornecedor 3']);
    }
    if (posicao && posicao['Fornecedor 4']) {
      fornecedor += (" - " + posicao['Fornecedor 4']);
    }

    if (posicaoSul && posicaoSul['Fornecedor 1']) {
      fornecedor += (" - " + posicaoSul['Fornecedor 1']);
    }
    if (posicaoSul && posicaoSul['Fornecedor 2']) {
      fornecedor += (" - " + posicaoSul['Fornecedor 2']);
    }
    if (posicaoSul && posicaoSul['Fornecedor 3']) {
      fornecedor += (" - " + posicaoSul['Fornecedor 3']);
    }
    if (posicaoSul && posicaoSul['Fornecedor 4']) {
      fornecedor += (" - " + posicaoSul['Fornecedor 4']);
    }
    
    if (posicaoArg && posicaoArg['Fornecedor 1']) {
      fornecedor += (" - " + posicaoArg['Fornecedor 1']);
    }
    if (posicaoArg && posicaoArg['Fornecedor 2']) {
      fornecedor += (" - " + posicaoArg['Fornecedor 2']);
    }
    if (posicaoArg && posicaoArg['Fornecedor 3']) {
      fornecedor += (" - " + posicaoArg['Fornecedor 3']);
    }
    if (posicaoArg && posicaoArg['Fornecedor 4']) {
      fornecedor += (" - " + posicaoArg['Fornecedor 4']);
    }

    return fornecedor;
  }



  async getPosicaoFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.query, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicao = items
                .map(item => ({ ...item, checked: false }))
                .filter(item => item.ViagemCompleta !== true);
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Filtra os itens com chave 'DataBordo' indefinida
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

  async getPosicaoLOTSFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.query2, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicaoLOTS = items
                .map(item => ({ ...item, checked: false }));
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Filtra os itens com chave 'DataBordo' indefinida
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

  async getPosicaoMilkSulFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.query3, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicaoSul = items
                .map(item => ({ ...item, checked: false }))
                .filter(item => item.Finalizada !== true);
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Filtra os itens com chave 'DataBordo' indefinida e item.Finalizada !== true
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

  async getPosicaoMilkArgFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.query5, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicaoArg = items
                .map(item => ({ ...item, checked: false }))
                .filter(item => item.Finalizada !== true);
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Filtra os itens com chave 'DataBordo' indefinida e item.Finalizada !== true
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

  async getPosicaoMilkRastreioFromDynamoDB(): Promise<void> {
    const filtro = 'all';
    (await this.dynamodbService.getItems(this.query4, this.urlConsulta, filtro)).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          try {
            const items = JSON.parse(response.body);
            if (Array.isArray(items)) {
              this.posicaoSulRastreio = items
                .map(item => ({ ...item, checked: false }))
                .filter(item => item.Finalizada !== true);
              // Adiciona a chave 'checked' a cada item, com valor inicial como false
              // Filtra os itens com chave 'DataBordo' indefinida e item.Finalizada !== true
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

  compareAndMergePlates(): void {
    if (this.posicaoSul && this.posicaoSulRastreio) {
      for (let i = 0; i < this.posicaoSul.length; i++) {
        const plate = this.posicaoSul[i].Plate;
        const matchingPlate = this.posicaoSulRastreio.find(item => item.Plate === plate);
        if (matchingPlate) {
          // Copiar as demais chaves de matchingPlate para this.posicaoSul[i]
          Object.keys(matchingPlate).forEach(key => {
            if (key !== 'Plate') {
              this.posicaoSul[i][key] = matchingPlate[key];
            }
          });
        }
      }
    }
    console.log(this.posicaoSul);
  }
  
  compareAndMergePlatesArg(): void {
    if (this.posicaoArg && this.posicaoSulRastreio) {
      for (let i = 0; i < this.posicaoArg.length; i++) {
        const plate = this.posicaoArg[i].Plate;
        const matchingPlate = this.posicaoSulRastreio.find(item => item.Plate === plate);
        if (matchingPlate) {
          // Copiar as demais chaves de matchingPlate para this.posicaoSul[i]
          Object.keys(matchingPlate).forEach(key => {
            if (key !== 'Plate') {
              this.posicaoArg[i][key] = matchingPlate[key];
            }
          });
        }
      }
    }
    console.log(this.posicaoArg);
  }

  compareAndMergePlatesLOTS(): void {
    if (this.posicao && this.posicaoLOTS) {
      for (let i = 0; i < this.posicao.length; i++) {
        const plate = this.posicao[i].Plate;
        const matchingPlate = this.posicaoLOTS.find(item => item.placa === plate);
        if (matchingPlate) {
          // Copiar as demais chaves de matchingPlate para this.posicaoSul[i]
          Object.keys(matchingPlate).forEach(key => {
            if (key !== 'Plate') {
              this.posicao[i][key] = matchingPlate[key];
            }
          });
        }
      }
    }
    console.log(this.posicao);
  }





  private createMarkerElement(imageUrl: string): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'small-marker';

    const image = document.createElement('img');
    image.src = imageUrl;
    element.appendChild(image);

    return element;
  }
}
