package com.taxiday.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "taxista")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Taxista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTaxista") // <-- usa snake_case
    private int idTaxista;

    @Column(length = 50, nullable = false)
    private String nombre;

    @Column(length = 50, nullable = false)
    private String apellidos;

    @Column(length = 20, nullable = false, unique = true)
    private String licencia;

    @Column(length = 255, nullable = false)
    private String contrasena;

    @Column(length = 100, unique = true)
    private String email;

    @Column(length = 15)
    private String telefono;
}
