package com.taxiday.dto;

// import com.taxiday.model.Jornada; // No es necesario si no se incluye el objeto Jornada completo
import com.taxiday.model.Turno.EstadoTurno;
import java.time.LocalDateTime;
import java.util.List;

public class TurnoDto {
    private Integer idTurno;
    private Double kmInicial;
    private Double kmFinal;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFinal;
    private EstadoTurno estado;
    private String notas;
    // private Integer idJornada; // Si necesitas asociarlo a una jornada al crear/actualizar
    private List<CarreraDto> carreras;

    // Getters y setters
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

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public List<CarreraDto> getCarreras() {
        return carreras;
    }

    public void setCarreras(List<CarreraDto> carreras) {
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