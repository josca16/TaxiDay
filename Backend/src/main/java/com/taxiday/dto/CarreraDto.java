package com.taxiday.dto;

import com.taxiday.model.Carrera.TipoPago;

import java.time.LocalDateTime;

public class CarreraDto {
    private Integer idCarrera;
    private LocalDateTime fechaInicio;
    private Double importeTotal;
    private Double importeTaximetro;
    private Double propina;
    private TipoPago tipoPago;
    private Boolean esAeropuerto;
    private Boolean esEmisora;
    private String notas;
    // No incluir Turno aquí para evitar referencias circulares y simplificar

    // Getters y setters añadidos explícitamente

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
    
    public void setPropina(Double propina) {
        this.propina = propina;
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

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
} 