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
    @Column(name = "id_taxista")
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

    // Getters añadidos explícitamente para asegurar compatibilidad
    public int getIdTaxista() {
        return idTaxista;
    }

    public String getLicencia() {
        return licencia;
    }

    public String getContrasena() {
        return contrasena;
    }
    
    public String getNombre() {
        return nombre;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefono() {
        return telefono;
    }

    // Setters añadidos explícitamente para asegurar compatibilidad
    public void setIdTaxista(int idTaxista) {
        this.idTaxista = idTaxista;
    }

    public void setLicencia(String licencia) {
        this.licencia = licencia;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
