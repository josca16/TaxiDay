package com.taxiday.dto;

// import lombok.Data; // No usar @Data si añadimos getters/setters explícitamente

public class TaxistaDto {
    private int idTaxista;
    private String nombre;
    private String apellidos;
    private String licencia;
    private String email;
    private String telefono;
    private String contrasena;

    // Getters y setters añadidos explícitamente

    public int getIdTaxista() {
        return idTaxista;
    }

    public void setIdTaxista(int idTaxista) {
        this.idTaxista = idTaxista;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getLicencia() {
        return licencia;
    }

    public void setLicencia(String licencia) {
        this.licencia = licencia;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    // Getter y Setter para contrasena
    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    // Constructor o Mappers pueden ser añadidos para convertir desde Taxista entity
} 