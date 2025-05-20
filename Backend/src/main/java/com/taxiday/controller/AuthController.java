package com.taxiday.controller;

import com.taxiday.dto.LoginRequest;
import com.taxiday.dto.TaxistaDto;
import com.taxiday.model.Taxista;
import com.taxiday.repository.TaxistaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TaxistaRepository repo;

    public AuthController(TaxistaRepository repo) {
        this.repo = repo;
    }

    /**
     * 1) El front envía un JSON con 'licencia' y 'contrasena' (LoginRequest).
     * 2) Buscamos en la BBDD un Taxista con esa licencia.
     * 3) Si no existe o la contraseña no coincide, devolvemos 401.
     * 4) Si todo coincide, devolvemos 200 OK con el objeto Taxista (como TaxistaDto).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1) Buscar en la base de datos un Taxista con esa licencia
        Taxista t = repo.findByLicencia(loginRequest.getLicencia());

        // 2) Comparar la contraseña recibida con la que está en la base
        if (t == null || !t.getContrasena().equals(loginRequest.getContrasena())) {
            // 3) Si no existe o no coincide, devolvemos 401 Unauthorized
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas");
        }

        // 4) Si todo es correcto, devolvemos 200 OK con el Taxista (como DTO)
        TaxistaDto taxistaDto = new TaxistaDto();
        taxistaDto.setIdTaxista(t.getIdTaxista());
        taxistaDto.setLicencia(t.getLicencia());
        taxistaDto.setNombre(t.getNombre());
        taxistaDto.setApellidos(t.getApellidos());
        taxistaDto.setEmail(t.getEmail());
        taxistaDto.setTelefono(t.getTelefono());

        return ResponseEntity.ok(taxistaDto);
    }
    
    // Si tuvieras un endpoint de registro, también podrías usar DTOs (ej: RegisterRequest)
}
