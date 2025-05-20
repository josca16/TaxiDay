package com.taxiday.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jornada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Jornada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jornada") // <-- Revertimos a id_jornada
    private int idJornada;

    @Column(name = "fecha_inicio", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_final", columnDefinition = "DATETIME")
    private LocalDateTime fechaFinal;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private EstadoJornada estado = EstadoJornada.activa;

    @ManyToOne
    @JoinColumn(name = "id_taxista") // Coincidir con init.sql (snake_case)
    private Taxista taxista;

    public enum EstadoJornada {
        activa,
        cerrada
    }

    // Getters y setters añadidos explícitamente para compatibilidad
    public int getIdJornada() {
        return idJornada;
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

    public Taxista getTaxista() {
        return taxista;
    }

    public void setTaxista(Taxista taxista) {
        this.taxista = taxista;
    }
}
