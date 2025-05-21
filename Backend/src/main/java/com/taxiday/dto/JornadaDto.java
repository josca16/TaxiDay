package com.taxiday.dto;

import com.taxiday.model.Jornada.EstadoJornada;
import com.taxiday.model.Taxista;

import java.time.LocalDateTime;

public class JornadaDto {
    private int idJornada;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFinal;
    private EstadoJornada estado;
    private TaxistaDto taxista; // Usar DTO para el taxista asociado
    private java.util.List<TurnoDto> turnos;

    // Getters y setters añadidos explícitamente

    public int getIdJornada() {
        return idJornada;
    }

    public void setIdJornada(int idJornada) {
        this.idJornada = idJornada;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFinal() {
        return fechaFinal;
    }

    public void setFechaFinal(LocalDateTime fechaFinal) {
        this.fechaFinal = fechaFinal;
    }

    public EstadoJornada getEstado() {
        return estado;
    }

    public void setEstado(EstadoJornada estado) {
        this.estado = estado;
    }

    public TaxistaDto getTaxista() {
        return taxista;
    }

    public void setTaxista(TaxistaDto taxista) {
        this.taxista = taxista;
    }

    public java.util.List<TurnoDto> getTurnos() {
        return turnos;
    }

    public void setTurnos(java.util.List<TurnoDto> turnos) {
        this.turnos = turnos;
    }
} 