package com.taxiday.dto;

// import com.taxiday.model.Jornada; // No es necesario si no se incluye el objeto Jornada completo
import com.taxiday.model.Turno.EstadoTurno;
import java.time.LocalDateTime;

public class TurnoDto {
    private int idTurno;
    private double kmInicial;
    private double kmFinal;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFinal;
    private EstadoTurno estado;
    // private Integer idJornada; // Si necesitas asociarlo a una jornada al crear/actualizar
    private java.util.List<CarreraDto> carreras;

    // Getters y setters
    public int getIdTurno() {
        return idTurno;
    }

    public void setIdTurno(int idTurno) {
        this.idTurno = idTurno;
    }

    public double getKmInicial() {
        return kmInicial;
    }

    public void setKmInicial(double kmInicial) {
        this.kmInicial = kmInicial;
    }

    public double getKmFinal() {
        return kmFinal;
    }

    public void setKmFinal(double kmFinal) {
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

    public java.util.List<CarreraDto> getCarreras() {
        return carreras;
    }

    public void setCarreras(java.util.List<CarreraDto> carreras) {
        this.carreras = carreras;
    }

    /* // Si añades idJornada
    public Integer getIdJornada() {
        return idJornada;
    }

    public void setIdJornada(Integer idJornada) {
        this.idJornada = idJornada;
    }
    */
} 