package com.taxiday.controller;

import com.taxiday.model.Taxista;
import com.taxiday.repository.TaxistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private TaxistaRepository taxistaRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Taxista loginData) {
        Taxista taxista = taxistaRepository.findByLicenciaAndContrasena(
            loginData.getLicencia(), loginData.getContrasena()
        );
        if (taxista == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
        return ResponseEntity.ok(taxista);
    }
}
