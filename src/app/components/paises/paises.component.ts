import { Component, OnInit } from '@angular/core';
import { Content, Paises } from 'src/app/models/Paises';
import { PaisesService } from 'src/app/services/paises.service';
import swal from 'sweetalert2';
@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.scss'],
})
export class PaisesComponent implements OnInit {
  paises!: Paises;
  content: Content[] = [];
  isAdmin: boolean = true;

  page: number = 0;
  size: number = 10;
  order: string = 'id';
  asc: boolean = true;
  isFirst: boolean = false;
  isLast: boolean = false;
  totalPages!: number;
  totalElements!: number;
  borrado: boolean = false;
  pageSizes: number[] = [5, 10, 15, 25, 50, 100, 250, 500, 1000];
  currentPage: number = 1;
  maxVisiblePages: number = 4; // Número máximo de páginas a mostrar antes y después de los puntos suspensivos

  isFirstPage: boolean = true;
  isLastPage: boolean = false;

  constructor(private paisesServ: PaisesService) {}

  ngOnInit(): void {
    this.getAllPaises();
  }

  getAllPaises(): void {
    this.paisesServ
      .getPaisesBor(this.page, this.size, this.order, this.asc, this.borrado)
      .subscribe(
        (data) => {
          this.paises = data;
          this.isFirst = data.first;
          this.isLast = data.last;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.content = data.content;
          console.log(this.paises);
        },
        (err) => console.error(err.error.message)
      );
  }

  getCurrentPageSize(): number {
    return this.size === this.totalElements ? this.totalElements : this.size;
  }

  viewBorrado(): void {
    this.borrado = !this.borrado;
    if (this.borrado) {
      this.page = 0;
      this.currentPage = 1;
    }
    this.getAllPaises();
  }
  sort(order: string = 'id'): void {
    this.asc = !this.asc;
    this.order = order;
    this.getAllPaises();
  }

  get visiblePagesBefore(): number[] {
    const currentPageIndex = this.currentPage - 1;
    const totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

    const leftIndex = Math.max(0, currentPageIndex - this.maxVisiblePages);
    const visiblePages = totalPagesArray.slice(leftIndex, currentPageIndex);

    if (leftIndex > 0) {
      visiblePages.unshift(0); // Agregar puntos suspensivos si no se muestran todas las páginas
    }

    return visiblePages;
  }

  get visiblePagesAfter(): number[] {
    const currentPageIndex = this.currentPage - 1;
    const totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

    const rightIndex = Math.min(
      this.totalPages,
      currentPageIndex + this.maxVisiblePages
    );
    const visiblePages = totalPagesArray.slice(currentPageIndex, rightIndex);

    if (rightIndex < this.totalPages) {
      visiblePages.push(0); // Agregar puntos suspensivos si no se muestran todas las páginas
    }

    return visiblePages;
  }

  First() {
    if (!this.isFirst) {
      this.currentPage = 1;
      this.page = 0;
      this.updatePageStatus();
      this.getAllPaises();
    }
  }

  Last() {
    if (!this.isLast) {
      this.currentPage = this.totalPages;
      const totalPages = Math.ceil(this.totalElements / this.size);
      this.page = totalPages - 1; // Restamos 1 porque la numeración de páginas comienza en 0
      this.getAllPaises();
    }
  }

  rewind() {
    if (this.currentPage > 1 && !this.isFirst) {
      this.currentPage--;
      this.page--;
      this.updatePageStatus();
      this.getAllPaises();
    }
  }

  forward() {
    if (this.currentPage < this.totalPages && !this.isLast) {
      this.currentPage++;
      this.page++;
      this.updatePageStatus();
      this.getAllPaises();
    }
  }

  private updatePageStatus() {
    this.isFirstPage = this.currentPage === 1;
    this.isLastPage = this.currentPage === this.totalPages;
  }
  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.page = pageNumber - 1;
      this.updatePageStatus();
      this.getAllPaises();
    }
  }

  changeSize(event: Event): void {
    const size = (event.target as HTMLInputElement).value;
    if (size === 'total') {
      this.setPage(0);
      this.page = 0;
      this.currentPage = 1;
      this.size = this.totalElements;
    } else {
      this.currentPage = 1;
      this.size = parseInt(size);
    }
    this.getAllPaises();
  }

  getShowingResultsMessage(): string {
    const startIndex = this.page * this.size;
    const endIndex = Math.min(startIndex + this.size, this.totalElements);
    return `Mostrando ${startIndex + 1} a ${endIndex} de ${
      this.totalElements
    } resultados`;
  }

  deletePais(id: number): void {
    swal
      .fire({
        title: !this.borrado
          ? '¿Estas seguro que quieres eliminar esto?'
          : '¿Estas seguro que quieres restaurar esto?',
        text: !this.borrado
          ? 'Podrás volver a restaurarlo luego!'
          : 'Podrás volver a borrarlo luego!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#5c62ec',
        cancelButtonColor: '#d33',
        confirmButtonText: !this.borrado ? 'Sí, borralo!' : 'Sí, restauralo!',
        cancelButtonText: 'Cancelar',
        customClass: {
          cancelButton: 'outnone',
          confirmButton: 'outnone',
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (!this.borrado) {
            this.paisesServ.deletePais(id).subscribe(
              (res) => {
                console.log(res);
                swal.fire({
                  title: 'Eliminado!',
                  text: res.mensaje,
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#5c62ec',
                  customClass: {
                    confirmButton: 'outnone',
                  },
                });
                this.getAllPaises();
              },
              (err) => {
                console.log(err);
                swal.fire({
                  title: 'Hubo un error!',
                  text: err.error.mensaje,
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#5c62ec',
                  customClass: {
                    confirmButton: 'outnone',
                  },
                });
              }
            );
          } else {
            this.paisesServ.restaurarPais(id).subscribe(
              (res) => {
                console.log(res);
                swal.fire({
                  title: 'Restaurado!',
                  text: res.mensaje,
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#5c62ec',
                  customClass: {
                    confirmButton: 'outnone',
                  },
                });
                this.getAllPaises();
              },
              (err) => {
                console.log(err);
                swal.fire({
                  title: 'Hubo un error!',
                  text: err.error.mensaje,
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#5c62ec',
                  customClass: {
                    confirmButton: 'outnone',
                  },
                });
              }
            );
          }
        }
      });
  }
}
