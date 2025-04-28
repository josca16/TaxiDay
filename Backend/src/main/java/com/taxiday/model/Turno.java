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
    private Integer idTurno;

    @Column
    private Double kmInicial;

    @Column
    private Double kmFinal;

    @Column(nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime fechaFinal;

    @Enumerated(EnumType.STRING)
    @Column(length = 7)
    private EstadoTurno estado = EstadoTurno.abierto;

    @ManyToOne
    @JoinColumn(name = "idJornada")
    private Jornada jornada;

    public enum EstadoTurno {
        abierto,
        cerrado
    }
}