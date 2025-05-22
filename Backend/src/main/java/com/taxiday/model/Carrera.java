package com.taxiday.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "carrera")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrera")
    private Integer idCarrera;

    @Column(name = "fecha_inicio", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(name = "importe_total", nullable = false)
    private Double importeTotal;

    @Column(name = "importe_taximetro", columnDefinition = "DOUBLE DEFAULT 0")
    private Double importeTaximetro;
    
    @Column(name = "propina", insertable = false, updatable = false)
    private Double propina;

    @Column(name = "tipo_pago", length = 10)
    @Enumerated(EnumType.STRING)
    private TipoPago tipoPago = TipoPago.efectivo;
    
    @Column(name = "es_aeropuerto")
    private Boolean esAeropuerto = false;
    
    @Column(name = "es_emisora")
    private Boolean esEmisora = false;

    @ManyToOne
    @JoinColumn(name = "id_turno")
    private Turno turno;

    @Column(name = "notas", length = 255)
    private String notas;

    public enum TipoPago {
        efectivo,
        tarjeta,
        otro
    }

    // Getters y setters añadidos explícitamente para compatibilidad

    public Integer getIdCarrera() {
        return idCarrera;
    }

    public void setIdCarrera(Integer idCarrera) {
        this.idCarrera = idCarrera;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Double getImporteTotal() {
        return importeTotal;
    }

    public void setImporteTotal(Double importeTotal) {
        this.importeTotal = importeTotal;
    }

    public Double getImporteTaximetro() {
        return importeTaximetro;
    }

    public void setImporteTaximetro(Double importeTaximetro) {
        this.importeTaximetro = importeTaximetro;
    }
    
    public Double getPropina() {
        return propina;
    }

    public TipoPago getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(TipoPago tipoPago) {
        this.tipoPago = tipoPago;
    }
    
    public Boolean getEsAeropuerto() {
        return esAeropuerto;
    }
    
    public void setEsAeropuerto(Boolean esAeropuerto) {
        this.esAeropuerto = esAeropuerto;
    }
    
    public Boolean getEsEmisora() {
        return esEmisora;
    }
    
    public void setEsEmisora(Boolean esEmisora) {
        this.esEmisora = esEmisora;
    }

    public Turno getTurno() {
        return turno;
    }

    public void setTurno(Turno turno) {
        this.turno = turno;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}