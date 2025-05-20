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
    @Column(name = "id_jornada") // <-- usa snake_case
    private int idJornada;

    @Column(nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaInicio;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime fechaFinal;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private EstadoJornada estado = EstadoJornada.activa;

    @ManyToOne
    @JoinColumn(name = "id_taxista") // <-- usa snake_case
    private Taxista taxista;

    public enum EstadoJornada {
        activa,
        cerrada
    }
}
