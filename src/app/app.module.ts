import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { FormsModule } from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { ContratoTransportadoraFormDialogComponent } from './app/home/contrato_transportadora/contrato-transportadora-form-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtualizarComponent } from './atualizar/atualizar.component';
import { ContratoTransportadoraComponent } from './contrato-transportadora/contrato-transportadora.component';
import { FormularioLocaisComponent } from './formulario_locais/formulario_locais';
import { MilkRunSulComponent } from './milk_run_sul/milk_run_sul.component';
import { CarrierComponent } from './carriers/carriers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { CarregaJettaComponent } from './carrega-jetta/carrega-jetta.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FornecedoresComponent } from './fornecedores/fornecedores.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatherModule } from 'angular-feather';
import { Camera, ZapOff, Zap, Edit, Delete, PlusCircle, Settings, MessageCircle, AlertTriangle } from 'angular-feather/icons';
import { MilkRunSPComponent } from './milk-run-sp/milk-run-sp.component';
import { MilkRunARGComponent } from './milk-run-arg/milk-run-arg.component';
import { InterplantasComponent } from './interplantas/interplantas.component';
import { TimeTableComponent } from './timetable/timetable.component';
import { LocaisComponent } from './locais/locais.component';
import { MatInputModule } from '@angular/material/input';
import { VeiculosLabComponent } from './veiculos-lab/veiculos-lab.component';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { VeiculosFormDialogComponent } from './app/home/veiculos/veiculos-form-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { ClarityModule } from '@clr/angular';
import { TrackingComponent } from './tracking/tracking.component';
import { ContratoTerrestreFormDialogComponent } from './app/home/contrato_terrestre/contrato-terrestre-form-dialog.component';
import { ExtraRequestComponent } from './app/home/extra-request/extra-request.component';
import { ExtraFreightComponent } from './extra-freight/extra-freight.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CadastroCarriersComponent } from './cadastro-carriers/cadastro-carriers.component';
import { CadastroContratosComponent } from './cadastro-contratos/cadastro-contratos.component';
import { CadastroUsersComponent } from './cadastro-users/cadastro-users.component';
import { CustomDatePipe } from './relatorio/custom-data-pipe';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { VwAtualizaComponent } from './vw-atualiza/vw-atualiza.component';
import { VwOperacaoComponent } from './vw-operacao/vw-operacao.component';
import { VwTrackingComponent } from './vw-tracking/vw-tracking.component';
import { TipoVeiculoComponent } from './tipo-veiculo/tipo-veiculo.component';


const icons = {
  Camera,
  ZapOff,
  Zap,
  Edit,
  Delete,
  PlusCircle,
  Settings,
  MessageCircle,
  AlertTriangle
};


@NgModule({
  declarations: [
    AppComponent,
    FornecedoresComponent,
    ContratoTransportadoraFormDialogComponent,
    AtualizarComponent,
    DashboardComponent,
    ContratoTransportadoraComponent,
    LoginComponent,
    VeiculosFormDialogComponent,
    CadastroComponent,
    FormularioLocaisComponent,
    ExtraRequestComponent,
    ExtraFreightComponent,
    ContratoTerrestreFormDialogComponent,
    MilkRunSulComponent,
    CarrierComponent,
    CarregaJettaComponent,
    MilkRunSPComponent,
    MilkRunARGComponent,
    InterplantasComponent,
    TimeTableComponent,
    LocaisComponent,
    VeiculosLabComponent,
    TrackingComponent,
    RelatorioComponent,
    CadastroCarriersComponent,
    CadastroContratosComponent,
    CadastroUsersComponent,
    CustomDatePipe,
    VwAtualizaComponent,
    VwOperacaoComponent,
    VwTrackingComponent,
    TipoVeiculoComponent


  ],
  imports: [
    AppRoutingModule,
    MatIconModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    ClarityModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FeatherModule.pick(icons),
    FormsModule,
    MatFormFieldModule,
    HeaderModule,
    HttpClientModule,
    HighchartsChartModule,
    MatDialogModule,
    MatInputModule,
    BrowserModule,
    ProgressbarModule.forRoot(),
    FormsModule


  ],
  providers: [DatePipe,{provide:MatDialogRef,useValue:{}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
