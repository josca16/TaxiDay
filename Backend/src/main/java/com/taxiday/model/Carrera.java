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
    private Integer idCarrera;

    @Column(nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private Double importeTotal;

    @Column(columnDefinition = "DOUBLE DEFAULT 0")
    private Double importeTaximetro;

    @Enumerated(EnumType.STRING)
    @Column(length = 7)
    private TipoPago tipoPago = TipoPago.efectivo;

    @ManyToOne
    @JoinColumn(name = "idTurno")
    private Turno turno;

    public enum TipoPago {
        efectivo,
        tarjeta,
        bizum
    }
}