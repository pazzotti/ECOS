import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ContratoTransportadoraFormDialogComponent } from './app/home/contrato_transportadora/contrato-transportadora-form-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtualizarComponent } from './atualizar/atualizar.component';
import { FormularioLocaisComponent } from './formulario_locais/formulario_locais';
import { CarrierComponent } from './carriers/carriers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { CarregaJettaComponent } from './carrega-jetta/carrega-jetta.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FornecedoresComponent } from './fornecedores/fornecedores.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatherModule } from 'angular-feather';
import { Camera, ZapOff, Zap, Edit, Delete, PlusCircle, Settings, MessageCircle, AlertTriangle, Meh, ArrowDown, ArrowUp, Anchor } from 'angular-feather/icons';
import { LocaisComponent } from './locais/locais.component';
import { MatInputModule } from '@angular/material/input';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { VeiculosFormDialogComponent } from './app/home/veiculos/veiculos-form-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { ClarityModule } from '@clr/angular';
import { ContratoTerrestreFormDialogComponent } from './app/home/contrato_terrestre/contrato-terrestre-form-dialog.component';
import { ExtraRequestComponent } from './app/home/extra-request/extra-request.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CadastroContratosComponent } from './cadastro-contratos/cadastro-contratos.component';
import { CadastroUsersComponent } from './cadastro-users/cadastro-users.component';
import { CustomDatePipe } from './relatorio/custom-data-pipe';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { FilesUpdateComponent } from './files-update/files-update.component';
import { FollowComponent } from './follow/follow.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { CurrencyFormatPipe } from './follow/CurrencyPipe';


const icons = {
  Camera,
  ZapOff,
  Zap,
  Edit,
  Delete,
  PlusCircle,
  Settings,
  MessageCircle,
  AlertTriangle,
  ArrowUp,
  Anchor,
  ArrowDown,
  Meh
};


@NgModule({
  declarations: [
    CurrencyFormatPipe,
    AppComponent,
    FornecedoresComponent,
    ContratoTransportadoraFormDialogComponent,
    AtualizarComponent,
    DashboardComponent,
    LoginComponent,
    VeiculosFormDialogComponent,
    CadastroComponent,
    FormularioLocaisComponent,
    ExtraRequestComponent,
    ContratoTerrestreFormDialogComponent,
    CarrierComponent,
    CarregaJettaComponent,
    LocaisComponent,
    RelatorioComponent,
    CadastroContratosComponent,
    CadastroUsersComponent,
    CustomDatePipe,
    FilesUpdateComponent,
    FollowComponent


  ],
  imports: [
    MatTableModule,
    MatSortModule,
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
  providers: [DatePipe, { provide: MatDialogRef, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
