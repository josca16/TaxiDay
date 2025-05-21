package com.taxiday.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "turno")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turno")
    private Integer idTurno;

    @Column(name = "km_inicial")
    private Double kmInicial;

    @Column(name = "km_final")
    private Double kmFinal;

    @Column(name = "fecha_inicio", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_final", columnDefinition = "DATETIME")
    private LocalDateTime fechaFinal;

    @Enumerated(EnumType.STRING)
    @Column(length = 7)
    private EstadoTurno estado = EstadoTurno.abierto;

    @ManyToOne
    @JoinColumn(name = "id_jornada")
    private Jornada jornada;

    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<Carrera> carreras;

    public enum EstadoTurno {
        abierto,
        cerrado
    }

    // Getters y setters añadidos explícitamente para compatibilidad

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

    public Jornada getJornada() {
        return jornada;
    }

    public void setJornada(Jornada jornada) {
        this.jornada = jornada;
    }

    public java.util.List<Carrera> getCarreras() {
        return carreras;
    }

    public void setCarreras(java.util.List<Carrera> carreras) {
        this.carreras = carreras;
    }
}