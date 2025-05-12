package com.taxiday.controller;

import com.taxiday.model.Taxista;
import com.taxiday.repository.TaxistaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final TaxistaRepository repo;

    public AuthController(TaxistaRepository repo) {
        this.repo = repo;
    }

    /**
     * 1) El front envía un JSON con 'licencia' y 'contrasena'.
     * 2) Lo convertimos en un Map para extraer esos valores.
     * 3) Buscamos en la BBDD un Taxista con esa licencia.
     * 4) Si no existe o la contraseña no coincide, devolvemos 401.
     * 5) Si todo coincide, devolvemos 200 OK con un mensaje de éxito.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String,String> body) {
        // 1) Sacar los datos que envía el cliente (JSON -> Map)
        String licencia   = body.get("licencia");
        String contrasena = body.get("contrasena");

        // 2) Buscar en la base de datos un Taxista con esa licencia
        Taxista t = repo.findByLicencia(licencia);

        // 3) Comparar la contraseña recibida con la que está en la base
        if (t == null || !t.getContrasena().equals(contrasena)) {
            // 4) Si no existe o no coincide, devolvemos 401 Unauthorized
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas");
        }

        // 5) Si todo es correcto, devolvemos 200 OK
        return ResponseEntity.ok("Login correcto");
    }
}
