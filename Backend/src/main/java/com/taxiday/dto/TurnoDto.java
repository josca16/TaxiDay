package com.taxiday.dto;

import com.taxiday.model.Turno.EstadoTurno;

import java.time.LocalDateTime;

public class TurnoDto {
    private Integer idTurno;
    private Double kmInicial;
    private Double kmFinal;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFinal;
    private EstadoTurno estado;
    // No incluir Jornada aquí para evitar referencias circulares y simplificar

    // Getters y setters añadidos explícitamente

    public Integer getIdTurno() {
        return idTurno;
    }

    public void setIdTurno(Integer idTurno) {
        this.idTurno = idTurno;
    }

    public Double getKmInicial() {
        return kmInicial;
    }

    public void setKmInicial(Double kmInicial) {
        this.kmInicial = kmInicial;
    }

    public Double getKmFinal() {
        return kmFinal;
    }

    public void setKmFinal(Double kmFinal) {
        this.kmFinal = kmFinal;
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

    public EstadoTurno getEstado() {
        return estado;
    }

    public void setEstado(EstadoTurno estado) {
        this.estado = estado;
    }
} 