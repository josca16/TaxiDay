package com.taxiday.dto;

// import lombok.Data; // No usar @Data si añadimos getters/setters explícitamente

public class LoginRequest {
    private String licencia;
    private String contrasena;

    // Getters y setters añadidos explícitamente

    public String getLicencia() {
        return licencia;
    }

    public void setLicencia(String licencia) {
        this.licencia = licencia;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
} 