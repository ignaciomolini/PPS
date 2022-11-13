import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'alta-empleado',
    loadChildren: () => import('./alta-empleado/alta-empleado.module').then( m => m.AltaEmpleadoPageModule)
  },
  {
    path: 'alta-cliente',
    loadChildren: () => import('./alta-cliente/alta-cliente.module').then( m => m.AltaClientePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'alta-supervisor',
    loadChildren: () => import('./alta-supervisor/alta-supervisor.module').then( m => m.AltaSupervisorPageModule)
  },
  {
    path: 'alta-mesa',
    loadChildren: () => import('./alta-mesa/alta-mesa.module').then( m => m.AltaMesaPageModule)
  },
  {
    path: 'alta-producto',
    loadChildren: () => import('./alta-producto/alta-producto.module').then( m => m.AltaProductoPageModule)
  },
  {
    path: 'generar-qr',
    loadChildren: () => import('./generar-qr/generar-qr.module').then( m => m.GenerarQRPageModule)
  },
  {
    path: 'home-cliente',
    loadChildren: () => import('./home-cliente/home-cliente.module').then( m => m.HomeClientePageModule)
  },
  {
    path: 'home-metre',
    loadChildren: () => import('./home-metre/home-metre.module').then( m => m.HomeMetrePageModule)
  },
  {
    path: 'home-mozo',
    loadChildren: () => import('./home-mozo/home-mozo.module').then( m => m.HomeMozoPageModule)
  },
  {
    path: 'home-cocina',
    loadChildren: () => import('./home-cocina/home-cocina.module').then( m => m.HomeCocinaPageModule)
  },
  {
    path: 'encuesta-empleados',
    loadChildren: () => import('./encuesta-empleados/encuesta-empleados.module').then( m => m.EncuestaEmpleadosPageModule)
  },
  {
    path: 'listado-clientes',
    loadChildren: () => import('./listado-clientes/listado-clientes.module').then( m => m.ListadoClientesPageModule)
  },
  {
    path: 'reservas',
    loadChildren: () => import('./reservas/reservas.module').then( m => m.ReservasPageModule)
  },
  {
    path: 'lista-espera',
    loadChildren: () => import('./lista-espera/lista-espera.module').then( m => m.ListaEsperaPageModule)
  },  {
    path: 'encuesta-clientes',
    loadChildren: () => import('./encuesta-clientes/encuesta-clientes.module').then( m => m.EncuestaClientesPageModule)
  },
  {
    path: 'home-cliente-mesa',
    loadChildren: () => import('./home-cliente-mesa/home-cliente-mesa.module').then( m => m.HomeClienteMesaPageModule)
  },
  {
    path: 'encuesta-supervisor',
    loadChildren: () => import('./encuesta-supervisor/encuesta-supervisor.module').then( m => m.EncuestaSupervisorPageModule)
  },
  {
    path: 'alta-anonimo',
    loadChildren: () => import('./alta-anonimo/alta-anonimo.module').then( m => m.AltaAnonimoPageModule)
  },
  {
    path: 'listado-productos',
    loadChildren: () => import('./listado-productos/listado-productos.module').then( m => m.ListadoProductosPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'gestion-mesas',
    loadChildren: () => import('./gestion-mesas/gestion-mesas.module').then( m => m.GestionMesasPageModule)
  },
  {
    path: 'mozo-ver-pedido',
    loadChildren: () => import('./mozo-ver-pedido/mozo-ver-pedido.module').then( m => m.MozoVerPedidoPageModule)
  },
  {
    path: 'estado-pedido',
    loadChildren: () => import('./estado-pedido/estado-pedido.module').then( m => m.EstadoPedidoPageModule)
  },
  {
    path: 'cierre-mesa',
    loadChildren: () => import('./cierre-mesa/cierre-mesa.module').then( m => m.CierreMesaPageModule)
  },
  {
    path: 'gestion-usuarios',
    loadChildren: () => import('./gestion-usuarios/gestion-usuarios.module').then( m => m.GestionUsuariosPageModule)
  },
  {
    path: 'historial-usuario',
    loadChildren: () => import('./historial-usuario/historial-usuario.module').then( m => m.HistorialUsuarioPageModule)
  },
  {
    path: 'resultados-encuestas-cliente',
    loadChildren: () => import('./resultados-encuestas-cliente/resultados-encuestas-cliente.module').then( m => m.ResultadosEncuestasClientePageModule)
  },
  {
    path: 'resultados-encuestas-empleado',
    loadChildren: () => import('./resultados-encuestas-empleado/resultados-encuestas-empleado.module').then( m => m.ResultadosEncuestasEmpleadoPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
